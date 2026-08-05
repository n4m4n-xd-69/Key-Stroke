import { aiConfigured, generatePassage } from '../ai.js';
import { randomWords } from '../content.js';

/** How long the model gets before the bundled bank wins. */
const AI_BUDGET_MS = 6000;

export const LENGTH_PRESETS = [
  { id: 'sprint', label: 'Sprint', words: 30, timeLimitSec: 60, hint: '~30 words · 60s' },
  { id: 'standard', label: 'Standard', words: 60, timeLimitSec: 120, hint: '~60 words · 2m' },
  { id: 'marathon', label: 'Marathon', words: 130, timeLimitSec: 300, hint: '~130 words · 5m' },
];

export const presetById = (id) => LENGTH_PRESETS.find((p) => p.id === id) ?? LENGTH_PRESETS[1];

/**
 * Picks the one text every player in a room will race.
 *
 * Practice.jsx regenerates on every mount, which is right for solo and fatal
 * here: eight clients calling generatePassage() would produce eight different
 * passages. So this resolves to a single value *before* the room exists, and
 * migration 0009 stores it on the room. Nothing regenerates after that.
 *
 * The model gets a hard budget rather than an open wait. Some of the configured
 * models take 30s on a long prompt (see the latency table in lib/config.js);
 * four people watching a spinner is worse than a bundled passage.
 */
export async function pickBattlePassage({ difficulty = 'normal', words = 60 } = {}) {
  const fallback = {
    text: randomWords(words, difficulty),
    meta: `${words} words · ${difficulty}`,
  };

  if (!aiConfigured()) return fallback;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_BUDGET_MS);

  try {
    const res = await generatePassage({
      mode: 'words',
      difficulty,
      words,
      signal: controller.signal,
    });
    const text = String(res.text ?? '').trim();
    // A model that returns almost nothing is a failure, not a short passage —
    // battle_create rejects anything under 40 characters anyway.
    if (text.length < 60) return fallback;
    return { text, meta: `${res.label ?? 'AI passage'} · ${difficulty}` };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}
