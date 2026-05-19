import { useGameStore } from './game/state/store';
import { Panel } from './components/shared/Panel';
import { ActionButton } from './components/shared/ActionButton';
import { Button } from './components/shared/Button';
import { CurrencyValue } from './components/shared/CurrencyValue';

export default function App() {
  const currencies = useGameStore((s) => s.currencies);
  const click = useGameStore((s) => s.click);
  const devMode = useGameStore((s) => s.meta.devMode);
  const toggleDevMode = useGameStore((s) => s.toggleDevMode);
  const reset = useGameStore((s) => s.reset);
  const perSecondKnowledge = useGameStore((s) => s.perSecond.knowledge);
  const setPassive = useGameStore((s) => s._setPassive);

  return (
    <main className="min-h-screen max-w-[920px] mx-auto p-8">
      <header className="text-center mb-12 pt-4">
        <h1
          className="font-display text-6xl text-phosphor-bright leading-none tracking-wide"
          style={{ textShadow: '0 0 10px rgba(45, 212, 191, 0.45), 0 0 24px rgba(45, 212, 191, 0.2)' }}
        >
          Life is a Simulation
        </h1>
        <p className="mt-3 text-xs tracking-[0.16em] uppercase text-phosphor-dim">
          v0.0 // store wired · session 07
        </p>
      </header>

      <Panel title="[ Status HUD ]">
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            ['knowledge', '🧠', 'Knowledge'],
            ['money', '💵', 'Money'],
            ['research', '📄', 'Research'],
            ['applications', '📨', 'Applications'],
          ].map(([key, emoji, label]) => (
            <div key={key}>
              <CurrencyValue
                value={currencies[key]}
                money={key === 'money'}
                emoji={emoji}
                size="xl"
                bright
              />
              <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">{label}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="[ Actions ]">
        <div className="grid grid-cols-2 gap-2.5">
          <ActionButton
            command="./do_pset.sh"
            flavor="Spend three hours hunting an off-by-one error."
            reward="+1 Knowledge"
            onClick={() => click('knowledge')}
          />
          <ActionButton
            command="./beg_advisor.sh"
            flavor="Wash glassware. Maybe get a coauthor credit. Maybe not."
            reward="+1 Research"
            onClick={() => click('research')}
          />
          <ActionButton
            command="./ta_section.sh"
            flavor="Explain recursion to five students who 'kind of get it.'"
            reward="+$5 Money"
            onClick={() => click('money')}
          />
          <ActionButton
            command="./fire_off_cv.sh"
            flavor="Customize a cover letter. The recruiter will not read it."
            reward="+1 Application"
            onClick={() => click('applications')}
          />
        </div>
      </Panel>

      <Panel title="[ Tick Test ]">
        <div className="flex items-center gap-4 text-[12px] text-phosphor-dim">
          <span>Passive Knowledge rate:</span>
          <span className="text-phosphor tabular-nums">+{perSecondKnowledge.toFixed(1)}/sec</span>
          <Button onClick={() => setPassive('knowledge', perSecondKnowledge + 1)}>+1/sec</Button>
          <Button onClick={() => setPassive('knowledge', 0)}>Off</Button>
        </div>
        <p className="text-[11px] text-phosphor-dim italic mt-3">
          Click +1/sec, then watch the Knowledge counter tick. Toggle devmode in the footer to see 10x speedup.
        </p>
      </Panel>

      <footer className="mt-7 flex justify-center items-center gap-3 text-phosphor-dim text-[11px]">
        <Button onClick={() => { if (window.confirm('Wipe the run and start over?')) reset(); }}>
          Reset run
        </Button>
        {import.meta.env.VITE_SHOW_DEVMODE === 'true' && (
          <Button variant={devMode ? 'active' : 'normal'} onClick={toggleDevMode}>
            Devmode: {devMode ? '10x' : '1x'}
          </Button>
        )}
        <SaveStatus />
      </footer>
    </main>
  );
}

function SaveStatus() {
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
    return <span className="text-phosphor-dim">saved</span>;
  }
  return <span className="text-phosphor-faint">·</span>;
}
