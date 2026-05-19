import { useGameStore } from '../game/state/store';

/**
 * Small text indicator in the footer showing whether the last save succeeded.
 */
export function SaveStatus() {
  const status = useGameStore((s) => s.ui.lastSaveStatus);
  const error = useGameStore((s) => s.ui.lastSaveError);

  if (status === 'failed') {
    return (
      <span className="text-error" title={error || 'Save failed'}>
        save failed
      </span>
    );
  }
  if (status === 'saved') {
    return <span className="text-phosphor-dim animate-pulse-once">saved</span>;
  }
  return <span className="text-phosphor-faint">·</span>;
}
