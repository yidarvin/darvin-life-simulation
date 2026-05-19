import { useEffect, useRef } from 'react';

/**
 * On mount, record the currently-focused element. On unmount, restore focus to it.
 * Useful for modals that open from a button click — closing the modal should return
 * focus to that button.
 */
export function usePreviousFocus(active) {
  const previousRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    previousRef.current = document.activeElement;
    return () => {
      if (previousRef.current && typeof previousRef.current.focus === 'function') {
        previousRef.current.focus();
      }
    };
  }, [active]);
}
