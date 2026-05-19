import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { CAREER_TRACKS } from '../../data/careerTracks';
import { getSpec } from '../../data/specializations';
import { CURRENCY_EMOJI } from '../../utils/currency';

export function CareerLadderPanel() {
  const stage = useGameStore((s) => s.stage);
  const track = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);

  if (stage !== 'career' || !track) return null;

  const trackData = CAREER_TRACKS[track];
  if (!trackData) return null;

  const currentFlavor = trackData.rankFlavor[rank];

  return (
    <Panel title={`[ ${trackData.label} Track ]`}>
      <div className="text-center mb-5">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.14em]">Current rank</div>
        <div
          className="font-display text-[32px] text-phosphor-bright leading-none mt-1.5"
          style={{ textShadow: '0 0 8px rgba(45, 212, 191, 0.4)' }}
        >
          {trackData.rankLabels[rank]}
        </div>
        <SpecializationBadge />
        {currentFlavor && (
          <div className="text-phosphor-dim text-[11px] italic mt-2 max-w-md mx-auto leading-snug">
            {currentFlavor}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }, (_, i) => {
          const r = i + 1;
          const isCurrent = r === rank;
          const isPast = r < rank;
          const isFuture = r > rank;
          return (
            <div
              key={r}
              className={clsx(
                'border p-2 text-center transition-colors',
                isCurrent && 'border-phosphor-bright bg-[#11201d]',
                isPast && 'border-phosphor-faint bg-bg-deep opacity-70',
                isFuture && 'border-phosphor-faint bg-bg-deep opacity-30',
              )}
              style={isCurrent ? { boxShadow: '0 0 8px rgba(45, 212, 191, 0.3)' } : undefined}
            >
              <div
                className={clsx(
                  'font-mono text-[9px] uppercase tracking-[0.12em]',
                  isCurrent ? 'text-phosphor-bright' : 'text-phosphor-dim',
                )}
              >
                R{r}
              </div>
              <div
                className={clsx(
                  'font-mono text-[10px] mt-1 leading-tight',
                  isCurrent ? 'text-phosphor-bright' : 'text-phosphor-dim',
                )}
              >
                {trackData.rankLabels[r]}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function SpecializationBadge() {
  const track = useGameStore((s) => s.career.currentTrack);
  const spec = useGameStore((s) => s.career.specialization);

  if (!spec) return null;
  const specData = getSpec(track, spec.id);
  if (!specData) return null;

  const pct = Math.round((specData.effect.multiplier - 1) * 100);
  return (
    <div className="inline-block mt-2 px-3 py-0.5 border border-phosphor-faint text-phosphor-dim text-[10px] uppercase tracking-[0.12em]">
      {specData.label} <span className="text-phosphor"> · +{pct}% {CURRENCY_EMOJI[specData.effect.currency]}</span>
    </div>
  );
}
