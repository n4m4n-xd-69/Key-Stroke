import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, Flag, Flame, Lock, Play } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Card, Chip, ProgressBar, ProgressRing, SectionTitle } from '../../components/ui/Primitives.jsx';
import Counter from '../../components/ui/Counter.jsx';
import { useStats, useStore } from '../../lib/store.jsx';
import {
  LEVEL_STYLE, PATH_LANGUAGES, curriculumTotals, isUnlocked, levelProgress,
  moduleMinutes, modulesFor, pathFor, trackProgress,
} from '../../lib/curriculum.js';
import { cx } from '../../lib/format.js';

export default function Learn() {
  const { langId } = useParams();
  return langId ? <Track languageId={langId} /> : <LanguageGrid />;
}

/* ── Language chooser ──────────────────────────────────────────────────── */

function LanguageGrid() {
  const { state } = useStore();
  const stats = useStats();
  const completed = state.learn.completed;
  const totals = useMemo(curriculumTotals, []);

  const tracks = useMemo(
    () => PATH_LANGUAGES.map((l) => ({ ...l, ...trackProgress(l.id, completed) })),
    [completed],
  );

  const started = tracks.filter((t) => t.done > 0);

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Module 03</p>
          <h1 className="mt-0.5 text-3xl font-extrabold">Learn &amp; practise</h1>
          <p className="mt-0.5 max-w-[60ch] text-sm text-ink-3">
            {totals.languages} mastery paths · {totals.modules} modules · {totals.questions} questions. Beginner
            through Advanced, each level closing with a checkpoint project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Stat label="Modules done" value={stats.lessonsDone} />
          <Stat label="Paths started" value={started.length} />
          <Stat label="Streak" value={stats.streak} icon={Flame} />
        </div>
      </header>

      {started.length ? (
        <section>
          <SectionTitle title="Continue" hint="Pick up where you left off" className="mb-1.5" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {started.map((t) => (
              <ContinueCard key={t.id} track={t} completed={completed} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle title="Mastery paths" hint="Authored curricula, not generated filler" className="mb-1.5" />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {tracks.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.3, i * 0.04) }}
            >
              <Link to={`/learn/${t.id}`} className="block h-full">
                <Card interactive className="group relative flex h-full flex-col overflow-hidden p-2.5">
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-12 w-12 rounded-full opacity-[0.14] transition-transform duration-500 group-hover:scale-150"
                    style={{ background: t.hue }}
                    aria-hidden
                  />
                  <div className="relative flex items-start gap-1.5">
                    <span
                      className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-md font-mono text-sm font-extrabold text-white shadow-sm"
                      style={{ background: t.hue }}
                      aria-hidden
                    >
                      {t.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-extrabold">{t.pathTitle}</p>
                      <p className="text-xs text-ink-3">
                        {t.done} of {t.total} modules
                      </p>
                    </div>
                    {t.pct === 1 ? <Chip tone="brand">complete</Chip> : null}
                  </div>

                  <p className="relative mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-3">{t.blurb}</p>
                  <ProgressBar value={t.pct} className="relative mt-2" label={`${t.name} progress`} />
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContinueCard({ track, completed }) {
  const modules = modulesFor(track.id);
  const nextIndex = modules.findIndex((m) => !completed.includes(m.moduleId));
  const next = modules[nextIndex === -1 ? modules.length - 1 : nextIndex];

  return (
    <Link to={`/learn/${track.id}/${next.number}`}>
      <Card interactive className="flex items-center gap-2 p-2">
        <ProgressRing value={track.pct} size={56} stroke={6}>
          <span className="font-mono text-sm font-medium tnum">{Math.round(track.pct * 100)}</span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold">{track.name}</p>
          <p className="truncate text-xs text-ink-3">
            {next.level} · Module {next.number}
          </p>
          <p className="truncate text-xs font-semibold text-brand">{next.title}</p>
        </div>
        <Play size={18} className="ml-auto shrink-0 text-brand" aria-hidden />
      </Card>
    </Link>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-md border border-line px-1.5 py-1">
      <p className="flex items-center gap-0.5 font-mono text-xl font-medium tnum">
        {Icon ? <Icon size={15} className="text-brand" aria-hidden /> : null}
        <Counter value={value} />
      </p>
      <p className="text-2xs font-extrabold uppercase tracking-[0.08em] text-ink-3">{label}</p>
    </div>
  );
}

/* ── The path ──────────────────────────────────────────────────────────── */

function Track({ languageId }) {
  const navigate = useNavigate();
  const { state } = useStore();
  const path = pathFor(languageId);
  const language = PATH_LANGUAGES.find((l) => l.id === languageId);
  const modules = useMemo(() => modulesFor(languageId), [languageId]);
  const completed = state.learn.completed;

  if (!path || !language) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-bold">No mastery path for that language yet.</p>
        <p className="mt-0.5 text-sm text-ink-3">
          Authored paths exist for {PATH_LANGUAGES.map((l) => l.name).join(', ')}.
        </p>
        <Button className="mt-2" onClick={() => navigate('/learn')}>
          Back to paths
        </Button>
      </div>
    );
  }

  const progress = trackProgress(languageId, completed);

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" icon={ArrowLeft} as={Link} to="/learn">
          All paths
        </Button>
        <div className="flex items-center gap-1.5">
          <span
            className="grid h-[40px] w-[40px] place-items-center rounded-md font-mono text-base font-extrabold text-white shadow-sm"
            style={{ background: language.hue }}
            aria-hidden
          >
            {language.icon}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">{path.title}</h1>
            <p className="text-xs text-ink-3">
              {progress.done} of {progress.total} modules · {Math.round(progress.pct * 100)}% complete
            </p>
          </div>
        </div>
        <div className="ml-auto w-full max-w-[240px]">
          <ProgressBar value={progress.pct} label={`${language.name} progress`} />
        </div>
      </header>

      <Card className="p-2.5">
        <p className="text-sm leading-relaxed text-ink-2">{path.blurb}</p>
      </Card>

      <div className="mx-auto max-w-[820px] space-y-3 pb-6">
        {path.levels.map((level) => {
          const style = LEVEL_STYLE[level.name] ?? LEVEL_STYLE.Beginner;
          const lp = levelProgress(languageId, level.name, completed);

          return (
            <section key={level.name}>
              <div className="mb-1.5 flex flex-wrap items-center gap-1">
                <h2 className="text-lg font-extrabold">{level.name}</h2>
                <Chip tone={style.tone}>
                  {lp.done}/{lp.total}
                </Chip>
                <span className="text-xs text-ink-3">{style.note}</span>
              </div>

              <div className="space-y-1">
                {level.modules.map((m) => {
                  const full = modules.find((x) => x.moduleId === `${languageId}:${m.number}`);
                  const done = completed.includes(full.moduleId);
                  const unlocked = isUnlocked(modules, full.index, completed);

                  return (
                    <ModuleRow
                      key={full.moduleId}
                      mod={full}
                      done={done}
                      unlocked={unlocked}
                      selfCheck={state.learn.quizzes[full.moduleId]}
                    />
                  );
                })}
              </div>

              {level.checkpoint ? (
                <div className="mt-1.5 rounded-md border border-dashed border-line-strong bg-subtle/40 p-2">
                  <div className="flex items-center gap-1">
                    <Flag size={14} className="text-brand" aria-hidden />
                    <p className="text-sm font-extrabold">{level.checkpoint.title}</p>
                    {lp.pct === 1 ? <Chip tone="brand" className="ml-auto">unlocked</Chip> : null}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{level.checkpoint.brief}</p>
                </div>
              ) : null}
            </section>
          );
        })}

        {path.extras?.length ? (
          <section>
            <SectionTitle title="Reference" hint="Not steps on the path — material to come back to" className="mb-1.5" />
            <div className="space-y-1">
              {path.extras.map((ex) => (
                <details key={ex.name} className="rounded-md border border-line bg-surface p-2">
                  <summary className="cursor-pointer text-sm font-extrabold">{ex.name}</summary>
                  {ex.checkpoint ? (
                    <p className="mt-1 text-xs leading-relaxed text-ink-2">{ex.checkpoint.brief}</p>
                  ) : null}
                  {ex.notes?.map((n) => (
                    <div key={n.title} className="mt-1.5">
                      <p className="text-xs font-bold">{n.title}</p>
                      <p className="text-xs leading-relaxed text-ink-3">{n.body}</p>
                    </div>
                  ))}
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ModuleRow({ mod, done, unlocked, selfCheck }) {
  const body = (
    <Card
      interactive={unlocked}
      className={cx('flex items-center gap-1.5 p-2 transition-opacity', !unlocked && 'opacity-55')}
    >
      <span
        className={cx(
          'grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-bold',
          done
            ? 'border-brand bg-brand-solid text-brand-ink'
            : unlocked
              ? 'border-brand/50 bg-brand-wash text-brand'
              : 'border-line bg-subtle text-ink-3',
        )}
        aria-hidden
      >
        {done ? <Check size={18} strokeWidth={3} /> : unlocked ? mod.number : <Lock size={15} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold">{mod.title}</p>
        <p className="truncate text-xs text-ink-3">
          {moduleMinutes(mod)} min · {mod.questions.length} questions
          {selfCheck?.passed ? ' · self-check passed' : ''}
        </p>
      </div>

      {unlocked ? <BookOpen size={16} className="shrink-0 text-brand" aria-hidden /> : null}
    </Card>
  );

  if (!unlocked) {
    return (
      <div title="Finish the previous module to unlock" className="w-full">
        {body}
      </div>
    );
  }

  return (
    <Link to={`/learn/${mod.languageId}/${mod.number}`} className="block w-full">
      {body}
    </Link>
  );
}
