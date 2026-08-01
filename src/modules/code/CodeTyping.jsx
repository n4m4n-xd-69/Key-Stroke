import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PanelRightClose, PanelRightOpen, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import Button, { IconButton } from '../../components/ui/Button.jsx';
import Segmented from '../../components/ui/Segmented.jsx';
import { Card, Chip, ProgressBar } from '../../components/ui/Primitives.jsx';
import TypingStage from '../../components/typing/TypingStage.jsx';
import SessionSummary from '../../components/typing/SessionSummary.jsx';
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
  /* Selection is always an explicit snippet title — no random option. */
  const [selection, setSelection] = useState(null);

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
        <div className="flex items-center gap-1">
          <Button icon={SkipForward} onClick={nextSnippet}>
            Next snippet
          </Button>
          <Button
            variant="brand"
            icon={Sparkles}
            onClick={generate}
            disabled={generating || !aiConfigured()}
            title={aiConfigured() ? 'Generate a fresh snippet with AI' : 'Add an OpenRouter key to enable'}
          >
            {generating ? 'Generating…' : 'AI snippet'}
          </Button>
        </div>
      </header>

      <div
        className={cx(
          'grid gap-2.5',
          railOpen ? (railExpanded ? 'xl:grid-cols-2' : 'xl:grid-cols-[1fr_360px]') : 'xl:grid-cols-1',
        )}
      >
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1.5">
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

            <div className="ml-auto flex items-center gap-0.5">
              <IconButton size="sm" label="Restart snippet" icon={RotateCcw} onClick={() => engine.reset()} />
              <IconButton
                size="sm"
                label={railOpen ? 'Hide AI panel' : 'Show AI panel'}
                icon={railOpen ? PanelRightClose : PanelRightOpen}
                onClick={() => setRailOpen((v) => !v)}
                className="hidden xl:inline-flex"
              />
            </div>
          </div>

          {/* Program name and what it does, before you type a character of it. */}
          <div className="border-b border-line px-2.5 py-2 sm:px-4">
            <div className="flex flex-wrap items-center gap-1">
              <h2 className="text-lg font-extrabold tracking-[-0.01em]">{snippet.title}</h2>
              <Chip tone="brand">{snippet.topic ?? 'snippet'}</Chip>
              <Chip tone="outline">{difficulty}</Chip>
              <span className="ml-auto font-mono text-xs text-ink-3 tnum">
                {engine.index} / {snippet.code.length}
              </span>
            </div>
            {snippet.intro ? (
              <p className="mt-0.5 max-w-[70ch] text-sm leading-relaxed text-ink-2">{snippet.intro}</p>
            ) : null}
          </div>

          <div className="px-2.5 pt-2.5 sm:px-4">
            <ProgressBar value={engine.live.progress} className="mb-2" label="Snippet progress" />

            <TypingStage
              target={snippet.code}
              tokens={tokens}
              engine={engine}
              caretStyle={state.settings.caret}
              smoothCaret={state.settings.smoothCaret}
              fontSize={17}
              lineHeight={1.9}
              visibleLines={9}
              showLineNumbers
            />
          </div>

        </Card>

        {railOpen ? (
          <div className="min-h-[520px] xl:sticky xl:top-[80px] xl:h-[calc(100dvh-120px)]">
            <AISidebar
              code={snippet.code}
              language={languageId}
              languageName={language.name}
              expanded={railExpanded}
              onToggleExpand={() => setRailExpanded((v) => !v)}
            />
          </div>
        ) : null}
      </div>

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
    </div>
  );
}
