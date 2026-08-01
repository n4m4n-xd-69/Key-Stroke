/**
 * Per-model $/1K-token rates for the AI-spend estimate (PRD 05 §10, open
 * question: "config file, or a model_rates table?"). Config file, for v1 —
 * promote to a table if rates need editing without a redeploy.
 *
 * Only genuinely free models get a real 0 here (their id says so). Every
 * other model is deliberately left unrated rather than guessing a plausible
 * number — an invented rate would look like real spend data. `estimateCost`
 * returns null for anything not listed, and callers must show that as
 * "not configured", never coerce it to 0.
 */
export const MODEL_RATES = {
  'openai/gpt-oss-20b:free': 0,
  'cohere/north-mini-code:free': 0,
  'inclusionai/ling-3.0-flash:free': 0,
  'google/gemma-4-26b-a4b-it:free': 0,
};

export function estimateCost(model, totalTokens) {
  const rate = MODEL_RATES[model];
  if (rate == null || !totalTokens) return rate === 0 ? 0 : null;
  return (totalTokens / 1000) * rate;
}

/** Sums whatever rows have a configured rate; reports how many didn't. */
export function summarizeSpend(rows) {
  let cost = 0;
  let unrated = 0;
  for (const r of rows) {
    const tokens = (r.prompt_tokens ?? 0) + (r.output_tokens ?? 0);
    const c = estimateCost(r.model, tokens);
    if (c == null) unrated += 1;
    else cost += c;
  }
  return { cost, unrated, total: rows.length };
}
