import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { Button } from '../shared/Button';
import { CURRENCY_EMOJI } from '../../utils/currency';
import { getAllocMultiplier } from '../../data/careerTracks';

const BUCKETS = [
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'money', label: 'Money' },
  { key: 'research', label: 'Research' },
];

const ADJUST_STEPS = [-100, -10, 10, 100];

export function InfluenceAllocationPanel() {
  const stage = useGameStore((s) => s.stage);
  const rank = useGameStore((s) => s.career.rank);
  const allocation = useGameStore((s) => s.career.influenceAllocation);
  const influence = useGameStore((s) => s.currencies.influence);
  const setInfluenceAllocation = useGameStore((s) => s.setInfluenceAllocation);

  if (stage !== 'career' || rank < 3) return null;

  const totalAllocated = allocation.knowledge + allocation.money + allocation.research;
  const available = Math.max(0, Math.floor(influence) - totalAllocated);

  const onAdjust = (bucket, delta) => {
    const current = allocation[bucket];
    let nextValue = current + delta;
    if (nextValue < 0) nextValue = 0;
    const others = totalAllocated - current;
    nextValue = Math.min(nextValue, Math.floor(influence) - others);
    setInfluenceAllocation({ [bucket]: nextValue });
  };

  const onMax = (bucket) => {
    const others = totalAllocated - allocation[bucket];
    const maxForBucket = Math.max(0, Math.floor(influence) - others);
    setInfluenceAllocation({ [bucket]: maxForBucket });
  };

  const onReset = () => {
    setInfluenceAllocation({ knowledge: 0, money: 0, research: 0 });
  };

  const fauxState = {
    stage: 'career',
    career: { rank, influenceAllocation: allocation },
    currencies: { influence },
  };

  return (
    <Panel title="[ Influence Allocation ]">
      <div className="flex items-center justify-between mb-3 text-[11px]">
        <div className="text-phosphor-dim">
          Total: <span className="text-phosphor tabular-nums">{Math.floor(influence).toLocaleString()}</span> 🌟
        </div>
        <div className="text-phosphor-dim">
          Available: <span className="text-phosphor tabular-nums">{available.toLocaleString()}</span> 🌟
        </div>
        <Button onClick={onReset}>Reset</Button>
      </div>

      <div className="space-y-2.5">
        {BUCKETS.map((b) => {
          const mult = getAllocMultiplier(fauxState, b.key);
          return (
            <div key={b.key} className="grid grid-cols-1 sm:grid-cols-[140px_1fr_60px_280px] gap-2 items-center text-[11px]">
              <div className="text-phosphor-dim uppercase tracking-wide">
                {CURRENCY_EMOJI[b.key]} {b.label}
              </div>
              <div className="text-phosphor tabular-nums">
                <span className="text-phosphor-bright font-mono text-[13px]">
                  {allocation[b.key].toLocaleString()}
                </span>{' '}
                🌟
              </div>
              <div className="text-phosphor-bright text-[12px] tabular-nums font-mono text-center">
                ×{mult.toFixed(2)}
              </div>
              <div className="flex gap-1 justify-start sm:justify-end flex-wrap">
                {ADJUST_STEPS.map((delta) => (
                  <AdjustButton
                    key={delta}
                    delta={delta}
                    disabled={delta > 0 ? available === 0 : allocation[b.key] === 0}
                    onClick={() => onAdjust(b.key, delta)}
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </AdjustButton>
                ))}
                <AdjustButton
                  disabled={available === 0}
                  onClick={() => onMax(b.key)}
                >
                  Max
                </AdjustButton>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mt-3 text-center">
        Earmarked, not spent. Caps at ×5.00 per bucket.
      </div>
    </Panel>
  );
}

function AdjustButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors min-w-[36px]',
        disabled
          ? 'border-phosphor-faint text-phosphor-dim cursor-not-allowed opacity-50'
          : 'border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor cursor-pointer',
      )}
    >
      {children}
    </button>
  );
}
