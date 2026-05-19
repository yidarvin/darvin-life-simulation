import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import {
  getHiresCap,
  getHireCost,
  getLevelUpCost,
  getPoachCost,
  MAX_HIRE_LEVEL,
} from '../../data/hires';
import { CURRENCY_EMOJI, canAfford, formatCost } from '../../utils/currency';

export function HirePanel() {
  const stage = useGameStore((s) => s.stage);
  const rank = useGameStore((s) => s.career.rank);
  const track = useGameStore((s) => s.career.currentTrack);
  const hires = useGameStore((s) => s.career.hires);
  const currencies = useGameStore((s) => s.currencies);
  const hireSomeone = useGameStore((s) => s.hireSomeone);
  const poachSomeone = useGameStore((s) => s.poachSomeone);

  if (stage !== 'career' || !track || rank < 4) return null;

  const cap = getHiresCap(rank);
  const slotsRemaining = cap - hires.length;

  const hireCost = getHireCost(track, hires.length);
  const canHire = slotsRemaining > 0 && canAfford(currencies, hireCost);

  const poachAvailable = rank >= 5;
  const poachCost = poachAvailable ? getPoachCost(track, hires.length) : null;
  const canPoach = poachAvailable && slotsRemaining > 0 && canAfford(currencies, poachCost);

  return (
    <Panel title="[ Team ]">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.12em]">
          Hires: <span className="text-phosphor tabular-nums">{hires.length} / {cap}</span>
        </div>
        <div className="flex gap-2">
          {slotsRemaining > 0 ? (
            <ActionPillButton disabled={!canHire} onClick={() => hireSomeone()}>
              hire ({formatCost(hireCost)})
            </ActionPillButton>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-phosphor-dim border border-phosphor-faint px-3 py-1">
              team full
            </span>
          )}
          {poachAvailable && slotsRemaining > 0 && (
            <ActionPillButton disabled={!canPoach} onClick={() => poachSomeone()} tone="warm">
              poach lvl 3 ({formatCost(poachCost)})
            </ActionPillButton>
          )}
        </div>
      </div>

      {hires.length === 0 ? (
        <div className="text-phosphor-dim text-[11px] italic text-center py-3">
          No hires yet. Click Hire to bring on a team member.
        </div>
      ) : (
        <div className="space-y-1.5">
          {hires.map((hire) => (
            <HireRow key={hire.id} hire={hire} track={track} canManage={rank >= 5} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function ActionPillButton({ disabled, onClick, children, tone = 'normal' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors',
        disabled
          ? 'border-phosphor-faint text-phosphor-dim cursor-not-allowed'
          : tone === 'warm'
            ? 'border-[#f0c674] text-[#f0c674] hover:bg-[#f0c674] hover:text-bg cursor-pointer'
            : 'border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg cursor-pointer',
      )}
    >
      {children}
    </button>
  );
}

function HireRow({ hire, track, canManage }) {
  const currencies = useGameStore((s) => s.currencies);
  const levelUpHire = useGameStore((s) => s.levelUpHire);
  const fireHire = useGameStore((s) => s.fireHire);

  const isMaxLevel = hire.level >= MAX_HIRE_LEVEL;
  const levelUpCost = !isMaxLevel ? getLevelUpCost(track, hire.level) : null;
  const canAffordLevelUp = levelUpCost && canAfford(currencies, levelUpCost);

  const handleFire = () => {
    if (window.confirm(`Fire ${hire.name}?`)) {
      fireHire(hire.id);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_140px_90px_220px] gap-3 items-center px-3 py-2 border border-phosphor-faint bg-bg-deep text-[11px]">
      <div>
        <div className="text-phosphor-bright font-mono">
          {hire.name}
          {hire.poached && (
            <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-phosphor-dim border border-phosphor-faint px-1.5 py-0.5">
              poached
            </span>
          )}
        </div>
        <div className="text-phosphor-dim text-[10px] uppercase tracking-wide mt-0.5">{hire.roleLabel}</div>
      </div>
      <div className="text-phosphor tabular-nums text-[11px]">
        {formatRates(hire.rates, hire.level)}
      </div>
      <div className="text-phosphor-dim text-[10px] uppercase tracking-wide text-center">
        Level <span className="text-phosphor tabular-nums">{hire.level}</span>
      </div>
      <div className="flex gap-1 justify-end">
        {canManage && (
          <>
            {isMaxLevel ? (
              <span className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-phosphor-dim border border-phosphor-faint">
                max
              </span>
            ) : (
              <ActionPillButton
                disabled={!canAffordLevelUp}
                onClick={() => levelUpHire(hire.id)}
              >
                lvl+1 ({formatCost(levelUpCost)})
              </ActionPillButton>
            )}
            <ActionPillButton tone="warm" onClick={handleFire}>
              fire
            </ActionPillButton>
          </>
        )}
      </div>
    </div>
  );
}

function formatRates(rates, level) {
  return Object.entries(rates)
    .map(([c, baseRate]) => {
      const v = baseRate * level;
      const prefix = c === 'money' ? '$' : '';
      const suffix = c === 'money' ? '/s' : ` ${CURRENCY_EMOJI[c]}/s`;
      return `${prefix}${v}${suffix}`;
    })
    .join('  ');
}
