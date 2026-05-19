import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { getHiresCap, getHireCost } from '../../data/hires';
import { CURRENCY_EMOJI, canAfford, formatCost } from '../../utils/currency';

export function HirePanel() {
  const stage = useGameStore((s) => s.stage);
  const rank = useGameStore((s) => s.career.rank);
  const track = useGameStore((s) => s.career.currentTrack);
  const hires = useGameStore((s) => s.career.hires);
  const currencies = useGameStore((s) => s.currencies);
  const hireSomeone = useGameStore((s) => s.hireSomeone);

  if (stage !== 'career' || !track || rank < 4) return null;

  const cap = getHiresCap(rank);
  const slotsRemaining = cap - hires.length;
  const cost = getHireCost(track, hires.length);
  const canHire = slotsRemaining > 0 && canAfford(currencies, cost);

  return (
    <Panel title="[ Team ]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.12em]">
          Hires: <span className="text-phosphor tabular-nums">{hires.length} / {cap}</span>
        </div>
        <HireButton
          disabled={!canHire}
          cost={cost}
          slotsRemaining={slotsRemaining}
          onClick={() => hireSomeone()}
        />
      </div>

      {hires.length === 0 ? (
        <div className="text-phosphor-dim text-[11px] italic text-center py-3">
          No hires yet. Click Hire to bring on a team member.
        </div>
      ) : (
        <div className="space-y-1.5">
          {hires.map((hire) => (
            <HireRow key={hire.id} hire={hire} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function HireButton({ disabled, cost, slotsRemaining, onClick }) {
  if (slotsRemaining === 0) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-phosphor-dim border border-phosphor-faint px-3 py-1">
        team full
      </span>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors',
        disabled
          ? 'border-phosphor-faint text-phosphor-dim cursor-not-allowed'
          : 'border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg cursor-pointer',
      )}
    >
      hire ({formatCost(cost)})
    </button>
  );
}

function HireRow({ hire }) {
  return (
    <div className="grid grid-cols-[1fr_140px_140px_60px] gap-3 items-center px-3 py-2 border border-phosphor-faint bg-bg-deep text-[11px]">
      <div>
        <div className="text-phosphor-bright font-mono">{hire.name}</div>
        <div className="text-phosphor-dim text-[10px] uppercase tracking-wide mt-0.5">{hire.roleLabel}</div>
      </div>
      <div className="text-phosphor tabular-nums text-[11px]">
        {formatRates(hire.rates)}
      </div>
      <div className="text-phosphor-dim text-[10px] uppercase tracking-wide">
        Level <span className="text-phosphor tabular-nums">{hire.level}</span>
      </div>
      <div />
    </div>
  );
}

function formatRates(rates) {
  return Object.entries(rates)
    .map(([c, v]) => {
      const prefix = c === 'money' ? '$' : '';
      const suffix = c === 'money' ? '/s' : ` ${CURRENCY_EMOJI[c]}/s`;
      return `${prefix}${v}${suffix}`;
    })
    .join('  ');
}
