import { useState, useEffect } from 'react';
import { Modal } from './shared/Modal';
import { sound } from '../utils/sound';

export function AboutModal({ open, onClose }) {
  const [muted, setMutedState] = useState(sound.isMuted());
  const [volume, setVolumeState] = useState(sound.getVolume());

  useEffect(() => {
    if (open) {
      setMutedState(sound.isMuted());
      setVolumeState(sound.getVolume());
    }
  }, [open]);

  const toggleMute = () => {
    // Play click BEFORE toggling so a mute press still gives audible feedback.
    sound.play('click');
    const next = sound.toggleMuted();
    setMutedState(next);
    if (!next) sound.play('shopBuy');
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    sound.setVolume(v);
    setVolumeState(v);
  };

  const handleVolumeRelease = () => {
    sound.play('shopBuy');
  };

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

      <div className="mt-4 border-t border-phosphor-faint pt-3 text-left">
        <div className="font-mono uppercase tracking-[0.14em] text-phosphor text-[10px] mb-2">
          Sound
        </div>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={toggleMute}
            className="min-w-[44px] min-h-[44px] px-3 font-mono text-[10px] uppercase tracking-[0.1em] border border-phosphor-faint text-phosphor hover:border-phosphor hover:text-phosphor-bright cursor-pointer"
          >
            {muted ? 'unmute' : 'mute'}
          </button>
          <div className="flex-1">
            <div className="text-[10px] text-phosphor-dim uppercase tracking-[0.12em] mb-1 flex justify-between">
              <span>volume</span>
              <span className="tabular-nums">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              onMouseUp={handleVolumeRelease}
              onTouchEnd={handleVolumeRelease}
              disabled={muted}
              className="w-full h-2 bg-bg-deep border border-phosphor-faint appearance-none cursor-pointer accent-phosphor disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-phosphor-faint pt-3 text-left text-[11px] text-phosphor-dim leading-snug">
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
