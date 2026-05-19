import { useGameStore } from './game/state/store';
import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { Panel } from './components/shared/Panel';
import { ActionButton } from './components/shared/ActionButton';
import { Button } from './components/shared/Button';

export default function App() {
  // Temporary: keep the action buttons and tick-test inline until session 10 extracts them.
  const click = useGameStore((s) => s.click);
  const perSecondKnowledge = useGameStore((s) => s.perSecond.knowledge);
  const setPassive = useGameStore((s) => s._setPassive);

  return (
    <AppShell>
      <Header version="v0.0" stage="session 09 — shell + HUD" />

      <HUD />

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
          Click +1/sec, then watch the HUD&apos;s Knowledge cell tick. Toggle devmode to see 10x speed.
        </p>
      </Panel>

      <Footer />
    </AppShell>
  );
}
