import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, RotateCcw,
  SkipForward, Sparkles,
} from 'lucide-react';
import { IconButton } from '../../components/ui/Button.jsx';
import Segmented from '../../components/ui/Segmented.jsx';
import { Card, Chip, ProgressBar } from '../../components/ui/Primitives.jsx';
import TypingStage from '../../components/typing/TypingStage.jsx';
import SessionSummary from '../../components/typing/SessionSummary.jsx';
import LiveStats from '../../components/typing/LiveStats.jsx';
import useTypingEngine from '../../components/typing/useTypingEngine.js';
import AISidebar from './AISidebar.jsx';
import { useStore, useStats } from '../../lib/store.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { DIFFICULTIES, LANGUAGES, LANGUAGE_BY_ID, snippetsFor } from '../../lib/content.js';
import { AI_REASON_COPY, aiConfigured, generateSnippet } from '../../lib/ai.js';
import { tokenizeToChars } from '../../lib/prism.js';
import { cx } from '../../lib/format.js';

export default function CodeTyping() {
  const [params, setParams] = useSearchParams();
  const { state, recordSession, clearFresh, setSetting } = useStore();
  const stats = useStats();
  const { toast } = useToast();

  /* URL wins, then whatever you picked last time, then the default. */
  const [languageId, setLanguageId] = useState(() => {
    const fromUrl = params.get('lang');
    if (LANGUAGE_BY_ID[fromUrl]) return fromUrl;
    const remembered = state.settings.lastLanguage;
    return LANGUAGE_BY_ID[remembered] ? remembered : 'javascript';
  });
  const [difficulty, setDifficulty] = useState('normal');
  const [snippet, setSnippet] = useState(() => snippetsFor(languageId, 'normal')[0]);
  const [generating, setGenerating] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [railExpanded, setRailExpanded] = useState(false);
  const [result, setResult] = useState(null);
  /* Selection is always an explicit snippet title — no random option. Seeded
     from the same snippet the stage opens with rather than null: a controlled
     <select value={null}> makes React warn and treats the element as
     uncontrolled for its first render. */
  const [selection, setSelection] = useState(() => snippetsFor(languageId, 'normal')[0]?.title ?? '');
  const [focus, setFocus] = useState(false);

  const introOpen = state.settings.codeIntroOpen !== false;

  const toggleFocus = useCallback(() => setFocus((f) => !f), []);

  /**
   * How many code lines the full-screen stage can show.
   *
   * Derived from the viewport rather than fixed: the stage's height is
   * fontSize × lineHeight × visibleLines, so a hardcoded count overflows a
   * short window and gets clipped. `chrome` is the toolbar, intro, progress bar
   * and padding that share the column.
   */
  const [viewportH, setViewportH] = useState(() => (typeof window === 'undefined' ? 900 : window.innerHeight));
  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fullscreenLines = useMemo(() => {
    const chrome = 210;
    const lineBox = 19 * 1.9;
    return Math.max(6, Math.min(20, Math.floor((viewportH - chrome) / lineBox)));
  }, [viewportH]);

  /* A full-screen surface must not leave the page behind it scrollable. */
  useEffect(() => {
    if (!focus) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [focus]);

  /* Escape leaves full screen — the same reflex every other full-screen
     surface on the web trains. It must not also reset the run. */
  useEffect(() => {
    if (!focus) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setFocus(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  const language = LANGUAGE_BY_ID[languageId];
  const available = useMemo(() => snippetsFor(languageId, difficulty), [languageId, difficulty]);

  /* Swap the snippet whenever language or difficulty changes, and remember the
     language so the next visit opens where you left off. */
  useEffect(() => {
    const first = snippetsFor(languageId, difficulty)[0];
    setSnippet(first);
    setSelection(first.title);
    setResult(null);
    setSetting('lastLanguage', languageId);
  }, [languageId, difficulty, setSetting]);

  useEffect(() => {
    if (params.get('lang')) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tokens = useMemo(
    () => tokenizeToChars(snippet.code, language.prism),
    [snippet.code, language.prism],
  );

  const onFinish = useCallback(
    (run) => {
      setResult(run);
      recordSession({
        ts: new Date().toISOString(),
        kind: 'code',
        mode: 'code',
        difficulty,
        lang: languageId,
        wpm: run.wpm,
        accuracy: run.accuracy,
        consistency: run.consistency,
        durationSec: run.durationSec,
        chars: run.chars,
        errors: run.errors,
        keyStats: run.keyStats,
      });
    },
    [difficulty, languageId, recordSession],
  );

  const engine = useTypingEngine({
    target: snippet.code,
    limitSeconds: null,
    autoIndent: true,
    stopOnError: state.settings.stopOnError,
    sound: state.settings.sound,
    onFinish,
  });

  const choose = useCallback(
    (title) => {
      const found = available.find((s) => s.title === title);
      if (!found) return;
      setSelection(title);
      setSnippet(found);
      setResult(null);
      clearFresh();
    },
    [available, clearFresh],
  );

  /** Steps to the next snippet in order — deterministic, so nothing repeats. */
  const nextSnippet = useCallback(() => {
    const i = available.findIndex((s) => s.title === snippet.title);
    choose(available[(i + 1) % available.length].title);
  }, [available, snippet.title, choose]);

  const generate = useCallback(async () => {
    setGenerating(true);
    try {
      const fresh = await generateSnippet(language.name, difficulty);
      setSnippet({ ...fresh, difficulty, language: languageId, intro: fresh.intro ?? 'Generated for this session.' });
      setSelection(fresh.title);
      setResult(null);
      clearFresh();
      toast('Fresh snippet generated', { tone: 'success' });
    } catch (err) {
      // Say which failure it was — "could not reach the model" sent people
      // looking for a network problem when the real answer was a spent quota.
      const copy = AI_REASON_COPY[err.reason] ?? AI_REASON_COPY.network;
      toast(`${copy.label} — using the bundled library instead`, { tone: 'warn', duration: 4200 });
      nextSnippet();
    } finally {
      setGenerating(false);
    }
  }, [language.name, difficulty, languageId, toast, nextSnippet, clearFresh]);

  const history = useMemo(
    () => stats.sessions.filter((s) => s.kind === 'code').slice(-12).map((s) => s.wpm),
    [stats.sessions],
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1">
            {/* Language is a dropdown now — eleven chips ate a whole row and
                pushed the code below the fold. */}
            <label className="flex items-center gap-0.5">
              <span className="sr-only">Language</span>
              <span
                className="grid h-[26px] w-[26px] place-items-center rounded-[7px] font-mono text-2xs font-extrabold text-white"
                style={{ background: language.hue }}
                aria-hidden
              >
                {language.icon}
              </span>
              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="h-[30px] rounded-xs border border-line bg-surface px-1 text-xs font-bold"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>

            <span className="mx-0.5 hidden h-2 w-px bg-line sm:block" aria-hidden />

            <Segmented
              size="sm"
              label="Difficulty"
              options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.name, hint: d.note }))}
              value={difficulty}
              onChange={setDifficulty}
            />

            {/* Explicit snippet selection. */}
            <label className="flex items-center gap-1">
              <span className="sr-only">Snippet</span>
              <select
                value={selection}
                onChange={(e) => choose(e.target.value)}
                className="h-[30px] max-w-[190px] rounded-xs border border-line bg-surface px-1 text-xs font-bold"
              >
                {available.map((s) => (
                  <option key={s.title} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>

            {/* Every snippet action lives in one icon cluster. Full-width
                labelled buttons sat between the intro and the code and pushed
                the snippet itself below the fold, which is the wrong thing to
                spend vertical space on in a typing surface. */}
            <div className="ml-auto flex items-center gap-0.5">
              <IconButton
                size="sm"
                label={aiConfigured() ? 'Generate a fresh snippet with AI' : 'Set a provider key in .env.local to enable'}
                icon={Sparkles}
                onClick={generate}
                disabled={generating || !aiConfigured()}
                className={cx('text-brand', generating && 'animate-pulse')}
              />
              <IconButton size="sm" label="Next snippet" icon={SkipForward} onClick={nextSnippet} />
              <span className="mx-0.5 h-2 w-px bg-line" aria-hidden />
              <IconButton size="sm" label="Restart snippet" icon={RotateCcw} onClick={() => engine.reset()} />
              <IconButton
                size="sm"
                label={focus ? 'Leave full screen' : 'Enter full screen'}
                icon={focus ? Minimize2 : Maximize2}
                onClick={toggleFocus}
                className={cx(focus && 'text-brand')}
              />
              <IconButton
                size="sm"
                label={railOpen ? 'Hide AI chat' : 'Show AI chat'}
                icon={railOpen ? PanelRightClose : PanelRightOpen}
                onClick={() => setRailOpen((v) => !v)}
                className="hidden xl:inline-flex"
              />
            </div>
    </div>
  );

  /* Intro sits on top of the code in both layouts, so it is built once. */
  const stage = (fullscreen) => (
    <>
      <SnippetIntro
        snippet={snippet}
        difficulty={difficulty}
        typed={engine.index}
        open={introOpen}
        onToggle={() => setSetting('codeIntroOpen', !introOpen)}
      />
      <div className={cx('px-2.5 sm:px-4', fullscreen ? 'pt-3' : 'pt-2.5')}>
        <ProgressBar value={engine.live.progress} className="mb-2" label="Snippet progress" />
        <TypingStage
          target={snippet.code}
          tokens={tokens}
          engine={engine}
          caretStyle={state.settings.caret}
          smoothCaret={state.settings.smoothCaret}
          fontSize={fullscreen ? 19 : 17}
          lineHeight={1.9}
          visibleLines={fullscreen ? fullscreenLines : 9}
          showLineNumbers
        />
      </div>
    </>
  );

  const chat = (
    <AISidebar
      code={snippet.code}
      language={languageId}
      languageName={language.name}
      expanded={railExpanded}
      onToggleExpand={() => setRailExpanded((v) => !v)}
    />
  );

  const summary = (
    <SessionSummary
        open={Boolean(result)}
        result={result ? { ...result, isPB: state._lastAward?.isPB } : null}
        award={state._lastAward}
        freshAchievements={state._fresh ?? []}
        history={history}
        confettiEnabled={state.settings.confetti}
        onRetry={() => {
          setResult(null);
          clearFresh();
          engine.reset();
        }}
        onNext={nextSnippet}
        onClose={() => {
          setResult(null);
          clearFresh();
        }}
      />
  );

  /* ── Full-screen focus surface ───────────────────────────────────────── */
  if (focus) {
    return (
      <>
        {/* Above the rail (z-30) and top bar (z-40), below modals (z-50). */}
        <div className="fixed inset-0 z-[45] flex flex-col bg-bg">
          <div className="shrink-0 border-b border-line px-2 py-1.5">{toolbar}</div>
          <div className="flex min-h-0 flex-1 gap-2 p-2">
            {/* overflow-hidden, not auto: TypingStage already scrolls itself by
                shifting the passage to keep the caret parked. An outer scroller
                on top of that gave two competing scroll positions, which pushed
                the intro off-screen and clipped the first line. */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface">
              {stage(true)}
            </div>
            {railOpen ? <aside className="hidden w-[380px] shrink-0 lg:block">{chat}</aside> : null}
          </div>
        </div>
        {summary}
      </>
    );
  }

  /* ── Windowed layout ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Module 02</p>
          <h1 className="mt-0.5 text-3xl font-extrabold">Code typing</h1>
          <p className="mt-0.5 max-w-[52ch] text-sm text-ink-3">
            Real snippets, real syntax, real punctuation. Indentation is handled for you — brackets are not.
          </p>
        </div>
        {/* The header used to hold "Next snippet" and "AI snippet". Both are
            icons in the toolbar now, beside the reset they belong with; the
            header carries the numbers you want in your eyeline while typing. */}
        <LiveStats live={engine.live} compact />
      </header>

      <div
        className={cx(
          'grid gap-2.5',
          railOpen ? (railExpanded ? 'xl:grid-cols-2' : 'xl:grid-cols-[1fr_380px]') : 'xl:grid-cols-1',
        )}
      >
        <Card className="overflow-hidden">
          <div className="border-b border-line px-2 py-1.5">{toolbar}</div>
          {stage(false)}
          <div className="pb-2" />
        </Card>

        {railOpen ? (
          <div className="min-h-[560px] xl:sticky xl:top-[80px] xl:h-[calc(100dvh-120px)]">{chat}</div>
        ) : null}
      </div>

      {summary}
    </div>
  );
}

/* ── Snippet intro ─────────────────────────────────────────────────────────
   The name is permanent; the prose is not. Hiding keeps the row that anchors
   the code — title, topic, difficulty, progress — and removes only the
   paragraph, so the collapse costs one line of layout rather than a jump. */

function SnippetIntro({ snippet, difficulty, typed, open, onToggle }) {
  const hasIntro = Boolean(snippet.intro);

  return (
    <div className="border-b border-line bg-gradient-to-b from-subtle/40 to-transparent px-2.5 py-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-1">
        <h2 className="text-lg font-extrabold tracking-[-0.01em]">{snippet.title}</h2>
        <Chip tone="brand">{snippet.topic ?? 'snippet'}</Chip>
        <Chip tone="outline">{difficulty}</Chip>

        <div className="ml-auto flex items-center gap-1">
          <span className="font-mono text-xs text-ink-3 tnum">
            {typed} / {snippet.code.length}
          </span>
          {hasIntro ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              title={open ? 'Hide the description' : 'Show the description'}
              className="flex items-center gap-0.5 rounded-xs px-1 py-0.5 text-2xs font-extrabold uppercase tracking-[0.07em] text-ink-3 transition-colors hover:bg-subtle hover:text-ink-2"
            >
              {open ? 'Hide' : 'About'}
              <ChevronDown
                size={12}
                strokeWidth={2.6}
                className={cx('transition-transform duration-200', open && 'rotate-180')}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasIntro && open ? (
          <motion.p
            key="intro"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[70ch] overflow-hidden text-sm leading-relaxed text-ink-2"
          >
            <span className="mt-1 block">{snippet.intro}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
