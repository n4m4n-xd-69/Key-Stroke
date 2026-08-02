import { supabase } from './supabase.js';
import { readLocal, writeLocal } from './storage.js';

/**
 * Feature votes.
 *
 * The vote is informational: it collects a signal and shows the running split
 * back to the people casting it. Nothing in the app gates on the result — if a
 * majority says no, that is a decision for a person to act on, not a flag.
 *
 * Which way you voted is remembered locally as well as remotely, so the banner
 * settles instantly on reload instead of flashing its unanswered state while a
 * round trip resolves.
 */

const localKey = (feature) => `keystroke.betavote.${feature}`;

export function readLocalVote(feature) {
  const v = readLocal(localKey(feature));
  return v === 'yes' ? true : v === 'no' ? false : null;
}

export function writeLocalVote(feature, vote) {
  writeLocal(localKey(feature), vote ? 'yes' : 'no');
}

/**
 * Records a vote, replacing any previous one from the same account.
 *
 * `upsert` on the composite primary key is what makes changing your mind a
 * correction rather than a second ballot — the count cannot be inflated by
 * clicking twice, and the constraint enforces that server-side rather than
 * trusting the client to behave.
 */
export async function castVote(userId, feature, vote) {
  writeLocalVote(feature, vote);
  if (!supabase || !userId) return { stored: 'local' };

  const { error } = await supabase
    .from('beta_votes')
    .upsert(
      { user_id: userId, feature, vote, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,feature' },
    );

  if (error) {
    console.warn('[vote] could not record remotely:', error.message);
    return { stored: 'local', error };
  }
  return { stored: 'cloud' };
}

/** The public split. The view exposes counts only, so this needs no session. */
export async function fetchTally(feature) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('beta_vote_tally')
    .select('feature,total,yes,no')
    .eq('feature', feature)
    .maybeSingle();

  if (error) {
    console.warn('[vote] could not read tally:', error.message);
    return null;
  }
  return data ?? { feature, total: 0, yes: 0, no: 0 };
}
