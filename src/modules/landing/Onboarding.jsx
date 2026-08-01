import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Braces, GraduationCap, Keyboard, Sparkles } from 'lucide-react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Segmented from '../../components/ui/Segmented.jsx';
import { useStore } from '../../lib/store.jsx';
import { cx } from '../../lib/format.js';

const GOALS = [
  { value: 5, label: '5 min', hint: 'Light touch' },
  { value: 15, label: '15 min', hint: 'Steady' },
  { value: 30, label: '30 min', hint: 'Serious' },
];

const FOCUS = [
  { id: 'speed', label: 'Type faster', icon: Keyboard, blurb: 'Prose, quotes and timed sprints.' },
  { id: 'code', label: 'Type code', icon: Braces, blurb: 'Real snippets in eleven languages.' },
  { id: 'learn', label: 'Learn to code', icon: GraduationCap, blurb: 'Concepts, practice, quizzes.' },
];

/**
 * Three-step first-run flow. Deliberately skippable — nothing here blocks the
 * app, it just makes the first Home screen less empty.
 */
export default function Onboarding({ open, onClose, onStart }) {
  const { state, updateProfile } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(state.profile.name);
  const [goal, setGoal] = useState(state.profile.goalMinutes ?? 15);
  const [focus, setFocus] = useState('speed');

  const finish = () => {
    updateProfile({ name: name.trim(), goalMinutes: goal, onboarded: true });
    onClose();
    onStart?.(focus);
  };

  const skip = () => {
    updateProfile({ onboarded: true });
    onClose();
  };

  return (
    <Modal open={open} onClose={skip} size="md" dismissable>
      <div className="relative overflow-hidden">
        <div className="aurora relative px-3 pb-2 pt-4">
          <div className="relative">
            <span className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface px-1 py-px text-2xs font-extrabold uppercase tracking-[0.1em] text-brand">
              <Sparkles size={11} aria-hidden /> Welcome
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.03em]">
              Let's set up your <span className="grad-text">practice</span>.
            </h2>
            <p className="mt-0.5 text-sm text-ink-3">Three quick questions. You can change all of them later.</p>
          </div>
        </div>

        <div className="px-3 pb-1">
          <div className="mb-2 flex gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cx('h-0.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-brand-solid' : 'bg-line')}
              />
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
            {step === 0 ? (
              <div>
                <label htmlFor="ob-name" className="text-sm font-extrabold">
                  What should we call you?
                </label>
                <input
                  id="ob-name"
                  data-autofocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 h-[44px] w-full rounded-md border border-line bg-subtle/50 px-1.5 text-base outline-none focus:border-brand"
                />
                <p className="mt-0.5 text-xs text-ink-3">Stored on this device only. Leave it blank if you'd rather not.</p>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <p className="text-sm font-extrabold">How much do you want to practise a day?</p>
                <div className="mt-1.5">
                  <Segmented options={GOALS} value={goal} onChange={setGoal} label="Daily goal" />
                </div>
                <p className="mt-1 text-xs text-ink-3">
                  This sets the ring on your home screen. Consistency beats volume — 15 minutes daily outruns two hours on a Sunday.
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <p className="text-sm font-extrabold">What are you here for first?</p>
                <div className="mt-1.5 grid gap-1">
                  {FOCUS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFocus(f.id)}
                      className={cx(
                        'flex items-center gap-1.5 rounded-md border px-1.5 py-1.5 text-left transition-colors',
                        focus === f.id ? 'border-brand bg-brand-wash' : 'border-line hover:bg-subtle',
                      )}
                    >
                      <span
                        className={cx(
                          'grid h-[34px] w-[34px] place-items-center rounded-[10px]',
                          focus === f.id ? 'bg-brand-solid text-brand-ink' : 'bg-subtle text-ink-2',
                        )}
                        aria-hidden
                      >
                        <f.icon size={17} strokeWidth={2.2} />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold">{f.label}</span>
                        <span className="block text-xs text-ink-3">{f.blurb}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>

        <footer className="mt-2 flex items-center justify-between border-t border-line px-3 py-2">
          <Button variant="quiet" onClick={skip}>
            Skip
          </Button>
          <div className="flex gap-1">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : null}
            {step < 2 ? (
              <Button variant="primary" iconRight={ArrowRight} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" iconRight={ArrowRight} onClick={finish}>
                Start practising
              </Button>
            )}
          </div>
        </footer>
      </div>
    </Modal>
  );
}
