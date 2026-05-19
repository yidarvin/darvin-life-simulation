import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { CAREER_TRACKS } from '../../data/careerTracks';
import { getSwapCost, getTargetRank, canAffordSwap, getRequiredRank } from '../../data/swapTopology';

const TRACK_ORDER = ['faang', 'startup', 'phd', 'upwork'];

export function SwapPanel() {
  const stage = useGameStore((s) => s.stage);
  const currentTrack = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);
  const trySwap = useGameStore((s) => s.trySwap);

  if (stage !== 'career' || !currentTrack) return null;

  const targets = TRACK_ORDER.filter((t) => t !== currentTrack);

  return (
    <Panel title="[ Track Swap ]">
      <div className="text-phosphor-dim text-[11px] italic mb-3 leading-snug">
        Consider an alternate path. Costs rank. Resets specialization, hires, teams. Must be senior enough to absorb the drop.
      </div>
      <div className="grid grid-cols-3 gap-2">
        {targets.map((target) => (
          <SwapCard
            key={target}
            currentTrack={currentTrack}
            rank={rank}
            target={target}
            onSwap={() => trySwap(target)}
          />
        ))}
      </div>
    </Panel>
  );
}

function SwapCard({ currentTrack, rank, target, onSwap }) {
  const cost = getSwapCost(currentTrack, target);
  const targetRank = getTargetRank(rank, cost);
  const trackData = CAREER_TRACKS[target];
  const targetRankLabel = trackData.rankLabels[targetRank];

  const isUpwork = target === 'upwork';
  const locked = !canAffordSwap(rank, cost);
  const requiredRank = getRequiredRank(cost);

  return (
    <button
      onClick={onSwap}
      disabled={locked}
      className={clsx(
        'p-3 border bg-bg-deep text-left transition-colors',
        locked
          ? 'border-phosphor-faint opacity-40 cursor-not-allowed'
          : 'border-phosphor-faint hover:border-phosphor hover:bg-[#11201d]',
        !locked && isUpwork && 'opacity-90',
      )}
    >
      <div className="text-phosphor-bright font-mono text-[12px] mb-1">{trackData.label}</div>
      <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.1em] mb-2">
        Cost: -{cost} rank{cost === 1 ? '' : 's'}
      </div>
      {locked ? (
        <div className="text-phosphor-dim text-[11px] leading-tight">
          Locked — requires <span className="text-phosphor-bright">rank {requiredRank}+</span>
        </div>
      ) : (
        <div className="text-phosphor text-[11px] leading-tight">
          Land at <span className="text-phosphor-bright">{targetRankLabel}</span>
        </div>
      )}
    </button>
  );
}
