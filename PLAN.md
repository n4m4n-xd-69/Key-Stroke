# KeyStroke — build plan

Step-by-step planner for the customization pass. Ordered so that each phase
leaves the app in a working state, and so the cheap high-impact fixes land
before the large rewrites.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done
**Effort:** S = under an hour · M = half a day · L = a day or more

---

## The single root cause behind "it shows old webfiles, even the logo"

This is not a caching or a deploy problem. **22 files in `src/` are never imported
by anything**, so editing them changes nothing on screen:

| You edited | What actually renders | Why nothing changed |
|---|---|---|
| `src/components/brand/Logo.jsx` | `AppShell.jsx:252-257` — a hardcoded `<span>k</span>` | `Logo.jsx` is imported by zero files |
| `public/logo.svg`, `public/favicon.svg` | `index.html:11` — a separate inline data-URI SVG | Neither file is referenced anywhere |
| `src/modules/chat/AIChat.jsx` | nothing — no route exists | orphaned |
| `src/lib/auth.jsx`, `sync.js`, `supabase.js` | nothing | `AuthProvider` never mounted, `useCloudSync` never called |
| `src/modules/admin/*` (6 files) | nothing — `/admin` redirects to `/` | no route |
| `LiveStats.jsx`, `DecayCounter.jsx`, `Motion.jsx`, `Switch.jsx`, `IntroPanel.jsx` | nothing | orphaned |

**The good news:** most of what you asked for is already written and only needs
wiring. `AIChat.jsx` is a complete ChatGPT/Grok-style chat page. `DecayCounter.jsx`
exactly solves "WPM drops to 0 the moment you stop". `Logo.jsx` is a proper
vectorised K mark. `LiveStats.jsx` is the live WPM/accuracy readout you want in
the code header. Phase 1 is mostly connecting things, not writing them.

---

## Phase 0 — Repo hygiene *(done)*

- [x] Point `origin` at `github.com/n4m4n-xd-69/Key-Stroke`, drop the old remote
- [x] Gitignore `ai.md`, `database.md`, `.vercel/`, `supabase/.temp/`
- [x] Start a fresh root commit — the old history had the hcnsec key and the
      Supabase postgres password in commit objects, which deleting the files
      does not remove
- [x] Push `main`; old history kept locally on branch `old-history-backup`

> **Open risk, accepted by you:** the hcnsec key and the Supabase direct
> connection string (`postgres:gILIx9dGWPOsp1Th@…`) still exist in the old
> GitHub repo's history and are unrotated. That connection string is the
> `postgres` superuser and bypasses every RLS policy. Rotating is a dashboard
> click whenever you want it; nothing in this plan depends on it.

---

## Phase 1 — Quick wins (S each, do these first)

### 1.1 Fix the AI temperature 400 `[ ]` S
`src/lib/ai.js:223` sends `temperature: 1.1`. hcnsec rejects anything above 1:
`'temperature' value must be less or equal than 1`. Confirmed live in DevTools —
**your fastest provider fails 100% of the time on the app's most frequent AI
call.** Failover hides it, which is why practice text often looks bundled rather
than AI-generated.

- [ ] Clamp `generatePassage` to `temperature: 1`
- [ ] Add a defensive `Math.min(1, temperature)` in `ai-runner.js:callOnce`
- [ ] Make `classify()` return `bad-request` for 400 so this can never go silent again
- **Fixes your report:** "AI generated text according to settings user applied"

### 1.2 WPM must not snap to 0 `[ ]` S
`DecayCounter.jsx` already implements rise-instantly / fall-gradually.

- [ ] Import it in `Practice.jsx` `RunPanel` and use it for the WPM figure
- [ ] Same in the new code-typing live readout (1.6)
- **Fixes your report:** "wpm gives real time updates, if user stops it shows 0 immediately"

### 1.3 Keyboard no longer crowds the passage `[ ]` S
`Practice.jsx:324-328` and `:372-378` — the `KeyboardViz` block sits directly
under the stage with no reserved gap, so it collides with the last line.

- [ ] Give the stage a `min-h` floor and the keyboard wrapper a fixed top margin
- [ ] Verify at 5 and 7 visible lines, windowed and full-screen
- **Fixes your report:** "below keyboard is wrapping the above text content, no space leaving"

