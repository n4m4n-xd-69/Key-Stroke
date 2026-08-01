import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Braces, Command, Github, Heart, Keyboard, LifeBuoy,
  Send, Sparkles, Trophy, Twitter,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Segmented from '../../components/ui/Segmented.jsx';
import { Chip, Skeleton } from '../../components/ui/Primitives.jsx';
import Markdown from '../../components/ui/Markdown.jsx';
import Logo from '../../components/brand/Logo.jsx';
import { Reveal, Stagger, StaggerItem } from '../../components/ui/Motion.jsx';
import { aiConfigured } from '../../lib/ai.js';
import { useScrollAnchor, useStreamingChat } from '../../lib/useStreamingChat.js';
import { useReducedMotionSafe } from '../../lib/motion.js';
import { curriculumTotals } from '../../lib/curriculum.js';
import { LANGUAGES, snippetCount } from '../../lib/content.js';
import { ACHIEVEMENTS } from '../../lib/gamification.js';
import { cx } from '../../lib/format.js';

const SECTIONS = [
  { value: 'about', label: 'About' },
  { value: 'guide', label: 'User guide' },
  { value: 'help', label: 'Ask for help' },
  { value: 'follow', label: 'Follow us' },
];

export default function About() {
  const [section, setSection] = useState('about');

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Module 06</p>
          <h1 className="mt-0.5 text-3xl font-extrabold">About</h1>
          <p className="mt-0.5 max-w-[52ch] text-sm text-ink-3">
            What KeyStroke is, how to get the most out of it, and where to find us.
          </p>
        </div>
        <Segmented options={SECTIONS} value={section} onChange={setSection} label="About section" />
      </header>

      {section === 'about' ? <AboutTab /> : null}
      {section === 'guide' ? <GuideTab /> : null}
      {section === 'help' ? <HelpTab /> : null}
      {section === 'follow' ? <FollowTab /> : null}
    </div>
  );
}

/* ── About ─────────────────────────────────────────────────────────────── */

