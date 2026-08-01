/**
 * Provider configuration.
 *
 * This file is COMMITTED and contains no secrets. Keys come from the
 * environment, which is what lets the build run on Cloudflare Pages / Vercel —
 * the previous version was gitignored and the build machine simply couldn't
 * resolve it:
 *
 *     Could not resolve "./config.js" from "src/lib/ai-runner.js"
 *
 * Local development: put the keys in `.env.local` (gitignored).
 * Hosted: set the same names in the dashboard's environment variables.
 *
 * SECURITY: anything prefixed `VITE_` is inlined into the client bundle and is
 * readable by anyone who loads the site. That is the trade-off for a static
 * deploy with no backend. Use spend-limited keys, and move to a serverless
 * proxy before this is public in earnest — `ai-runner.js` is the only file that
 * would need repointing.
 */

const env = import.meta.env ?? {};

export const PROVIDERS = {
  hcnsec: {
    id: 'hcnsec',
    label: 'hcnsec',
    priority: 1,
    endpoint: env.VITE_HCNSEC_ENDPOINT || 'https://api.hcnsec.cn/v1/chat/completions',
    apiKey: env.VITE_HCNSEC_KEY || '',
    supportsStreaming: true,
    /**
     * Ordered by measured latency on a JSON-analysis task:
     *   Qwen3.6-35B-A3B 2.6s · DeepSeek-V4-Pro 3.1s · glm-5.1 4.2s
     *   Kimi-K2.6 6.6s · glm-5.2 8.9s · DeepSeek-V4-Flash 19.8s
     */
    models: ['Qwen3.6-35B-A3B', 'DeepSeek-V4-Pro', 'glm-5.1', 'Kimi-K2.6', 'glm-5.2'],
    /** Models that expose `reasoning_content`, for the chat panel's live thinking. */
    thinkingModels: ['glm-5.1', 'Kimi-K2.6', 'step-3.5-flash', 'step-3.5-flash-2603', 'DeepSeek-V4-Flash'],
  },

  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    priority: 2,
    endpoint: env.VITE_OPENROUTER_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: env.VITE_OPENROUTER_KEY || '',
    supportsStreaming: true,
    models: [
      'openai/gpt-oss-20b:free',
      'cohere/north-mini-code:free',
      'inclusionai/ling-3.0-flash:free',
      'google/gemma-4-26b-a4b-it:free',
    ],
    thinkingModels: [],
    referer: env.VITE_SITE_URL || 'http://localhost:5173',
    title: 'Keystroke',
  },
};

/**
 * Timing knobs for the failover runner.
 *
 * Tuned against real latency: the lead model gets a genuine chance before a
 * hedge is spawned, and each attempt gets long enough for a full 2000-token
 * analysis. Latency-sensitive calls override these per request.
 */
export const AI_TIMING = {
  /** Start the next attempt this long after the previous, without cancelling it. */
  hedgeMs: 6000,
  /** Give up on a single model after this and move down the priority list. */
  modelTimeoutMs: 32_000,
  /** Streaming chat gets longer — thinking models are slow to first content. */
  streamTimeoutMs: 60_000,
  /** Whole-operation ceiling across every attempt. */
  totalTimeoutMs: 90_000,
};

/** Off automatically when no key is present, so a keyless deploy still builds. */
export const AI_ENABLED = env.VITE_AI_ENABLED !== 'false';

/* ── Supabase ──────────────────────────────────────────────────────────────
   Public by design: anything VITE_-prefixed is inlined into the client bundle.
   Safety comes from row-level security (supabase/migrations/0001_init.sql), not
   from this key being secret. `SUPABASE_ENABLED` false means no client is ever
   constructed and the app behaves exactly as it does without cloud sync. */

export const SUPABASE = {
  url: env.VITE_SUPABASE_URL || '',
  anonKey: env.VITE_SUPABASE_ANON_KEY || '',
};

export const SUPABASE_ENABLED = Boolean(SUPABASE.url && SUPABASE.anonKey);
