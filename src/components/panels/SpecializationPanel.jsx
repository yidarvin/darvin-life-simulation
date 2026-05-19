import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { SPECIALIZATIONS } from '../../data/specializations';
import { CURRENCY_EMOJI } from '../../utils/currency';
import { copy } from '../../data/copy';

const CURRENCY_NAMES = {
  knowledge: 'Knowledge',
  money: 'Money',
  research: 'Research',
  influence: 'Influence',
};

export function SpecializationPanel() {
  const stage = useGameStore((s) => s.stage);
  const track = useGameStore((s) => s.career.currentTrack);
  const spec = useGameStore((s) => s.career.specialization);
  const chooseSpecialization = useGameStore((s) => s.chooseSpecialization);

  if (stage !== 'career' || !track) return null;
  if (spec) return null;

  const options = SPECIALIZATIONS[track] || [];
  const title = copy.specialization.panelTitle[track] || 'Pick a specialty';
  const subtitle = copy.specialization.panelSubtitle[track] || '';

  return (
    <Panel title={`[ ${title} ]`}>
      <div className="text-phosphor-dim text-[12px] italic leading-snug mb-4">
        {subtitle}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => chooseSpecialization(option.id)}
            className={clsx(
              'p-3 border bg-bg-deep text-left transition-colors',
              'border-phosphor-faint hover:border-phosphor hover:bg-[#11201d]',
            )}
          >
            <div className="text-phosphor-bright font-mono text-[12px] mb-1.5 leading-tight">
              {option.label}
            </div>
            <div className="text-phosphor-dim text-[11px] italic leading-snug mb-2 min-h-[60px]">
              {option.flavor}
            </div>
            <div className="text-phosphor text-[10px] uppercase tracking-[0.1em]">
              +{Math.round((option.effect.multiplier - 1) * 100)}% {CURRENCY_EMOJI[option.effect.currency]}{' '}
              {CURRENCY_NAMES[option.effect.currency]}
            </div>
          </button>
        ))}
      </div>
      <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mt-3 text-center">
        {copy.specialization.confirmHint}
      </div>
    </Panel>
  );
}
