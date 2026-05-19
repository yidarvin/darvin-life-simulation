import { useState } from 'react';
import { Panel } from './components/shared/Panel';
import { Modal } from './components/shared/Modal';
import { ActionButton } from './components/shared/ActionButton';
import { Button } from './components/shared/Button';
import { ProgressBar } from './components/shared/ProgressBar';
import { CurrencyValue } from './components/shared/CurrencyValue';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

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
          v0.0 // atoms preview · session 06
        </p>
      </header>

      <Panel title="[ Status HUD ]">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <CurrencyValue value={1234} emoji="🧠" size="xl" bright />
            <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">Knowledge</div>
          </div>
          <div>
            <CurrencyValue value={5876} money emoji="💵" size="xl" bright />
            <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">Money</div>
          </div>
          <div>
            <CurrencyValue value={42} emoji="📄" size="xl" bright />
            <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">Research</div>
          </div>
          <div>
            <CurrencyValue value={17} emoji="📨" size="xl" bright />
            <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">Applications</div>
          </div>
        </div>
      </Panel>

      <Panel title="[ Actions ]">
        <div className="grid grid-cols-2 gap-2.5">
          <ActionButton
            command="./do_pset.sh"
            flavor="Spend three hours hunting an off-by-one error."
            reward="+1 Knowledge"
            onClick={() => {}}
          />
          <ActionButton
            command="./beg_advisor.sh"
            flavor="Wash glassware. Maybe get a coauthor credit. Maybe not."
            reward="+1 Research"
            onClick={() => {}}
          />
          <ActionButton
            command="./ta_section.sh"
            flavor="Explain recursion to five students who 'kind of get it.'"
            reward="+$5 Money"
            onClick={() => {}}
          />
          <ActionButton
            command="./fire_off_cv.sh"
            flavor="Customize a cover letter. The recruiter will not read it."
            reward="+1 Application"
            onClick={() => {}}
            disabled
          />
        </div>
      </Panel>

      <Panel title="[ Progress ]">
        <div className="space-y-2">
          {[
            { label: '🧠 Knowledge', value: 30, max: 100 },
            { label: '💵 Money', value: 500, max: 500, money: true },
            { label: '📄 Research', value: 12, max: 20 },
            { label: '📨 Applications', value: 9, max: 30 },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-[130px_1fr_100px] gap-3.5 items-center text-[12px]">
              <div className="text-phosphor-dim text-[11px] uppercase tracking-wide">{row.label}</div>
              <ProgressBar value={row.value} max={row.max} />
              <div className="text-phosphor tabular-nums text-right">
                <CurrencyValue value={row.value} money={row.money} size="sm" /> /{' '}
                <CurrencyValue value={row.max} money={row.money} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <footer className="mt-7 flex justify-center items-center gap-3 text-phosphor-dim text-[11px]">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button variant="active" onClick={() => {}}>Devmode: 10x</Button>
        <span>saved</span>
      </footer>

      <Modal
        open={modalOpen}
        title="Atoms working"
        actions={[
          { label: 'Acknowledge', onClick: () => setModalOpen(false), variant: 'primary' },
        ]}
        onClose={() => setModalOpen(false)}
      >
        <p>
          You&apos;re looking at the Panel, ActionButton, Button, ProgressBar, CurrencyValue, and Modal atoms.
        </p>
        <p>
          If any of these look broken, fix here. Future sessions assume these work.
        </p>
      </Modal>
    </main>
  );
}
