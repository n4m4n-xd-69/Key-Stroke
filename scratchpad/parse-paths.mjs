/**
 * Turns the n4m4n mastery-path markdown into the structured curriculum the
 * Learn module renders. Run from the project root:
 *   node scratchpad/parse-paths.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'n4m4n';
const OUT = 'src/lib/paths.generated.js';

// md file -> the language id the rest of the app already uses
const FILES = [
  ['c.md', 'c'],
  ['cpp.md', 'cpp'],
  ['java.md', 'java'],
  ['python.md', 'python'],
  ['javascript.md', 'javascript'],
  ['typescript.md', 'typescript'],
  ['postgresql.md', 'sql'],
];

function parse(md) {
  const lines = md.replace(/\r/g, '').split('\n');

  const out = { title: '', blurb: '', levels: [] };
  let level = null;
  let module = null;
  let mode = null; // 'learn' | 'practice' | 'questions'

  const flush = () => {
    if (module && level) level.modules.push(module);
    module = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const h1 = trimmed.match(/^# (.+)$/);
    if (h1) {
      out.title = h1[1].replace(/\s*Mastery Path$/i, '').trim();
      // the first non-empty paragraph after the title is the blurb
      for (let j = i + 1; j < lines.length; j++) {
        const t = lines[j].trim();
        if (!t) continue;
        if (t.startsWith('#')) break;
        out.blurb = t;
        break;
      }
      continue;
    }

    const h2 = trimmed.match(/^## (.+)$/);
    if (h2) {
      flush();
      level = { name: h2[1].trim(), modules: [], checkpoint: null };
      out.levels.push(level);
      mode = null;
      continue;
    }

    const h3 = trimmed.match(/^### (.+)$/);
    if (h3) {
      flush();
      const heading = h3[1].trim();

      // "Beginner checkpoint" and "Advanced capstone" are the same thing: the
      // level's closing project, not another module.
      const checkpoint = /\b(checkpoint|capstone)$/i.test(heading);
      if (checkpoint) {
        // the paragraph under a checkpoint heading is the project brief
        const body = [];
        for (let j = i + 1; j < lines.length; j++) {
          const t = lines[j].trim();
          if (t.startsWith('#')) break;
          if (t) body.push(t);
        }
        if (level) level.checkpoint = { title: heading, brief: body.join(' ') };
        mode = null;
        continue;
      }

      const m = heading.match(/^Module\s+(\d+)\s*[—–-]\s*(.+)$/);
      module = {
        number: m ? Number(m[1]) : null,
        title: m ? m[2].trim() : heading,
        learn: '',
        practice: '',
        questions: [],
      };
      mode = 'learn';
      continue;
    }

    if (!module) continue;

    if (/^Practice:/i.test(trimmed)) {
      module.practice = trimmed.replace(/^Practice:\s*/i, '');
      mode = 'practice';
      continue;
    }

    if (/^Questions:/i.test(trimmed)) {
      mode = 'questions';
      continue;
    }

    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numbered && mode === 'questions') {
      module.questions.push(numbered[1]);
      continue;
    }

    if (trimmed && mode === 'learn') {
      module.learn = module.learn ? `${module.learn} ${trimmed}` : trimmed;
    }
  }

  flush();
  return out;
}

const paths = {};
for (const [file, id] of FILES) {
  const md = fs.readFileSync(path.join(SRC, file), 'utf8');
  const parsed = parse(md);

  // A `##` section is a track level only if it actually teaches modules.
  // Mastery checklists, query portfolios and the C/C++ pointer deep-dives are
  // reference material — real content, but not steps on the path.
  const levels = [];
  const extras = [];
  for (const level of parsed.levels) {
    const teaching = level.modules.filter((m) => m.questions.length > 0);
    if (teaching.length) {
      levels.push({ ...level, modules: teaching });
    } else {
      extras.push({
        name: level.name,
        checkpoint: level.checkpoint,
        notes: level.modules.map((m) => ({ title: m.title, body: m.learn })),
      });
    }
  }

  paths[id] = { ...parsed, levels, extras };
}

// ── report ────────────────────────────────────────────────────────────────
let totalModules = 0;
let totalQuestions = 0;
for (const [id, p] of Object.entries(paths)) {
  const mods = p.levels.flatMap((l) => l.modules);
  const qs = mods.reduce((a, m) => a + m.questions.length, 0);
  totalModules += mods.length;
  totalQuestions += qs;
  const missing = mods.filter((m) => !m.learn || !m.practice || !m.questions.length);
  console.log(
    `${id.padEnd(11)} ${String(mods.length).padStart(2)} modules  ${String(qs).padStart(3)} questions  ` +
      `${p.levels.length} levels  ${p.levels.filter((l) => l.checkpoint).length} checkpoints` +
      (missing.length ? `  ⚠ ${missing.length} incomplete` : ''),
  );
}
console.log(`\ntotal: ${totalModules} modules, ${totalQuestions} questions`);

const banner = `/**
 * GENERATED — do not edit by hand.
 * Source: n4m4n/*.md  ·  Regenerate: node scratchpad/parse-paths.mjs
 *
 * ${totalModules} modules and ${totalQuestions} questions across ${Object.keys(paths).length} language paths.
 */

`;

fs.writeFileSync(OUT, banner + `export const PATHS = ${JSON.stringify(paths, null, 2)};\n`);
console.log(`\nwrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
