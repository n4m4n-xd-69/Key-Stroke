/**
 * Compiles content/learn/<language>.md into src/lib/paths.generated.js.
 *
 *   node scripts/build-learn.mjs
 *
 * If content/learn/ is absent or empty this exits 0 without touching the
 * generated file — the existing corpus stays exactly as it is. That matters:
 * the current paths.generated.js is the only copy of 102 authored modules, and
 * a generator that truncates it on an empty source directory would destroy them.
 *
 * The same reasoning extends to a PARTIALLY sourced directory, which is the
 * normal state during the §8 "ship per language" rollout: authoring rust.md
 * must not delete the six paths that have no markdown yet. So paths are MERGED
 * — a language present in content/learn/ is regenerated from it, and every
 * other language already in the generated bundle is carried forward untouched.
 * Both groups are listed on every run, because a carried-forward path is legacy
 * content that has not been through the validation below and should not be
 * mistaken for one that has.
 *
 * Authoring format is documented in docs/prd/02-learn-paths.md §4.3. Validation
 * is strict on purpose (§5): silent tolerance of a thin module is how a corpus
 * ends up with uneven depth.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SRC = 'content/learn';
const OUT = 'src/lib/paths.generated.js';

/** The nine spine stages every path must cover. */
const SPINE = [
  'toolchain', 'values', 'bindings', 'control-flow', 'functions',
  'data-structures', 'composition', 'errors', 'tooling',
];

const MIN_QUESTIONS = 8;
const AUTO_KINDS = new Set(['predict', 'read']);
const KINDS = new Set(['recall', 'predict', 'read', 'apply']);

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

/* ── parsing ──────────────────────────────────────────────────────────── */

function parseFrontMatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) {
    fail(file, 'missing front-matter');
    return [{}, raw];
  }
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const at = line.indexOf(':');
    if (at < 0) continue;
    const key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();
    meta[key] = value.startsWith('[')
      ? value.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
      : value.replace(/^["']|["']$/g, '');
  }
  return [meta, raw.slice(m[0].length)];
}

/**
 * A module is a `### Module N — Title` heading, a block of `> key: value`
 * attributes, then **Learn** / **Practice** / **Misconceptions** / **Questions**
 * sections.
 */