### 1.4 `<select value={null}>` warning `[ ]` S
`CodeTyping.jsx:38` starts `selection` as `null` and passes it to a controlled
`<select>` at `:208`.

- [ ] Initialise to the first snippet title instead of `null`

### 1.5 Align hcnsec models with `ai.md` `[ ]` S
`config.js` is missing `step-3.5-flash`, `step-3.5-flash-2603` and
`DeepSeek-V4-Flash` from its `models` list (they appear only under
`thinkingModels`).

- [ ] Sync both lists to `ai.md`, keep the latency ordering comment accurate

### 1.6 Code-typing header: live stats, not buttons `[ ]` S
- [ ] Delete the "Next snippet" / "AI snippet" buttons from the `CodeTyping` header
- [ ] Put `LiveStats.jsx` (already written) there — live WPM, accuracy, errors, elapsed
- [ ] Move the **AI snippet** button to directly *above* the typing area, next to
      the snippet title
- **Fixes your report:** "where is next and ai snippet is written change it with the accuracy, wpm, live realtime" + "add ai snippet button ABOVE CODE TYPING AREA"

---

## Phase 2 — Brand, shell and delight (M)

### 2.1 One logo, everywhere `[ ]` S
- [ ] Render `<Logo/>` in `AppShell` header, replacing the hardcoded `<span>k</span>`
- [ ] Wordmark text → **"KeyStroke"** (capital S) across shell, `index.html` title,
      `package.json`, `site.webmanifest`, `README.md`
- [ ] Generate `favicon.svg` / `icon-192` / `icon-512` / `apple-touch-icon` from
      `LOGO_GLYPH_PATH` so there is exactly one shape to change
- [ ] Reference them from `index.html` — it currently links **none** of your
      `public/` icons, and has no `<link rel="manifest">`
- **Fixes your report:** "update logo, use name KeyStroke"

### 2.2 Top-bar tagline fade `[ ]` S
- [ ] On mount, fade in "type faster, code sharper" beside the wordmark
- [ ] Respect `prefers-reduced-motion` via the existing `useReducedMotionSafe`
- **Fixes your report:** "when refresh text should come fade effect"

### 2.3 GenZ motion pass `[ ]` M
`Motion.jsx` and `lib/motion.js` are written and orphaned — wire them first, then
extend rather than starting fresh.

- [ ] Stagger-reveal cards on route enter
- [ ] Springy hover/press on buttons, nav, chips
- [ ] XP-gain and level-up celebration beats; confetti already exists
- [ ] Streak flame pulse; number roll-ups via the existing `Counter.jsx`
- [ ] Every animation gated on reduced-motion

### 2.4 "Made with Love ♥" `[ ]` S
- [ ] Fixed bottom-left, frosted/crystal glass treatment (reuse the `.glass`
      utility already in `index.css`)
- [ ] Red heart, gentle beat animation, above the mobile tab bar, below modals

### 2.5 About section `[ ]` M
- [ ] New route `/about` + left-rail entry
- [ ] Panels: About KeyStroke · User guide · Follow us
- [ ] Embed the AI helper (Phase 4) scoped to "help me use this app"
- **Fixes your report:** "add About section where user can follow us, about keystroke, user guide, also ai here"

---

## Phase 3 — Database foundation (L) ⚠️ blocks Phases 4–6

Nothing syncs today. `useCloudSync` is never called, `AuthProvider` is never
mounted, `supabase.js` is never imported — despite your keys being set and the
migrations being written.

### 3.1 Repair `sync.js` before wiring it `[x]` S
Two defects that will hard-fail the build/runtime the moment it is imported:

- [ ] `sync.js:26` imports `bumpDaily` from `gamification.js` — **it isn't exported
      there**, it's a private function in `store.jsx:58`. Rollup errors out. Move it
      to `gamification.js` and export it.
- [ ] `sync.js:364,391` read `local.problems`, but `EMPTY` in `store.jsx:9` has no
      `problems` key → `unionProblems(undefined, …)` throws. Add `problems: {}` to
      `EMPTY`.

