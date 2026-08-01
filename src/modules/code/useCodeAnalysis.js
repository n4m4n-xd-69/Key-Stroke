import { useCallback, useEffect, useRef, useState } from 'react';
import { analyseCode, clearAICache } from '../../lib/ai.js';

/**
 * One analysis, shared by the surfaces that render it.
 *
 * The intro block above the code and the tabs beside it describe the same
 * snippet, so the request is owned here and passed down rather than fired
 * twice. `analyseCode` is memoised by content hash, so a second caller would
 * not have cost a second request — but it would have meant two loading states
 * settling independently, and the intro flickering back to a skeleton whenever
 * the panel re-ran.
 */
export default function useCodeAnalysis(code, languageName) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const run = useCallback(
    async ({ force = false } = {}) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (force) clearAICache();
      setLoading(true);

      try {
        const data = await analyseCode(code, languageName, { signal: controller.signal });
        if (!controller.signal.aborted) setAnalysis(data);
      } catch {
        // An abort means a newer run took over; there is nothing to show and
        // nothing to report. Every other failure already resolves to the
        // offline reading inside analyseCode.
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [code, languageName],
  );

  useEffect(() => {
    // Clear first: without this the previous snippet's analysis stays on screen
    // under the new snippet's title until the fresh one lands.
    setAnalysis(null);
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  return { analysis, loading, reload: run };
}
