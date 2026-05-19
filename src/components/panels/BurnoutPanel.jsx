import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ProgressBar } from '../shared/ProgressBar';
import {
  getBurnoutMultiplier,
  getBurnoutLabel,
  getBurnoutColorClass,
  BURNOUT_TIRED,
  BURNOUT_BURNED,
  BURNOUT_COLLAPSE,
} from '../../utils/burnout';

export function BurnoutPanel() {
  const burnout = useGameStore((s) => s.burnout);
  const stage = useGameStore((s) => s.stage);

  if (stage !== 'career' && stage !== 'internship') return null;

  const value = Math.floor(burnout);
  const mult = getBurnoutMultiplier(burnout);
  const label = getBurnoutLabel(burnout);
  const colorClass = getBurnoutColorClass(burnout);
  const pct = Math.round(mult * 100);

  return (
    <Panel title="[ Wellness ]">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.14em]">
              🔥 Burnout
            </div>
            <div className={clsx('text-[11px] uppercase tracking-[0.12em] tabular-nums', colorClass)}>
              {value} / {BURNOUT_COLLAPSE} · {label}
            </div>
          </div>
          <ProgressBar value={value} max={BURNOUT_COLLAPSE} complete={value >= BURNOUT_BURNED} />
          <div className="flex justify-between text-[9px] text-phosphor-dim mt-1">
            <span>fine (0)</span>
            <span>tired ({BURNOUT_TIRED})</span>
            <span>burned ({BURNOUT_BURNED})</span>
            <span>collapse</span>
          </div>
        </div>
        <div className="text-right pl-2 border-l border-phosphor-faint">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.12em]">Rates</div>
          <div className={clsx('font-display text-[24px] tabular-nums', colorClass)}>{pct}%</div>
        </div>
      </div>
    </Panel>
  );
}