function parseModules(body, file) {
  const chunks = body.split(/^###\s+/m).slice(1);
  const out = [];

  for (const chunk of chunks) {
    const nl = chunk.indexOf('\n');
    const heading = (nl < 0 ? chunk : chunk.slice(0, nl)).trim();
    const rest = nl < 0 ? '' : chunk.slice(nl + 1);

    const hm = heading.match(/^Module\s+(\d+)\s*[—:-]\s*(.+)$/i);
    if (!hm) {
      fail(file, `heading "${heading}" is not "Module <n> — <title>"`);
      continue;
    }
    const number = Number(hm[1]);
    const title = hm[2].trim();
    const where = `${file} module ${number}`;

    const attrs = {};
    for (const line of rest.split(/\r?\n/)) {
      const am = line.match(/^>\s*(\w+):\s*(.+)$/);
      if (!am) continue;
      const [, k, v] = am;
      attrs[k] = v.trim().startsWith('[')
        ? v.trim().slice(1, -1).split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))
        : v.trim();
    }

    const section = (name) => {
      const re = new RegExp(`\\*\\*${name}\\.?\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
      const m = rest.match(re);
      return m ? m[1].trim() : '';
    };

    const learn = section('Learn');
    const practice = section('Practice');
    const misconceptions = section('Misconceptions')
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter(Boolean);

    const questions = [];
    for (const line of section('Questions').split(/\r?\n/)) {
      const qm = line.match(/^\s*\d+\.\s*(?:\[(\w+)\]\s*)?(.+)$/);
      if (!qm) continue;
      const kind = (qm[1] ?? 'recall').toLowerCase();
      if (!KINDS.has(kind)) fail(where, `question kind "${kind}" is not recall|predict|read|apply`);

      // `predict` / `read` are auto-graded and need choices:
      //   ... ? {A | B | C} = 2
      const withChoices = qm[2].match(/^(.*?)\s*\{(.+?)\}\s*=\s*(\d+)\s*$/);
      if (AUTO_KINDS.has(kind) && !withChoices) {
        fail(where, `"${kind}" question needs {choice | choice} = <answer index>`);
        continue;
      }
      questions.push(
        withChoices
          ? {
              kind,
              prompt: withChoices[1].trim(),
              choices: withChoices[2].split('|').map((c) => c.trim()),
              answer: Number(withChoices[3]),
            }
          : { kind, prompt: qm[2].trim() },
      );
    }

    if (!learn) fail(where, 'missing **Learn** section');
    if (!practice) fail(where, 'missing **Practice** section');
    if (questions.length < MIN_QUESTIONS) {
      fail(where, `${questions.length} questions, needs at least ${MIN_QUESTIONS}`);
    }
    for (const q of questions) {
      if (q.choices && (q.answer < 0 || q.answer >= q.choices.length)) {
        fail(where, `answer index ${q.answer} is outside its ${q.choices.length} choices`);
      }
    }

    out.push({
      number,
      title,
      track: attrs.track ?? 'spine',
      stage: attrs.stage ?? null,
      level: attrs.level ?? 'Beginner',
      prereq: Array.isArray(attrs.prereq) ? attrs.prereq : [],
      minutes: Number(attrs.minutes) || 20,
      learn,
      practice,
      misconceptions,
      questions,
    });
  }

  return out;
}

/* ── run ──────────────────────────────────────────────────────────────── */

if (!fs.existsSync(SRC)) {
  console.log(`No ${SRC}/ — leaving ${OUT} untouched.`);
  process.exit(0);
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.md')).sort();
if (!files.length) {
  console.log(`${SRC}/ is empty — leaving ${OUT} untouched.`);
  process.exit(0);
}

const paths = {};

for (const file of files) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const [meta, body] = parseFrontMatter(raw, file);
  const id = meta.id || path.basename(file, '.md');

  if (!meta.title) fail(file, 'front-matter needs a title');
  const modules = parseModules(body, file);
  if (!modules.length) fail(file, 'no modules found');

  const numbers = new Set();
  for (const m of modules) {
    if (numbers.has(m.number)) fail(file, `duplicate module number ${m.number}`);
    numbers.add(m.number);
  }
  for (const m of modules) {
    for (const p of m.prereq) {
      if (!numbers.has(p)) fail(`${file} module ${m.number}`, `prereq ${p} does not exist`);
    }
  }

  // Spine coverage — a path that skips a stage is not a path.
  const covered = new Set(modules.map((m) => m.stage).filter(Boolean));
  const missing = SPINE.filter((s) => !covered.has(s));
  if (missing.length) fail(file, `spine stages not covered: ${missing.join(', ')}`);

  // Group into levels, preserving the shape curriculum.js already consumes.
  const byLevel = new Map();
  for (const m of modules.sort((a, b) => a.number - b.number)) {
    if (!byLevel.has(m.level)) byLevel.set(m.level, []);
    byLevel.get(m.level).push(m);
  }

  const tracks = [...new Set(modules.map((m) => m.track))]
    .filter((t) => t !== 'spine')
    .map((t) => ({
      id: t,
      name: t.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
      modules: modules.filter((m) => m.track === t).map((m) => m.number),
    }));

  /**
   * Checkpoints come from front-matter, one per level:
   *
   *     checkpoint_beginner: Title :: What to build
   *
   * They live on the level rather than a module because they are what closes a
   * level, and curriculum.js already attaches them to the last module of each.
   * Emitting them matters: the bundle being replaced has one per level, and a
   * generator that silently dropped them would quietly delete a third of what
   * the Learn view renders.
   */
  const checkpointFor = (levelName) => {
    const raw = meta[`checkpoint_${levelName.toLowerCase()}`];
    if (!raw) return null;
    const [title, ...rest] = String(raw).split('::');
    const brief = rest.join('::').trim();
    return brief ? { title: title.trim(), brief } : { title: `${levelName} checkpoint`, brief: title.trim() };
  };

  paths[id] = {
    title: meta.title,
    blurb: meta.blurb ?? '',
    levels: [...byLevel.entries()].map(([name, mods]) => ({
      name,
      modules: mods,
      checkpoint: checkpointFor(name),
    })),
    tracks,
  };
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s) with the Learn corpus:\n`);
  for (const e of errors) console.error('  ' + e);
  console.error(`\n${OUT} left untouched.\n`);
  process.exit(1);
}

/* Carry forward any path that has no source markdown yet (see the header).
   Only reached once the sourced paths have validated, so a broken authoring
   run can never rewrite the bundle with a half-merged result. */
const generated = Object.keys(paths);
const carried = [];
if (fs.existsSync(OUT)) {
  const existing = (await import(pathToFileURL(path.resolve(OUT)).href)).PATHS ?? {};
  for (const [id, p] of Object.entries(existing)) {
    if (id in paths) continue;
    paths[id] = p;
    carried.push(id);
  }
}

const moduleCount = Object.values(paths).reduce(
  (a, p) => a + p.levels.reduce((b, l) => b + l.modules.length, 0),
  0,
);
const questionCount = Object.values(paths).reduce(
  (a, p) => a + p.levels.reduce((b, l) => b + l.modules.reduce((c, m) => c + m.questions.length, 0), 0),
  0,
);

fs.writeFileSync(
  OUT,
  `/**\n * GENERATED — do not edit by hand.\n * Source: ${SRC}/*.md  ·  Rebuild: node scripts/build-learn.mjs\n *\n` +
    ` * ${moduleCount} modules and ${questionCount} questions across ${Object.keys(paths).length} language paths.\n` +
    ` *\n * Authored + validated from source: ${generated.join(', ') || '(none)'}\n` +
    (carried.length
      ? ` * Legacy, carried forward from the previous bundle (pre-dates the\n` +
        ` * validation in build-learn.mjs; questions here are plain strings):\n *   ${carried.join(', ')}\n`
      : '') +
    ` */\n\n` +
    `export const PATHS = ${JSON.stringify(paths, null, 2)};\n`,
);

console.log(`✓ ${moduleCount} modules · ${questionCount} questions → ${OUT}`);
console.log(`  validated from source: ${generated.join(', ') || '(none)'}`);
if (carried.length) {
  console.log(`  carried forward (legacy, unvalidated): ${carried.join(', ')}`);
}