### 3.2 Mount auth `[x]` S
- [ ] Wrap `<AuthProvider>` in `main.jsx` (inside `ThemeProvider`, outside `StoreProvider`)
- [ ] Render `<AuthModal/>` once from `AppShell`
- [ ] Replace the static avatar `div` in the top bar with `<AccountMenu/>`

### 3.3 Anonymous accounts `[x]` M
"even name is entered, use their data in database without email:pass too"

- [ ] On onboarding name entry, call `supabase.auth.signInAnonymously()`
- [ ] Persist the name to `profiles.display_name`
- [ ] Offer later upgrade to email/Google via `updateUser` — links the same row,
      so no progress is lost
- [ ] **Manual step:** enable Anonymous sign-ins in Supabase dashboard →
      Authentication → Providers

### 3.4 Turn sync on `[x]` M
- [ ] Call `useCloudSync(user, state, dispatch)` from `StoreProvider`
- [ ] Verify: adopt-on-first-signin, focus pull, 2s debounced push, reconnect push
- [ ] Confirm no double-count when the same device signs in twice (`keystroke.adopted` gate)

### 3.5 New tables — migration `0003_chat_and_votes.sql` `[x]` M
- [x] `chat_messages` — user_id, thread_id, role, content, reasoning, created_at
- [x] `beta_votes` — user_id, feature, vote, created_at, unique(user_id, feature)
- [x] `beta_vote_tally` view — aggregate yes/no per feature
- [x] RLS: own-rows write, tally readable by all, admin read-all (mirror `0002`)

### 3.6 AI usage telemetry `[x]` S
`logAiUsage` and `currentUserId` exist in `supabase.js` and are called from
nowhere, so the admin AI-spend tab would always read zero.

- [ ] Call `logAiUsage` from `ai-runner.js` on every settled attempt
- [ ] `streamChat` in `ai.js:129` silently drops the `surface` argument
      `useStreamingChat` passes it — accept and forward it

### 3.7 Admin route `[x]` S
- [ ] Add `/admin` to `App.jsx` (6 finished files currently unreachable)
- [ ] Guard `fetchOverview`/`fetchDaily`/`fetchAuthEvents`/`fetchAiUsage` against a
      null `supabase` — only `fetchMyRole` and `logAdminView` do today

---

## Phase 4 — AI chat, full page (L)

`AIChat.jsx` already gives you: streaming, live "thinking" for reasoning models,
starter prompts, regenerate, edit-and-resend, copy, scroll anchoring, transcript
persistence, and a system prompt already fed the learner's WPM / accuracy / level
/ streak / weak keys. It needs a route and four upgrades.

### 4.1 Wire it `[x]` S
- [ ] Route `/chat` in `App.jsx`
- [ ] Left-rail nav entry with a `MessageSquare` icon
- **Note:** this answers "check if already exists or no, if yes modify it" — it exists.

### 4.2 Grok/ChatGPT-grade UI `[x]` M
- [ ] Thread sidebar: new chat, rename, delete, search
- [ ] Sticky composer, auto-grow, attach-code affordance
- [ ] Message actions on hover; collapsible "thought for Ns" block
- [ ] Full-bleed layout that owns the viewport

### 4.3 Level-aware preloaded suggestions `[x]` M
- [ ] Replace the fixed `STARTERS` array with suggestions keyed off level band,
      weakest keys, current language and recent accuracy trend
- [ ] Refresh them when level or streak changes
- **Fixes your report:** "some pre loaded suggestions, updates as per level increase"

### 4.4 Persist to database `[x]` M
- [ ] Swap the `localStorage` transcript for `chat_messages`
- [ ] Keep localStorage as the offline cache; reconcile on reconnect
- **Fixes your report:** "it should sink with database"

---

## Phase 5 — Typing & code-typing rework (L)

### 5.1 Code-typing full-screen `[ ]` M
- [ ] Port the `focus` pattern from `Practice.jsx:304-338`
- [ ] Persist to `settings.codeFullscreen`
- [ ] Layout: stage centred, live stats + AI panel as side rails
- **Fixes your report:** "add full screen mode in code type area too"

