import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CircleHelp, Flag, HelpCircle, MessageCircleQuestion,
  PartyPopper, Send, Wrench,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Card, Chip, ProgressBar, Skeleton } from '../../components/ui/Primitives.jsx';
import Confetti from '../../components/ui/Confetti.jsx';
import Markdown from '../../components/ui/Markdown.jsx';
import { useStore } from '../../lib/store.jsx';
import { LEVEL_STYLE, moduleMinutes, modulesFor, pathFor } from '../../lib/curriculum.js';
import { LANGUAGE_BY_ID } from '../../lib/content.js';
import { aiConfigured, tutorAnswer } from '../../lib/ai.js';
import { cx } from '../../lib/format.js';

const STEPS = [
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'practice', label: 'Practice', icon: Wrench },
  { id: 'check', label: 'Self-check', icon: MessageCircleQuestion },
];

export default function LessonView() {
  const { langId, conceptId } = useParams();
  const navigate = useNavigate();
  const { state, completeLesson, recordQuiz } = useStore();

  const modules = useMemo(() => modulesFor(langId), [langId]);
  const mod = modules.find((m) => String(m.number) === String(conceptId));
  const language = LANGUAGE_BY_ID[langId];
  const path = pathFor(langId);

  const [step, setStep] = useState('learn');
  const [answered, setAnswered] = useState({});
  const [celebrate, setCelebrate] = useState(false);

  if (!mod || !language || !path) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-bold">That module does not exist.</p>
        <Button className="mt-2" as={Link} to="/learn">
          Back to Learn
        </Button>
      </div>
    );
  }

  const nextModule = modules[mod.index + 1];
  const alreadyDone = state.learn.completed.includes(mod.moduleId);
  const confident = Object.values(answered).filter(Boolean).length;
  const allConfident = confident === mod.questions.length;
  const levelStyle = LEVEL_STYLE[mod.level] ?? LEVEL_STYLE.Beginner;

  const finish = () => {
    recordQuiz(mod.moduleId, allConfident, confident / mod.questions.length);
    completeLesson(mod.moduleId);
    if (state.settings.confetti) setCelebrate(true);
  };

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center gap-1.5">
        <Button variant="ghost" icon={ArrowLeft} as={Link} to={`/learn/${langId}`}>
          {path.title}
        </Button>
        <Chip tone={levelStyle.tone}>{mod.level}</Chip>
        <h1 className="text-2xl font-extrabold">
          <span className="text-ink-3">{mod.number}.</span> {mod.title}
        </h1>
        {alreadyDone ? <Chip tone="brand">completed</Chip> : null}
        <span className="ml-auto text-xs text-ink-3">
          Module {mod.index + 1} of {modules.length} · {moduleMinutes(mod)} min
        </span>
      </header>

      <nav className="flex gap-1" aria-label="Module steps">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const passed = STEPS.findIndex((x) => x.id === step) > i;
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              aria-current={active}
              className={cx(
                'flex flex-1 items-center gap-1 rounded-md border px-1.5 py-1 text-sm font-bold transition-colors',
                active
                  ? 'border-brand bg-brand-wash text-brand'
                  : passed
                    ? 'border-line bg-subtle text-ink-2'
                    : 'border-line text-ink-3',
              )}
            >
              <s.icon size={15} strokeWidth={2.2} aria-hidden />
              <span className="hidden sm:inline">{s.label}</span>
              {passed ? <Check size={13} className="ml-auto" aria-hidden /> : null}
            </button>
          );
        })}
      </nav>

      <div className="relative grid gap-2.5 lg:grid-cols-[1fr_320px]">
        {celebrate ? (
          <div className="pointer-events-none absolute inset-0 z-30">
            <Confetti fire onDone={() => setCelebrate(false)} />
          </div>
        ) : null}

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {step === 'learn' ? (
                <Card className="p-2.5 sm:p-3">
                  <p className="eyebrow">{mod.level} · Module {mod.number}</p>
                  <h2 className="mt-0.5 text-xl font-extrabold">{mod.title}</h2>
                  <Markdown text={mod.learn} language={language.prism} className="mt-1.5 text-base" />

                  {mod.checkpoint ? (
                    <div className="mt-2.5 rounded-md border border-dashed border-line-strong bg-subtle/40 p-2">
                      <div className="flex items-center gap-1">
                        <Flag size={14} className="text-brand" aria-hidden />
                        <p className="text-sm font-extrabold">{mod.checkpoint.title}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{mod.checkpoint.brief}</p>
                    </div>
                  ) : null}

                  <Button variant="primary" iconRight={ArrowRight} className="mt-2.5" onClick={() => setStep('practice')}>
                    See the practice task
                  </Button>
                </Card>
              ) : null}

              {step === 'practice' ? (
                <Card className="p-2.5 sm:p-3">
                  <p className="eyebrow">Practice task</p>
                  <h2 className="mt-0.5 text-xl font-extrabold">Build it yourself</h2>
                  <div className="mt-1.5 rounded-md border border-line bg-subtle/50 p-2">
                    <Markdown text={capitalise(mod.practice)} language={language.prism} className="text-base" />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-3">
                    Write this in your own editor with the real toolchain. Typing drills build the muscle; this builds
                    the understanding. Come back and run the self-check when it works.
                  </p>
                  <Button variant="primary" iconRight={ArrowRight} className="mt-2.5" onClick={() => setStep('check')}>
                    Run the self-check
                  </Button>
                </Card>
              ) : null}

              {step === 'check' ? (
                <SelfCheck
                  mod={mod}
                  language={language}
                  answered={answered}
                  setAnswered={setAnswered}
                  confident={confident}
                  allConfident={allConfident}
                  alreadyDone={alreadyDone}
                  onFinish={finish}
                  nextModule={nextModule}
                  onNext={() => {
                    setStep('learn');
                    setAnswered({});
                    navigate(nextModule ? `/learn/${langId}/${nextModule.number}` : `/learn/${langId}`);
                  }}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <TutorPanel mod={mod} languageName={language.name} />
      </div>
    </div>
  );
}

