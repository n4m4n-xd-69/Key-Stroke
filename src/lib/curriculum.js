/**
 * The Learn & Practise syllabus.
 *
 * Content is generated from the authored mastery paths in `n4m4n/*.md` — see
 * `paths.generated.js` and `scratchpad/parse-paths.mjs`. Nothing here is
 * invented: every module title, description, practice task and question comes
 * from those files.
 *
 * The questions are open-ended by design, so a module is completed by working
 * through a self-check rather than by picking from multiple choice.
 */

import { PATHS } from './paths.generated.js';
import { LANGUAGE_BY_ID } from './content.js';

/** Only these seven have an authored path; Code typing still covers all eleven. */
export const PATH_LANGUAGE_IDS = ['python', 'c', 'cpp', 'java', 'javascript', 'typescript', 'sql'];

/**
 * Which paths are open.
 *
 * Python is the one path written to the current standard — 24 modules with
 * misconceptions, worked practice tasks and auto-gradable questions. The other
 * six are the earlier, thinner corpus carried forward by the generator; they
 * are listed so the shape of the syllabus is visible, but opening one would
 * promise a depth that is not there yet.
 *
 * Kept as a set rather than a flag on each entry so adding a language is a
 * one-line change here once its markdown lands in content/learn/.
 */
export const AVAILABLE_PATH_IDS = new Set(['python']);

export const isPathAvailable = (id) => AVAILABLE_PATH_IDS.has(id);

export const PATH_LANGUAGES = PATH_LANGUAGE_IDS.map((id) => ({
  ...LANGUAGE_BY_ID[id],
  blurb: PATHS[id]?.blurb ?? '',
  pathTitle: PATHS[id]?.title ?? LANGUAGE_BY_ID[id]?.name,
  available: isPathAvailable(id),
}));

export const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced'];

export const LEVEL_STYLE = {
  Beginner: { tone: 'good', note: 'Foundations you will use every day' },
  Intermediate: { tone: 'brand', note: 'Where the language starts to pay off' },
  Advanced: { tone: 'warn', note: 'Trade-offs, internals and production concerns' },
};

export function pathFor(languageId) {
  return PATHS[languageId] ?? null;
}

/**
 * Flattens a path into an ordered module list. Each entry carries the level it
 * belongs to and whether it is the last module before that level's checkpoint.
 */
export function modulesFor(languageId) {
  const path = PATHS[languageId];
  if (!path) return [];

  const out = [];
  for (const level of path.levels) {
    level.modules.forEach((m, i) => {
      out.push({
        ...m,
        moduleId: `${languageId}:${m.number}`,
        languageId,
        level: level.name,
        index: out.length,
        lastOfLevel: i === level.modules.length - 1,
        checkpoint: i === level.modules.length - 1 ? level.checkpoint : null,
      });
    });
  }
  return out;
}

export function moduleById(moduleId) {
  const [languageId] = String(moduleId).split(':');
  return modulesFor(languageId).find((m) => m.moduleId === moduleId) ?? null;
}

/** Estimated minutes — derived from how much there is to work through. */
export function moduleMinutes(mod) {
  const words = `${mod.learn} ${mod.practice}`.split(/\s+/).length;
  return Math.max(6, Math.round(words / 22) + mod.questions.length * 2);
}

/** A module unlocks when the one before it is done; the first is always open. */
export function isUnlocked(modules, index, completed) {
  if (index === 0) return true;
  return completed.includes(modules[index - 1].moduleId);
}

export function trackProgress(languageId, completed) {
  const modules = modulesFor(languageId);
  if (!modules.length) return { done: 0, total: 0, pct: 0 };
  const done = modules.filter((m) => completed.includes(m.moduleId)).length;
  return { done, total: modules.length, pct: done / modules.length };
}

export function levelProgress(languageId, levelName, completed) {
  const modules = modulesFor(languageId).filter((m) => m.level === levelName);
  const done = modules.filter((m) => completed.includes(m.moduleId)).length;
  return { done, total: modules.length, pct: modules.length ? done / modules.length : 0 };
}

/**
 * Totals for the Learn landing header.
 *
 * Counts only what can actually be opened. Advertising 112 modules while six of
 * the seven paths are closed would be a number the page cannot honour.
 */
export function curriculumTotals() {
  let modules = 0;
  let questions = 0;
  const open = PATH_LANGUAGE_IDS.filter(isPathAvailable);
  for (const id of open) {
    for (const m of modulesFor(id)) {
      modules += 1;
      questions += m.questions.length;
    }
  }
  return { modules, questions, languages: open.length };
}
