import { useGameStore } from '../game/state/store';
import { Button } from './shared/Button';
import { SaveStatus } from './SaveStatus';

/**
 * Footer: Reset + (env-gated) Devmode + save status.
 */
export function Footer() {
  const devMode = useGameStore((s) => s.meta.devMode);
  const toggleDevMode = useGameStore((s) => s.toggleDevMode);
  const reset = useGameStore((s) => s.reset);

  const showDevmode = import.meta.env.VITE_SHOW_DEVMODE === 'true';

  return (
    <footer className="mt-7 flex justify-center items-center gap-3 text-phosphor-dim text-[11px]">
      <Button
        onClick={() => {
          if (window.confirm('Wipe the run and start over?')) reset();
        }}
      >
        Reset run
      </Button>
      {showDevmode && (
        <Button variant={devMode ? 'active' : 'normal'} onClick={toggleDevMode}>
          Devmode: {devMode ? '10x' : '1x'}
        </Button>
      )}
      <SaveStatus />
    </footer>
  );
}
