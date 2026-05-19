import { Modal } from './shared/Modal';

export function AboutModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      title="About"
      actions={[{ label: 'Close', onClick: onClose, variant: 'primary' }]}
      onClose={onClose}
    >
      <p className="!mb-2">
        <span className="text-phosphor-bright font-mono">Life is a Simulation</span> — a CS career clicker by{' '}
        <a
          href="https://darvinyi.com"
          target="_blank"
          rel="noreferrer"
          className="underline text-phosphor hover:text-phosphor-bright"
        >
          Darvinyi
        </a>.
      </p>
      <p className="text-[12px] text-phosphor-dim">
        Build a career. Hit an endgame. Or fall into Upwork. The save is local to your browser.
      </p>
      <div className="mt-4 border-t border-phosphor-faint pt-3 text-left text-[11px] text-phosphor-dim leading-snug">
        <div className="font-mono uppercase tracking-[0.14em] mb-1.5 text-phosphor text-[10px]">
          Controls
        </div>
        <div>· Click action buttons to earn currency</div>
        <div>· Buy shop items to multiply your rates</div>
        <div>· Year transitions consume currency for the next phase</div>
        <div>· At each career rank, new mechanics unlock</div>
        <div>· Track swaps cost ranks. Upwork is reversible but punishing</div>
        <div className="mt-2 font-mono uppercase tracking-[0.14em] text-phosphor text-[10px]">
          Keyboard
        </div>
        <div>· Esc — close most modals</div>
        <div>· Tab — navigate within modals</div>
      </div>
      <div className="mt-4 text-[10px] text-phosphor-dim italic">
        Built with Claude Code. v0.0. Critical reception: my mom says it&apos;s &ldquo;interesting.&rdquo;
      </div>
    </Modal>
  );
}