function AboutTab() {
  /* Counted from the real corpus rather than typed into copy, so the numbers
     cannot quietly go stale as content is added. */
  const facts = useMemo(() => {
    const totals = curriculumTotals();
    const snippets = LANGUAGES.reduce(
      (a, l) => a + ['easy', 'normal', 'hard', 'expert'].reduce((b, d) => b + snippetCount(l.id, d), 0),
      0,
    );
    return [
      { value: LANGUAGES.length, label: 'Languages' },
      { value: snippets, label: 'Code snippets' },
      { value: totals.modules, label: 'Lesson modules' },
      { value: ACHIEVEMENTS.length, label: 'Achievements' },
    ];
  }, []);

  return (
    <div className="space-y-2.5">
      <Reveal>
        <div className="liquid-glass overflow-hidden rounded-lg border border-line">
          <div className="flex flex-col items-start gap-2 p-3 sm:flex-row sm:items-center sm:p-4">
            <Logo size={64} className="shrink-0 drop-shadow-md" />
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold tracking-[-0.02em]">KeyStroke</h2>
              <p className="mt-0.5 max-w-[60ch] text-sm leading-relaxed text-ink-2">
                A typing trainer built for people who write code. Most typing sites drill prose and stop
                there — which is fine until the day your job is brackets, semicolons and indentation.
                KeyStroke drills all three, then teaches the concepts underneath them.
              </p>
            </div>
          </div>

          <Stagger className="grid gap-px border-t border-line bg-line sm:grid-cols-4">
            {facts.map((f) => (
              <StaggerItem key={f.label} className="bg-surface/60 px-2 py-2 text-center backdrop-blur-sm">
                <p className="font-mono text-2xl font-medium tnum">{f.value}</p>
                <p className="mt-0.5 text-2xs font-extrabold uppercase tracking-[0.08em] text-ink-3">{f.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Reveal>

      <Stagger className="grid gap-2 md:grid-cols-3">
        {[
          {
            icon: Keyboard,
            title: 'Accuracy before speed',
            body: 'Accuracy counts every keypress you ever made, so a corrected mistake still costs you. Speed is what accuracy turns into — chasing it directly just teaches your hands to guess.',
          },
          {
            icon: Braces,
            title: 'Real code, real symbols',
            body: 'Eleven languages of genuine snippets. Indentation is handled for you, because proving you can hold the space bar is not a skill. Brackets are not.',
          },
          {
            icon: Trophy,
            title: 'Progress you can see',
            body: 'XP, levels, streaks and daily missions, plus per-key statistics that show exactly which fingers are letting you down.',
          },
        ].map((c) => (
          <StaggerItem key={c.title}>
            <div className="liquid-glass h-full rounded-lg border border-line p-2.5">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-brand-wash text-brand">
                <c.icon size={16} strokeWidth={2.2} aria-hidden />
              </span>
              <h3 className="mt-1.5 text-base font-extrabold">{c.title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{c.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal delay={0.05}>
        <div className="liquid-glass flex flex-wrap items-center gap-2 rounded-lg border border-line p-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold">Everything works offline</p>
            <p className="text-xs leading-relaxed text-ink-3">
              Your progress lives on this device by default. Sign in only if you want it on more than one.
            </p>
          </div>
          <Button as={Link} to="/practice" variant="primary" iconRight={ArrowRight}>
            Start typing
          </Button>
        </div>
      </Reveal>
    </div>
  );
}

/* ── User guide ────────────────────────────────────────────────────────── */

const GUIDE = [
  {
    icon: Keyboard,
    title: 'Typing practice',
    steps: [
      'Pick a mode: **Time** for a sprint, **Words** for a fixed count, **Quote** for something memorable, **Drill** to target one row, **Zen** for no clock at all.',
      'Just start typing — the stage takes focus on your first keystroke.',
      '`Esc` restarts the run. `⇧ + Tab` fetches new text. `Ctrl + ⌫` deletes the last word.',
      'Paste anything with `Ctrl + V` to drill your own text immediately.',
    ],
  },
  {
    icon: Braces,
    title: 'Code typing',
    steps: [
      'Choose a language and difficulty. **AI** generates a fresh snippet; **Next** steps through the bundled library.',
      'Newlines auto-consume the next line\'s indentation, so you never hand-type eight spaces.',
      'The panel beside the code explains it: **Explain**, **Flow**, **Cost**, **Review**, and **Chat** for anything else.',
      'Hit the expand icon for a full-screen surface with the chat still alongside.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Learn',
    steps: [
      'Seven language paths, each split into Beginner, Intermediate and Advanced.',
      'Every module has a **Learn** section, a **Practice** task to build yourself, and a **Self-check**.',
      'Mark only the questions you genuinely got — an honest self-assessment is the whole exercise.',
      'A module unlocks the one after it, so the order is the curriculum.',
    ],
  },
  {
    icon: Command,
    title: 'Shortcuts',
    steps: [
      '`Ctrl/⌘ + K` opens quick actions from anywhere.',
      '`Ctrl/⌘ + \\` collapses and expands the sidebar.',
      '`Esc` restarts a run, or leaves full screen.',
      '`⇧ + Tab` loads fresh text without touching the mouse.',
    ],
  },
];

function GuideTab() {
  return (
    <Stagger className="grid gap-2 lg:grid-cols-2">
      {GUIDE.map((g) => (
        <StaggerItem key={g.title}>
          <div className="liquid-glass h-full rounded-lg border border-line p-2.5">
            <div className="flex items-center gap-1">
              <span className="grid h-[28px] w-[28px] place-items-center rounded-[9px] bg-brand-wash text-brand">
                <g.icon size={15} strokeWidth={2.2} aria-hidden />
              </span>
              <h3 className="text-base font-extrabold">{g.title}</h3>
            </div>
            <ol className="mt-1.5 space-y-1">
              {g.steps.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-subtle font-mono text-2xs font-bold text-ink-2">
                    {i + 1}
                  </span>
                  <Markdown text={s} compact className="min-w-0 flex-1" />
                </li>
              ))}
            </ol>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* ── Ask for help ──────────────────────────────────────────────────────── */

const HELP_SYSTEM = [
  'You are the help assistant inside KeyStroke, a typing and learn-to-code app.',
  'Answer questions about how to use the app, and about typing technique and learning to code.',
  'Be brief and concrete — under 140 words. Never invent features; if you are unsure whether',
  'something exists, say so and suggest the closest thing that does.',
  '',
  'What exists: Typing practice (Time, Words, Quote, Drill, Custom, Zen modes; difficulty easy to',
  'expert; live WPM, accuracy, consistency; a keyboard visualiser; per-key weak-spot tracking).',
  'Code typing (11 languages, 4 difficulties, AI-generated snippets, auto-indent, a side panel with',
  'Explain/Flow/Cost/Review/Chat, full-screen mode). Learn (7 language paths, 102 modules, each with',
  'a lesson, a practice task and a self-check). Progress dashboard, achievements, XP, levels, daily',
  'missions and streaks. Everything works offline; progress is stored on the device.',
  'Formatting: never use markdown tables.',
].join('\n');

const HELP_STARTERS = [
  'How do I stop looking at the keyboard?',
  'What do the caret styles do?',
  'How is consistency calculated?',
  'My accuracy drops when I speed up — what should I drill?',
];

function HelpTab() {
  const reduce = useReducedMotionSafe();
  const ready = aiConfigured();
  const scrollRef = useRef(null);
  const endRef = useRef(null);
  const [draft, setDraft] = useState('');

  const { messages, busy, thinking, partial, ask } = useStreamingChat({
    system: HELP_SYSTEM,
    maxTokens: 700,
    surface: 'about-help',
  });

  useScrollAnchor({ scrollRef, endRef, deps: [messages.length, partial, thinking], streaming: busy, reduce });

  const send = () => {
    if (!draft.trim()) return;
    ask(draft);
    setDraft('');
  };

  return (
    <div className="liquid-glass flex h-[calc(100dvh-260px)] min-h-[380px] flex-col overflow-hidden rounded-lg border border-line">
      <header className="flex shrink-0 items-center gap-1 border-b border-line px-2 py-1.5">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-[8px] bg-brand-wash text-brand">
          <LifeBuoy size={14} strokeWidth={2.4} aria-hidden />
        </span>
        <p className="text-sm font-extrabold">Help assistant</p>
        {!ready ? <Chip tone="warn" className="ml-auto">no key</Chip> : null}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2.5 py-2">
        {messages.length === 0 && !busy ? (
          <div className="py-3 text-center">
            <p className="text-sm font-extrabold">{ready ? 'What can I help with?' : 'AI is not configured'}</p>
            <p className="mx-auto mt-0.5 max-w-[44ch] text-xs leading-relaxed text-ink-3">
              {ready
                ? 'Ask about any part of the app, or about getting faster.'
                : 'Set a provider key in .env.local to turn this on. The guide beside this tab covers the basics either way.'}
            </p>
            {ready ? (
              <div className="mx-auto mt-2 grid max-w-[520px] gap-1 sm:grid-cols-2">
                {HELP_STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-sm border border-line px-1.5 py-1 text-left text-xs font-semibold leading-relaxed text-ink-2 transition-colors hover:border-line-strong hover:bg-subtle hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <p key={i} className="ml-6 rounded-lg rounded-br-sm bg-brand-solid px-2 py-1 text-sm font-semibold text-brand-ink">
              {m.text}
            </p>
          ) : (
            <div key={i} className="mr-4 rounded-lg rounded-bl-sm border border-line px-2 py-1">
              <Markdown text={typeof m.text === 'string' ? m.text : (m.text?.detail ?? '')} compact />
            </div>
          ),
        )}

        {busy ? (
          <div className="mr-4 rounded-lg rounded-bl-sm border border-line px-2 py-1">
            {partial ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{partial}</p>
            ) : (
              <div className="space-y-1">
                <Skeleton className="h-1.5 w-[62%]" />
                <Skeleton className="h-1.5 w-[44%]" />
              </div>
            )}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        className="flex shrink-0 items-end gap-1 border-t border-line px-2 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!ready}
          placeholder={ready ? 'Ask anything about KeyStroke…' : 'AI is not configured'}
          aria-label="Ask the help assistant"
          className="h-[36px] min-w-0 flex-1 rounded-sm bg-subtle/60 px-1.5 text-sm outline-none placeholder:text-ink-3 focus:bg-subtle disabled:opacity-50"
        />
        <Button type="submit" size="sm" variant="brand" icon={Send} disabled={!ready || !draft.trim()} aria-label="Send" />
      </form>
    </div>
  );
}

/* ── Follow ────────────────────────────────────────────────────────────── */

/* Handles live here rather than scattered through the JSX so there is one place
   to correct when they change. */
const LINKS = [
  { icon: Github, label: 'GitHub', handle: 'n4m4n-xd-69/Key-Stroke', href: 'https://github.com/n4m4n-xd-69/Key-Stroke', blurb: 'The source, the issues, and every commit behind this build.' },
  { icon: Twitter, label: 'X', handle: '@n4m4n', href: 'https://x.com/n4m4n', blurb: 'Progress notes and the occasional typing-speed brag.' },
];

function FollowTab() {
  return (
    <div className="space-y-2.5">
      <Stagger className="grid gap-2 sm:grid-cols-2">
        {LINKS.map((l) => (
          <StaggerItem key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer noopener"
              className="liquid-glass flex h-full items-start gap-1.5 rounded-lg border border-line p-2.5 transition-transform duration-200 hover:-translate-y-px hover:border-line-strong"
            >
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[11px] bg-subtle text-ink-2">
                <l.icon size={17} strokeWidth={2.2} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold">{l.label}</p>
                <p className="truncate font-mono text-2xs text-brand">{l.handle}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{l.blurb}</p>
              </div>
            </a>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal delay={0.05}>
        <div className="liquid-glass rounded-lg border border-line p-3 text-center">
          <span className="mx-auto grid h-[38px] w-[38px] place-items-center rounded-full bg-brand-wash">
            <Sparkles size={18} className="text-brand" aria-hidden />
          </span>
          <p className="mt-1.5 text-base font-extrabold">Tell us what&apos;s missing</p>
          <p className="mx-auto mt-0.5 max-w-[52ch] text-sm leading-relaxed text-ink-2">
            A language you want, a lesson that doesn&apos;t exist yet, a drill that would help, or
            something that&apos;s simply broken — open an issue. It genuinely gets read, and most of
            what&apos;s here started as someone asking for it.
          </p>
          <Button
            as="a"
            href="https://github.com/n4m4n-xd-69/Key-Stroke/issues/new"
            target="_blank"
            rel="noreferrer noopener"
            variant="primary"
            size="sm"
            iconRight={ArrowRight}
            className="mt-2"
          >
            Open an issue
          </Button>
          <p className={cx('mt-2 flex items-center justify-center gap-0.5 text-2xs font-bold text-ink-3')}>
            Made with Love
            <Heart size={11} strokeWidth={0} className="fill-[#ff4d5e]" aria-hidden />
          </p>
        </div>
      </Reveal>
    </div>
  );
}
