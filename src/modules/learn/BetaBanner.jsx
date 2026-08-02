import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FlaskConical, ThumbsDown, ThumbsUp } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { castVote, fetchTally, readLocalVote } from '../../lib/betaVote.js';
import { useReducedMotionSafe } from '../../lib/motion.js';
import { cx } from '../../lib/format.js';

const FEATURE = 'learn';

/**
 * "Learn is in beta — do you want it?"
 *
 * Informational only. Voting no does not hide anything: the point is to find
 * out whether this section is worth continuing, and that is a judgement for a
 * person to make once the numbers are in, not something to wire to a flag.
 *
 * The split is shown to everyone, including before you vote — hiding it until
 * you commit would make the ask feel like a toll gate, and the tally view
 * exposes counts only, never who voted which way.
 */
export default function BetaBanner() {
  const reduce = useReducedMotionSafe();
  const { user, cloudEnabled } = useAuth();
  const [vote, setVote] = useState(() => readLocalVote(FEATURE));
  const [tally, setTally] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => fetchTally(FEATURE).then(setTally);

  useEffect(() => {
    if (!cloudEnabled) return;
    load();
    // Only on mount and when cloud availability changes; voting reloads itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudEnabled]);

  const submit = async (value) => {
    if (busy) return;
    setBusy(true);
    setVote(value); // optimistic: the answer is already known locally
    try {
      await castVote(user?.id, FEATURE, value);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const total = tally?.total ?? 0;
  const yes = tally?.yes ?? 0;
  const pct = total ? Math.round((yes / total) * 100) : 0;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-glass rounded-lg border border-line px-2.5 py-2"
      aria-label="Learn beta feedback"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[10px] bg-brand-wash text-brand">
          <FlaskConical size={16} strokeWidth={2.2} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">
            Learn is in beta — do you want it?
          </p>
          <p className="text-xs leading-relaxed text-ink-3">
            {vote === null
              ? 'One tap. It decides whether this section keeps being built or gets replaced with something else.'
              : 'Thanks — your answer is counted. You can change it any time.'}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {vote === null ? (
            <motion.div
              key="ask"
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="flex shrink-0 items-center gap-1"
            >
              <Button size="sm" variant="brand" icon={ThumbsUp} disabled={busy} onClick={() => submit(true)}>
                Yes
              </Button>
              <Button size="sm" variant="secondary" icon={ThumbsDown} disabled={busy} onClick={() => submit(false)}>
                No
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="voted"
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18 }}
              className="flex shrink-0 items-center gap-1"
            >
              <span
                className={cx(
                  'flex items-center gap-0.5 rounded-full px-1.5 py-1 text-2xs font-extrabold uppercase tracking-[0.07em]',
                  vote ? 'bg-good/15 text-good' : 'bg-warn/15 text-warn',
                )}
              >
                <Check size={11} strokeWidth={3} aria-hidden />
                You voted {vote ? 'yes' : 'no'}
              </span>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => submit(!vote)}>
                Change
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The running split. Hidden at zero rather than showing an empty bar,
          which would read as "nobody wants this" rather than "no votes yet". */}
      {total > 0 ? (
        <div className="mt-1.5">
          <div className="flex h-[6px] overflow-hidden rounded-full bg-line" role="img" aria-label={`${yes} of ${total} want Learn`}>
            <motion.div
              className="bg-good"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="mt-0.5 text-2xs font-bold text-ink-3">
            <span className="text-good">{yes} yes</span> · <span className="text-warn">{tally.no} no</span> ·{' '}
            {pct}% of {total} {total === 1 ? 'vote' : 'votes'} want it
          </p>
        </div>
      ) : null}
    </motion.section>
  );
}
