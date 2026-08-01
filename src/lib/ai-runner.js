import { AI_ENABLED, AI_TIMING, PROVIDERS } from './config.js';

/**
 * The transport layer: provider selection, hedging, failover and streaming.
 *
 * Two rules drive everything here:
 *
 *   1. hcnsec leads, OpenRouter backs it up. Attempts are ordered by provider
 *      priority, then by measured model speed.
 *   2. Nothing is allowed to hang. Each attempt has its own timeout, and the
 *      next attempt starts *while the previous is still running* rather than
 *      after it fails — a slow model costs a hedge delay, not a full timeout.
 *
 * The first attempt to produce a usable answer wins and every other in-flight
 * request is aborted.
 */

export class AIUnavailable extends Error {
  constructor(message, reason = 'network', meta = {}) {
    super(message);
    this.reason = reason;
    this.meta = meta;
  }
}

export const AI_REASON_COPY = {
  'rate-limit': {
    label: 'Limit reached',
    detail: 'Every configured provider is rate limited right now. OpenRouter\'s free tier resets at 00:00 UTC.',
  },
  auth: { label: 'Key rejected', detail: 'A provider refused its API key. Check src/lib/config.js.' },
  network: { label: 'Unreachable', detail: 'No provider responded. Showing a locally computed reading instead.' },
  timeout: { label: 'Timed out', detail: 'Every model took too long to answer. Try again — a faster one may pick it up.' },
  'no-key': { label: 'No API key', detail: 'Add a provider key to src/lib/config.js to turn the AI features on.' },
  'bad-response': { label: 'Unreadable reply', detail: 'The model answered with something this app could not parse.' },
};

/* ── Attempt planning ──────────────────────────────────────────────────── */

const byPriority = () => Object.values(PROVIDERS).filter((p) => p.apiKey).sort((a, b) => a.priority - b.priority);

/**
 * Interleaves models across providers so the backup provider gets an early
 * slot: hcnsec#1, openrouter#1, hcnsec#2, openrouter#2, … Each provider's own
 * models stay in priority order.
 */
function planAttempts({ thinking = false, maxAttempts = 6 } = {}) {
  const providers = byPriority().map((p) => ({
    provider: p,
    models: thinking && p.thinkingModels?.length ? p.thinkingModels : p.models,
  }));

  const plan = [];
  for (let round = 0; plan.length < maxAttempts; round++) {
    let added = false;
    for (const { provider, models } of providers) {
      if (models[round]) {
        plan.push({ provider, model: models[round] });
        added = true;
        if (plan.length >= maxAttempts) break;
      }
    }
    if (!added) break;
  }
  return plan;
}

export function aiConfigured() {
  return AI_ENABLED && byPriority().length > 0;
}

export function providerSummary() {
  return byPriority().map((p) => ({ id: p.id, label: p.label, models: p.models.length }));
}

/* ── Single request ────────────────────────────────────────────────────── */

