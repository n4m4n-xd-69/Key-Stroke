import { CORE_SNIPPETS } from './core.js';
import { EXTRA_SNIPPETS } from './extra.js';

export const SNIPPETS = { ...CORE_SNIPPETS, ...EXTRA_SNIPPETS };

/** Every snippet for a language at a difficulty, in a stable order. */
export function snippetsFor(languageId, difficulty) {
  const all = SNIPPETS[languageId] ?? SNIPPETS.javascript;
  const matches = all.filter((s) => s.difficulty === difficulty);
  return (matches.length ? matches : all).map((s) => ({ ...s, language: languageId }));
}

/**
 * Random pick that never returns the snippet already on screen. The old version
 * looked broken because each language had exactly one snippet per difficulty,
 * so "avoid the current one" left nothing to choose from and it handed the same
 * snippet back every time.
 */
export function pickSnippet(languageId, difficulty, avoidTitle) {
  const pool = snippetsFor(languageId, difficulty);
  const fresh = pool.filter((s) => s.title !== avoidTitle);
  const from = fresh.length ? fresh : pool;
  return from[Math.floor(Math.random() * from.length)];
}

export function snippetByTitle(languageId, difficulty, title) {
  return snippetsFor(languageId, difficulty).find((s) => s.title === title) ?? null;
}

/** Total count, used by the picker's "N available" hint. */
export function snippetCount(languageId, difficulty) {
  return snippetsFor(languageId, difficulty).length;
}
