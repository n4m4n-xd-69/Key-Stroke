# KeyStroke

A typing platform for people who write code: prose and drill practice, syntax-aware
code typing with an AI analysis panel, and a lesson track that teaches the concepts
underneath the snippets.

React + Vite + Tailwind. No backend — all progress lives in `localStorage`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

## What's in it

| Route | What it is |
|---|---|
| `/` | Landing / home — hero, daily goal ring, weekly chart, missions, daily challenge, coach's read, recent activity, badges |
| `/practice` | Module 01 — time, words, quote, drill, custom and zen modes; live WPM / accuracy / errors; keyboard visualiser; session summary |
| `/code` | Module 02 — eleven languages, four difficulties, Prism syntax highlighting, AI right rail (explain, flow, complexity, review, optimise) |
| `/learn`, `/learn/:lang`, `/learn/:lang/:concept` | Module 03 — eight concepts × eleven languages, each with theory → typed code → quiz, plus an AI tutor |
| `/dashboard` | Analytics — WPM growth, accuracy trend, weekly bars, skill radar, 18-week heatmap, personal bests, weak keys, session log |
| `/achievements` | Gamification — level ladder, 18 badges, daily missions, leaderboard |

`⌘K` / `Ctrl+K` opens the command palette from anywhere.

## Architecture

```
src/
  lib/            state, domain logic and integrations — no JSX except providers
    store.jsx     reducer + localStorage persistence + useStats() selector
    typing.js     WPM / accuracy / consistency maths, key maps, grading
    gamification.js  XP curve, levels, badges, streaks, daily missions
    curriculum.js    shared concept syllabus + per-language code table
    content.js       word banks, quotes, drills, snippet library
    ai.js            OpenRouter client with offline fallbacks
    prism.js         syntax tokeniser flattened to one entry per character
    theme.jsx        light / dark, follows the OS until you override it
  components/
    ui/           Button, Card, Segmented, Modal, Toast, Confetti, rings, skeletons
    layout/       AppShell, ThemeToggle, CommandPalette, ErrorBoundary
    charts/       ChartFrame + Recharts wrappers + the validated palette
    typing/       the engine hook, stage, keyboard, live stats, summary
    gamify/       mission strip
  modules/        one folder per feature surface
```

### The typing engine

`useTypingEngine` handles keystrokes on `keydown` rather than through an `<input>`,
so Enter, Backspace and Tab behave predictably and code snippets can auto-consume
the next line's indentation. Mutable counters live in refs; only what renders lives
in state.

Reported figures:

- **net WPM** — correct characters ÷ 5 ÷ minutes
- **accuracy** — correct keystrokes ÷ every keystroke made, so a corrected mistake
  still costs you
- **consistency** — 100 − the coefficient of variation of per-second WPM samples

### Theming

Colours are `R G B` triplets in CSS custom properties (`src/index.css`), consumed by
Tailwind through `rgb(var(--x) / <alpha-value>)`. Dark mode is a selected set of
steps, not an inversion. The resolved theme is stamped on `<html data-theme>` by an
inline script in `index.html` before first paint, so there is no flash.

### Charts

The categorical palette in `src/components/charts/palette.js` was validated against
this app's real chart surfaces (`#ffffff` light, `#141715` dark): lightness band,
chroma floor, colour-vision-deficiency separation, normal-vision separation and
contrast. Three light-mode slots sit below 3:1 contrast, which is why every chart
ships a legend **and** a table view — that is the required relief, not decoration.
Re-run the validator before changing any hex, and never reorder the slots: the
ordering is the CVD-safety mechanism.

No chart in this app uses two y-axes. Where two measures have different scales
(WPM and accuracy) they get two charts.

## AI integration

Configured in `src/lib/config.js`, which is **gitignored**. Copy
`src/lib/config.example.js` to create it:

```js
export const OPENROUTER = {
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: 'sk-or-v1-…',
  models: [
    'openai/gpt-oss-20b:free',
    'cohere/north-mini-code:free',
    'inclusionai/ling-3.0-flash:free',
    'google/gemma-4-26b-a4b-it:free',
  ],
  referer: 'http://localhost:5173',
  title: 'KeyStroke',
};
export const AI_ENABLED = true;
```

Models are tried in order; the next one is used if a model is unavailable or rate
limited. Results are cached per snippet, so switching tabs in the AI rail is free.

Note that `openrouter/free` is not a real model slug — these four are, and all were
verified to return clean JSON. Reasoning models are deliberately excluded: several
emit their chain of thought into `content`, which breaks both the JSON extraction
and the short coaching copy.

**Security:** this key ships to the browser and is readable by anyone who loads the
app. That is fine for local use. Before deploying publicly, move the call behind a
small server-side proxy and have the frontend hit that instead — `chat()` in
`src/lib/ai.js` is the single place to repoint.

Everything degrades gracefully: with no key or no network, code analysis falls back
to a locally computed reading, the coach falls back to rule-based observations, and
AI snippet generation falls back to the bundled library. Only the tutor chat and the
optimise button genuinely require the model.

## Accessibility

- Semantic landmarks, a skip link, and visible brand-coloured focus rings everywhere.
- Modals trap focus, restore it on close, and close on Escape.
- Charts never rely on colour alone: legend, direct values and a table view.
- `prefers-reduced-motion` disables confetti and collapses every transition.
- Live regions on toasts; the typing area is a labelled `textbox` with instructions.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Command palette |
| `Esc` | Restart the current exercise |
| `⇧Tab` | Load a new exercise |
| `Ctrl`/`Alt` + `Backspace` | Delete the previous word |

## Data

Everything is stored under the `keystroke.state.v2` key in `localStorage`: sessions
(capped at the last 400), per-key error stats, XP, streak, unlocked badges, lesson
progress and settings. Nothing leaves the device except the code and stats sent to
OpenRouter when an AI panel is used.