function headers(provider) {
  const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` };
  if (provider.id === 'openrouter') {
    h['HTTP-Referer'] = provider.referer;
    h['X-Title'] = provider.title;
  }
  return h;
}

function classify(status, body) {
  if (status === 429) return 'rate-limit';
  if (status === 401 || status === 403) return 'auth';
  return 'network';
}

async function callOnce({ provider, model, messages, maxTokens, temperature, signal, stream, onThinking, onToken }) {
  const res = await fetch(provider.endpoint, {
    method: 'POST',
    headers: headers(provider),
    signal,
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      ...(stream ? { stream: true } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AIUnavailable(`${provider.id}/${model} → ${res.status}`, classify(res.status), {
      status: res.status,
      body: body.slice(0, 200),
    });
  }

  if (!stream) {
    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    const text = msg?.content?.trim();
    if (!text) throw new AIUnavailable(`${provider.id}/${model} returned no content`, 'bad-response');
    return { text, reasoning: msg?.reasoning_content ?? msg?.reasoning ?? '', provider: provider.id, model };
  }

  /* ── SSE ───────────────────────────────────────────────────────────────
     hcnsec and OpenRouter both emit OpenAI-shaped chunks; thinking models put
     their chain of thought in `delta.reasoning_content`, which is what feeds
     the live "thinking" line in the chat panel. */
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let reasoning = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let chunk;
      try {
        chunk = JSON.parse(payload);
      } catch {
        continue; // partial frame; the next read completes it
      }

      const delta = chunk?.choices?.[0]?.delta;
      if (!delta) continue;

      const think = delta.reasoning_content ?? delta.reasoning;
      if (think) {
        reasoning += think;
        onThinking?.(reasoning);
      }
      if (delta.content) {
        content += delta.content;
        onToken?.(content);
      }
    }
  }

  if (!content.trim()) throw new AIUnavailable(`${provider.id}/${model} streamed no content`, 'bad-response');
  return { text: content.trim(), reasoning, provider: provider.id, model };
}

/* ── Hedged runner ─────────────────────────────────────────────────────── */

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('aborted', 'AbortError'));
    }, { once: true });
  });

/**
 * Runs the attempt plan with staggered starts. Returns the first success.
 *
 * Every attempt gets its own AbortController so a winner can cancel the losers
 * — without that, abandoned requests keep burning quota in the background.
 */
export async function complete({
  messages,
  maxTokens = 900,
  temperature = 0.4,
  signal,
  stream = false,
  thinking = false,
  onThinking,
  onToken,
  onAttempt,
} = {}) {
  if (!aiConfigured()) throw new AIUnavailable('No providers configured', 'no-key');

  const plan = planAttempts({ thinking });
  const perAttemptTimeout = stream ? AI_TIMING.streamTimeoutMs : AI_TIMING.modelTimeoutMs;

  const controllers = [];
  let settled = false;
  const errors = [];

  const abortAll = () => controllers.forEach((c) => { try { c.abort(); } catch { /* already done */ } });
  signal?.addEventListener('abort', abortAll, { once: true });

  const overall = setTimeout(abortAll, AI_TIMING.totalTimeoutMs);

  const attempt = async (entry, index) => {
    // Stagger: attempt N starts N × hedgeMs after the first, unless we've won.
    if (index > 0) {
      try {
        await sleep(index * AI_TIMING.hedgeMs, signal);
      } catch {
        return null;
      }
      if (settled) return null;
    }

    const controller = new AbortController();
    controllers.push(controller);
    const timer = setTimeout(() => controller.abort(), perAttemptTimeout);
    onAttempt?.({ provider: entry.provider.id, model: entry.model, index });

    try {
      const result = await callOnce({
        ...entry,
        messages,
        maxTokens,
        temperature,
        stream,
        signal: controller.signal,
        // Only the eventual winner should paint; losers stay silent.
        onThinking: (t) => !settled && onThinking?.(t),
        onToken: (t) => !settled && onToken?.(t),
      });
      return result;
    } catch (err) {
      const reason = err?.name === 'AbortError' ? 'timeout' : (err.reason ?? 'network');
      errors.push(new AIUnavailable(`${entry.provider.id}/${entry.model}: ${err.message}`, reason));
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const runners = plan.map((entry, i) =>
      attempt(entry, i).then((res) => {
        if (res && !settled) {
          settled = true;
          return res;
        }
        if (res) return null;
        return null;
      }),
    );

    // Resolve as soon as any runner produces a result.
    const winner = await new Promise((resolve) => {
      let outstanding = runners.length;
      runners.forEach((r) =>
        r.then((res) => {
          if (res) resolve(res);
          else if (--outstanding === 0) resolve(null);
        }),
      );
    });

    if (winner) {
      abortAll();
      return winner;
    }

    // Everything failed — surface the most actionable reason.
    const priority = ['auth', 'rate-limit', 'bad-response', 'timeout', 'network'];
    const best = priority.find((r) => errors.some((e) => e.reason === r)) ?? 'network';
    throw new AIUnavailable(errors.map((e) => e.message).join(' · ').slice(0, 300) || 'All providers failed', best);
  } finally {
    clearTimeout(overall);
    signal?.removeEventListener?.('abort', abortAll);
  }
}

/** Convenience wrapper returning just the text. */
export async function chat(messages, opts = {}) {
  const { text } = await complete({ messages, ...opts });
  return text;
}
