import { useGameStore } from './game/state/store';
import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { ActionsPanel } from './components/panels/ActionsPanel';
import { Panel } from './components/shared/Panel';
import { Button } from './components/shared/Button';

export default function App() {
  // Tick test scaffolding — removed when shop generators land (session 12).
  const perSecondKnowledge = useGameStore((s) => s.perSecond.knowledge);
  const setPassive = useGameStore((s) => s._setPassive);

  return (
    <AppShell>
      <Header version="v0.0" stage="session 10 — actions panel" />

      <HUD />
      <ActionsPanel />

      <Panel title="[ Tick Test ]">
        <div className="flex items-center gap-4 text-[12px] text-phosphor-dim">
          <span>Passive Knowledge rate:</span>
          <span className="text-phosphor tabular-nums">+{perSecondKnowledge.toFixed(1)}/sec</span>
          <Button onClick={() => setPassive('knowledge', perSecondKnowledge + 1)}>+1/sec</Button>
          <Button onClick={() => setPassive('knowledge', 0)}>Off</Button>
        </div>
        <p className="text-[11px] text-phosphor-dim italic mt-3">
          Temporary dev scaffold. Removed once shop generators land in session 12.
        </p>
      </Panel>

      <Footer />
    </AppShell>
  );
}