### 5.2 Move the intro above the typing area `[ ]` M
- [ ] Short intro **with examples** directly above the code stage
- [ ] Remove the intro from the right rail entirely
- [ ] `IntroPanel.jsx` (orphaned, 195 lines) is the starting point
- **Fixes your report:** "short intro with examples above code typing area, and there is no intro in the right side part, it shift to above type area"

### 5.3 Right rail becomes a code-aware chat `[ ]` L
Today the rail is `AISidebar` — static tabbed analysis. You want a conversation.

- [ ] Replace with a compact `useStreamingChat` instance seeded with the current snippet
- [ ] Auto-refresh suggestions whenever the snippet changes or AI regenerates it
- [ ] Keep Explain / Flow / Cost as *slash-commands* inside the chat rather than tabs
- [ ] Share thread history with `/chat` so context carries across
- **Fixes your report:** "there is ai chatting in the right part which give some suggestions according to code, and each time code updates by ai"

---

## Phase 6 — Learn beta vote (M)

### 6.1 Banner `[x]` S
- [ ] Header on `/learn`: "Learn is in beta — do you want it? Yes / No"
- [ ] Dismissible; remembers the vote; one vote per user

### 6.2 Tally `[x]` M
- [ ] Write to `beta_votes`, read `beta_vote_tally`
- [ ] Show live yes/no split and total
- [ ] Anonymous users vote too (Phase 3.3)

> **Decided:** the vote is **informational only**. No automatic gating, no feature
> flag — just collect and display the split. If the majority says no, you remove
> Learn by hand and put something else there. This makes 6.2 simpler: read the
> tally, render it, done.

---

## Phase 7 — Analysis / heatmap (M)

### 7.1 Month report `[x]` M
`Charts.jsx:Heatmap` is hardcoded to `weeks = 18` — a rolling 18-week grid.

- [ ] Rewrite as a calendar-month grid with weekday columns
- [ ] Default to the most recent month that has data: previous month if it has
      any, else current
- [ ] Prev/next month arrows; month + year heading; per-month totals
- [ ] Keep the Less→More legend
- **Fixes your report:** "should show month report, if previous has show previous else current"

---

## Phase 8 — Content pipeline (M)

`scripts/build-learn.mjs` reads `content/learn/` — which does not exist.
`paths.generated.js` says its source is `n4m4n/*.md`, and **`n4m4n/` was deleted**.
The 102-module corpus can no longer be regenerated. The script exits 0 silently.

- [ ] Restore the source markdown into `content/learn/` (recoverable from
      `old-history-backup`), or repoint the script
- [ ] **Format mismatch:** the generator emits questions as objects
      `{kind, prompt, choices, answer}`; the shipped bundle has plain strings; and
      `LessonView.jsx:230` renders `{q}` directly. Regenerating today throws
      *"Objects are not valid as a React child"*. Teach `LessonView` both shapes
      **before** any regeneration.

---

## Manual steps only you can do

1. ~~Supabase dashboard → Authentication → Providers → **enable Anonymous sign-ins**~~ ✅ done —
   Google OAuth enabled too, so `signInWithGoogle()` in `supabase.js:109` is live
2. Vercel → Project → Environment Variables → set `VITE_HCNSEC_KEY`,
   `VITE_OPENROUTER_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_SITE_URL` — the deployed build reads these, not `.env.local`
3. Vercel → re-link the project (`.vercel/` is gitignored now)
4. ~~Run migration `0003` against the project~~ ✅ applied 2026-08-02
5. *(optional, recommended)* rotate the DB password and hcnsec key

---

## Suggested order

```
Phase 1  ██████░░░░  quick wins — visible in one sitting
Phase 2  ████░░░░░░  brand + motion — makes it feel like yours
Phase 3  ████████░░  database — unblocks 4, 6, and real sync
Phase 4  ██████░░░░  AI chat page
Phase 5  ████████░░  typing/code rework — the biggest surface change
Phase 6  ███░░░░░░░  beta vote
Phase 7  ████░░░░░░  month heatmap
Phase 8  █████░░░░░  content pipeline — do before touching Learn content
```

Phases 1 and 2 are independent and safe to land immediately. Phase 3 gates 4 and
6. Phase 8 should happen before any Learn-content work in Phase 6.
