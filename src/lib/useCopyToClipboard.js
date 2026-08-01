import { useCallback, useState } from 'react';

/**
 * Copies text to the clipboard and flashes `copied` true for `duration` ms.
 * Shared by every copy button (chat messages, the code sidebar, code blocks)
 * so the flash timing and clipboard-unavailable handling can't drift.
 */
export function useCopyToClipboard(duration = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), duration);
      } catch {
        /* clipboard unavailable or blocked — nothing to fall back to */
      }
    },
    [duration],
  );

  return { copied, copy };
}