/* ── Self-check ────────────────────────────────────────────────────────────
   The source questions are open-ended, so there is no answer key to grade
   against. Marking honestly is the exercise — a wrong self-assessment only
   costs the learner. */

function SelfCheck({ mod, language, answered, setAnswered, confident, allConfident, alreadyDone, onFinish, nextModule, onNext }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card className="p-2.5 sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div>
          <h2 className="text-xl font-extrabold">Can you answer these?</h2>
          <p className="text-xs text-ink-3">
            Answer out loud or in writing, without notes. Mark only the ones you genuinely got.
          </p>
        </div>
        <span className="font-mono text-sm text-ink-3 tnum">
          {confident}/{mod.questions.length}
        </span>
      </div>

      <ProgressBar value={confident / mod.questions.length} className="mt-1.5" label="Self-check progress" />

      <ol className="mt-2 space-y-1">
        {mod.questions.map((q, i) => {
          const marked = Boolean(answered[i]);
          // Two corpora coexist: the original paths store a question as a plain
          // string, while build-learn.mjs emits {kind, prompt, choices, answer}.
          // Rendering the object directly threw "Objects are not valid as a
          // React child", so any regeneration would have taken Learn down.
          const prompt = typeof q === 'string' ? q : (q?.prompt ?? '');
          const kind = typeof q === 'string' ? null : q?.kind;
          return (
            <li key={i}>
              <button
                onClick={() => setAnswered((a) => ({ ...a, [i]: !a[i] }))}
                className={cx(
                  'flex w-full items-start gap-1.5 rounded-md border px-1.5 py-1.5 text-left transition-colors',
                  marked ? 'border-good bg-good/10' : 'border-line hover:border-line-strong hover:bg-subtle',
                )}
              >
                <span
                  className={cx(
                    'mt-px grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border-2 font-mono text-2xs font-bold',
                    marked ? 'border-good bg-good text-white' : 'border-line text-ink-3',
                  )}
                  aria-hidden
                >
                  {marked ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  {/* Through Markdown, not raw: the authored questions quote
                      identifiers and whole expressions in backticks, and
                      printing them literally put `x = [1]; y = x` on screen
                      with its punctuation showing. */}
                  <Markdown
                    text={prompt}
                    language={language.prism}
                    compact
                    className={cx('text-sm', marked ? 'text-ink' : 'text-ink-2')}
                  />
                  {kind && kind !== 'recall' ? (
                    <span className="mt-0.5 inline-block rounded-full bg-subtle px-1 py-px text-2xs font-extrabold uppercase tracking-[0.07em] text-ink-3">
                      {kind}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {!submitted ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          <Button
            variant="primary"
            disabled={confident === 0}
            onClick={() => {
              setSubmitted(true);
              onFinish();
            }}
          >
            {allConfident ? 'Complete module' : `Complete with ${confident}/${mod.questions.length}`}
          </Button>
          {!allConfident ? (
            <span className="text-xs text-ink-3">
              Unmarked questions are worth revisiting — the module still counts as done.
            </span>
          ) : null}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cx(
            'mt-2.5 flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5',
            allConfident ? 'border-brand/50 bg-brand-wash' : 'border-warn/50 bg-warn/10',
          )}
        >
          {allConfident ? <PartyPopper size={18} className="text-brand" aria-hidden /> : null}
          <p className="text-sm font-extrabold">
            {alreadyDone
              ? 'Module already banked — progress kept.'
              : allConfident
                ? 'All questions confident. Module complete, +60 XP.'
                : `Module complete, +60 XP. Come back to the ${mod.questions.length - confident} you skipped.`}
          </p>
          <Button size="sm" variant="primary" iconRight={ArrowRight} className="ml-auto" onClick={onNext}>
            {nextModule ? 'Next module' : 'Back to path'}
          </Button>
        </motion.div>
      )}
    </Card>
  );
}

/* ── AI tutor ──────────────────────────────────────────────────────────── */

function TutorPanel({ mod, languageName }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const first = mod.questions[0];
  const suggestions = [
    typeof first === 'string' ? first : first?.prompt,
    `Explain "${mod.title}" with a small ${languageName} example.`,
    'What do people usually get wrong here?',
  ].filter(Boolean);

  const ask = async (question) => {
    if (!question.trim() || busy) return;
    setMessages((m) => [...m, { role: 'user', text: question }]);
    setDraft('');
    setBusy(true);
    try {
      const answer = await tutorAnswer(
        question,
        `${languageName} — ${mod.level} module ${mod.number}: ${mod.title}. ${mod.learn} Practice task: ${mod.practice}`,
      );
      setMessages((m) => [...m, { role: 'tutor', text: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'tutor', text: `Could not reach the model (${err.reason ?? 'network'}). Try again shortly.` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="flex h-fit flex-col overflow-hidden lg:sticky lg:top-[80px]">
      <header className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-[8px] bg-brand-wash text-brand">
          <CircleHelp size={14} strokeWidth={2.4} aria-hidden />
        </span>
        <p className="text-sm font-extrabold">AI tutor</p>
        {!aiConfigured() ? <Chip tone="warn" className="ml-auto">no key</Chip> : null}
      </header>

      <div className="max-h-[420px] min-h-[120px] flex-1 space-y-1.5 overflow-y-auto p-2">
        {messages.length === 0 ? (
          <div className="space-y-1">
            <p className="text-sm text-ink-3">Stuck on a question? Ask about this module.</p>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="block w-full rounded-sm border border-line px-1.5 py-1 text-left text-xs font-semibold leading-relaxed text-ink-2 transition-colors hover:border-line-strong hover:bg-subtle"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === 'user' ? (
              <p key={i} className="ml-3 rounded-md bg-subtle px-1.5 py-1 text-sm font-semibold">
                {m.text}
              </p>
            ) : (
              <div key={i} className="mr-1 rounded-md border border-line px-1.5 py-1">
                <Markdown text={m.text} compact />
              </div>
            ),
          )
        )}
        {busy ? (
          <div className="space-y-1">
            <Skeleton className="h-1.5 w-[80%]" />
            <Skeleton className="h-1.5 w-[64%]" />
          </div>
        ) : null}
      </div>

      <form
        className="flex items-center gap-1 border-t border-line p-1 pr-[60px] lg:pr-1"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about this module…"
          aria-label="Ask the AI tutor"
          className="h-[34px] min-w-0 flex-1 rounded-sm bg-subtle/60 px-1.5 text-sm outline-none placeholder:text-ink-3 focus:bg-subtle"
        />
        <Button type="submit" size="sm" variant="brand" icon={Send} disabled={busy || !draft.trim()} aria-label="Send" />
      </form>
    </Card>
  );
}

function capitalise(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
