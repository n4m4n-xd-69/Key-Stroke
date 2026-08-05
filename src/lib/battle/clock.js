import { serverTime } from './api.js';

/**
 * How far this browser's clock sits from Postgres's, in milliseconds.
 *
 * Without this, "everyone starts together" is unimplementable. Browser clocks
 * drift by seconds, and a player whose machine is four seconds fast would start
 * four seconds early — with nothing on screen to suggest anything went wrong.
 *
 * Round trips are asymmetric and jittery, so one sample is noise. Take several,
 * keep the ones with the lowest round-trip (least room for asymmetry to hide
 * in), and use the median. That is what NTP does, for the same reason.
 *
 * The local endpoints come from `performance.timeOrigin + performance.now()`
 * rather than `Date.now()` because that pair is monotonic: an NTP correction
 * landing mid-handshake cannot corrupt a sample.
 */
export async function measureClockOffset(samples = 5) {
  const readings = [];

  for (let i = 0; i < samples; i++) {
    const t0 = performance.timeOrigin + performance.now();
    let iso;
    try {
      iso = await serverTime();
    } catch {
      break; // offline or unconfigured — fall back to a zero offset
    }
    const t1 = performance.timeOrigin + performance.now();
    const server = Date.parse(iso);
    if (Number.isNaN(server)) continue;
    readings.push({ rtt: t1 - t0, offset: server + (t1 - t0) / 2 - t1 });
  }

  if (!readings.length) return 0;

  readings.sort((a, b) => a.rtt - b.rtt);
  const best = readings.slice(0, Math.min(3, readings.length)).map((r) => r.offset).sort((a, b) => a - b);
  return best[Math.floor(best.length / 2)];
}

/** Server time, as this device best understands it. */
export const serverNow = (offset = 0) => Date.now() + offset;

/** Milliseconds until an ISO instant, measured on the server's clock. */
export function msUntil(iso, offset = 0) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return null;
  return at - serverNow(offset);
}
