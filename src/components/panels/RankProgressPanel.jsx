import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ProgressBar } from '../shared/ProgressBar';
import { CurrencyValue } from '../shared/CurrencyValue';
import { getRankUpCost } from '../../data/rankUpCosts';
import { CAREER_TRACKS } from '../../data/careerTracks';
import { canAfford, CURRENCY_EMOJI } from '../../utils/currency';

const CURRENCY_NAMES = {
  knowledge: 'Knowledge',
  money: 'Money',
  research: 'Research',
  applications: 'Applications',
  influence: 'Influence',
  equity: 'Equity',
};

export function RankProgressPanel() {
  const stage = useGameStore((s) => s.stage);
  const track = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);
  const currencies = useGameStore((s) => s.currencies);
  const tryRankUp = useGameStore((s) => s.tryRankUp);

  if (stage !== 'career' || !track) return null;

  const cost = getRankUpCost(track, rank);

  if (!cost) {
    const trackData = CAREER_TRACKS[track];
    return (
      <Panel title="[ Rank Progress ]">
        <div className="text-center py-2">
          <div className="text-phosphor-bright text-[14px] font-mono mb-1">
            {trackData.endgame.label}
          </div>
          <div className="text-phosphor-dim text-[11px] italic">
            Top of the {trackData.label} track. See the endgame panel below.
          </div>
        </div>
      </Panel>
    );
  }

  const ready = canAfford(currencies, cost);
  const trackData = CAREER_TRACKS[track];
  const nextLabel = trackData.rankLabels[rank + 1];

  return (
    <Panel title="[ Rank Progress ]">
      <div className="text-center mb-4">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.14em]">Next rank</div>
        <div className="font-display text-[24px] text-phosphor leading-none mt-1">
          {nextLabel}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {Object.entries(cost).map(([currency, target]) => {
          const value = currencies[currency] ?? 0;
          return (
            <div key={currency} className="grid grid-cols-[150px_1fr_140px] gap-3 items-center text-[12px]">
              <div className="text-phosphor-dim text-[11px] uppercase tracking-wide">
                {CURRENCY_EMOJI[currency]} {CURRENCY_NAMES[currency]}
              </div>
              <ProgressBar value={value} max={target} />
              <div className="text-phosphor tabular-nums text-right text-[11px]">
                <CurrencyValue value={value} money={currency === 'money'} size="sm" /> /{' '}
                <CurrencyValue value={target} money={currency === 'money'} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => tryRankUp()}
        disabled={!ready}
        className={clsx(
          'w-full py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors',
          ready
            ? 'bg-bg-deep border-phosphor text-phosphor-bright cursor-pointer hover:bg-phosphor hover:text-bg'
            : 'bg-bg-deep border-phosphor-faint text-phosphor-dim cursor-not-allowed',
        )}
      >
        {ready ? `Advance to ${nextLabel}` : 'Grind further'}
      </button>
    </Panel>
  );
}
