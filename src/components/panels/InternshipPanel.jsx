import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ProgressBar } from '../shared/ProgressBar';
import { CurrencyValue } from '../shared/CurrencyValue';

export function InternshipPanel() {
  const internship = useGameStore((s) => s.internship);
  const influence = useGameStore((s) => s.currencies.influence);

  if (!internship.active) return null;

  const daysElapsed = Math.floor(internship.daysElapsed);
  const daysRemaining = internship.daysTotal - daysElapsed;
  const influenceEarned = influence - internship.influenceAtStart;

  return (
    <Panel title="[ Summer Internship ]">
      <div className="text-center mb-4">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.14em]">Currently interning at</div>
        <div
          className="font-display text-[28px] text-phosphor-bright leading-none mt-1.5"
          style={{ textShadow: '0 0 8px rgba(45, 212, 191, 0.4)' }}
        >
          {internship.company?.name || '—'}
        </div>
        <div className="text-phosphor-dim text-[11px] italic mt-1 leading-snug">
          {internship.company?.flavor || ''}
        </div>
      </div>

      <div className="grid grid-cols-[100px_1fr_100px] gap-3 items-center mb-3">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-wide">Day</div>
        <ProgressBar value={daysElapsed} max={internship.daysTotal} />
        <div className="text-phosphor tabular-nums text-right text-[11px]">
          {daysElapsed} / {internship.daysTotal}
        </div>
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <div className="text-phosphor-dim">Days remaining</div>
        <div className="text-phosphor tabular-nums">{daysRemaining}</div>
      </div>
      <div className="flex items-center justify-between text-[12px] mt-1">
        <div className="text-phosphor-dim">Performance (🌟 earned)</div>
        <CurrencyValue value={influenceEarned} size="sm" bright />
      </div>
    </Panel>
  );
}
