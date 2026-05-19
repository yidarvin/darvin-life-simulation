import { useState } from 'react';
import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ProgressBar } from '../shared/ProgressBar';
import { CONNECT_BUNDLES, CONNECTS_CAP } from '../../utils/upworkTax';

export function UpworkPanel() {
  const stage = useGameStore((s) => s.stage);
  const track = useGameStore((s) => s.career.currentTrack);
  const upwork = useGameStore((s) => s.upwork);
  const money = useGameStore((s) => s.currencies.money);
  const bidOnGig = useGameStore((s) => s.bidOnGig);
  const buyConnects = useGameStore((s) => s.buyConnects);

  const [lastBid, setLastBid] = useState(null);

  if (stage !== 'career' || track !== 'upwork') return null;

  const connects = Math.floor(upwork.connects);
  const jss = upwork.jss;
  const jssClass = jss >= 90
    ? 'text-phosphor-bright'
    : jss >= 80
      ? 'text-phosphor'
      : 'text-error';

  const handleBid = () => {
    const result = bidOnGig();
    if (result.ok) {
      setLastBid(result);
      setTimeout(() => setLastBid(null), 6_000);
    } else {
      setLastBid({ ok: false, reason: result.reason, cost: result.cost });
      setTimeout(() => setLastBid(null), 3_000);
    }
  };

  return (
    <Panel title="[ Upwork Status ]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="border border-phosphor-faint bg-bg-deep p-2.5">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mb-1">🪙 Connects</div>
          <div className="font-display text-[24px] text-phosphor-bright tabular-nums">
            {connects}
            <span className="text-phosphor-dim text-[12px] ml-1">/ {CONNECTS_CAP}</span>
          </div>
          <ProgressBar value={connects} max={CONNECTS_CAP} className="mt-1.5" />
          <div className="text-phosphor-dim text-[9px] mt-1">+1/sec</div>
        </div>

        <div className="border border-phosphor-faint bg-bg-deep p-2.5">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mb-1">⭐ Job Success</div>
          <div className={clsx('font-display text-[24px] tabular-nums', jssClass)}>
            {jss}%
          </div>
          <div className="text-phosphor-dim text-[9px] mt-2">
            {jss >= 90 ? 'top rated' : jss >= 80 ? 'fair' : 'recovering'}
          </div>
        </div>

        <div className="border border-phosphor-faint bg-bg-deep p-2.5">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mb-1">📉 Lost to platform</div>
          <div className="font-display text-[24px] text-error tabular-nums">
            ${Math.floor(upwork.platformTaxLifetime).toLocaleString()}
          </div>
          <div className="text-phosphor-dim text-[9px] mt-2">lifetime — 10% on every gig</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <button
          onClick={handleBid}
          disabled={connects < 10}
          className={clsx(
            'flex-1 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] border transition-colors',
            connects >= 10
              ? 'border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg cursor-pointer'
              : 'border-phosphor-faint text-phosphor-dim cursor-not-allowed',
          )}
        >
          bid on gig (10–16 🪙, 5–10% accept)
        </button>
        {CONNECT_BUNDLES.map((bundle) => {
          const can = money >= bundle.price && connects < CONNECTS_CAP;
          return (
            <button
              key={bundle.amount}
              onClick={() => buyConnects(bundle.amount)}
              disabled={!can}
              className={clsx(
                'px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors',
                can
                  ? 'border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor cursor-pointer'
                  : 'border-phosphor-faint text-phosphor-dim opacity-50 cursor-not-allowed',
              )}
            >
              +{bundle.amount} 🪙 (${bundle.price})
            </button>
          );
        })}
      </div>

      {lastBid && <BidResult result={lastBid} />}
    </Panel>
  );
}

function BidResult({ result }) {
  if (!result.ok) {
    return (
      <div className="text-phosphor-dim text-[11px] italic mt-1">
        {result.reason === 'insufficient_connects'
          ? `Not enough Connects (need ${result.cost})`
          : `error: ${result.reason}`}
      </div>
    );
  }
  if (!result.accepted) {
    return (
      <div className="text-phosphor-dim text-[11px] mt-1">
        Burned <span className="text-phosphor">{result.cost} 🪙</span>. Auto-rejected. Their loss.
      </div>
    );
  }
  return (
    <div className="text-phosphor text-[11px] mt-1">
      <span className="text-phosphor-bright">Accepted!</span>{' '}
      <span className="tabular-nums">${result.gross}</span>{' '}
      gross →{' '}
      <span className="text-phosphor-bright tabular-nums">${result.net.toFixed(2)}</span>{' '}
      after tax (−${result.tax.toFixed(2)}).
    </div>
  );
}
