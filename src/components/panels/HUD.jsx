import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { CurrencyValue } from '../shared/CurrencyValue';
import { unlockedCurrencies } from '../../utils/gating';
import { getTotalPerSecond } from '../../data/careerTracks';

/**
 * Currencies displayed in the HUD, in their unlock order.
 * Visibility is computed via `unlockedCurrencies` (see src/utils/gating.js).
 */
const CURRENCY_CELLS = [
  { key: 'knowledge',    emoji: '🧠',  label: 'Knowledge' },
  { key: 'money',        emoji: '💵',  label: 'Money', money: true },
  { key: 'research',     emoji: '📄',  label: 'Research' },
  { key: 'applications', emoji: '📨',  label: 'Applications' },
  { key: 'influence',    emoji: '🌟',  label: 'Influence' },
  { key: 'equity',       emoji: '🏛️',  label: 'Equity' },
];

/**
 * HUD panel: live currency display.
 */
export function HUD() {
  const year = useGameStore((s) => s.year);
  const stage = useGameStore((s) => s.stage);
  const currentTrack = useGameStore((s) => s.career.currentTrack);

  const unlocked = unlockedCurrencies({ year, stage, career: { currentTrack } });
  const visibleCells = CURRENCY_CELLS.filter((c) => unlocked.has(c.key));

  return (
    <Panel title="[ Status HUD ]">
      <div className="grid gap-3 sm:gap-4 text-center grid-cols-3 sm:grid-cols-6">
        {visibleCells.map((cell) => (
          <HUDCell key={cell.key} cellKey={cell.key} emoji={cell.emoji} label={cell.label} money={cell.money} />
        ))}
      </div>
    </Panel>
  );
}

/**
 * Single currency cell. Reads its own currency value with a narrow selector
 * so only this cell rerenders when its currency changes.
 *
 * Below the value, shows the live passive accumulation rate ("+N/s") if any
 * source is generating this currency. Subscribes to the inputs of
 * getTotalPerSecond so the rate refreshes when shop/hires/teams/etc. change.
 */
function HUDCell({ cellKey, emoji, label, money }) {
  const value = useGameStore((s) => s.currencies[cellKey]);
  // Side-effect subscriptions — read with getState() below for one-pass math.
  useGameStore((s) => s.shop.owned);
  useGameStore((s) => s.career.hires);
  useGameStore((s) => s.career.teams);
  useGameStore((s) => s.career.phdEndowments);
  useGameStore((s) => s.career.specialization?.id);
  useGameStore((s) => s.career.influenceAllocation);
  // Alloc clamps against current Influence — track it so the rate refreshes
  // when an event drains Influence below total allocation.
  useGameStore((s) => s.currencies.influence);
  useGameStore((s) => s.career.rank);
  useGameStore((s) => s.career.currentTrack);
  useGameStore((s) => s.stage);
  useGameStore((s) => s.burnout);
  useGameStore((s) => s.collapsed);
  useGameStore((s) => s.upwork.activeCourse);

  const perSecond = getTotalPerSecond(useGameStore.getState(), cellKey);
  const showRate = perSecond > 0;
  const rateLabel = formatRate(perSecond, money);

  return (
    <div className="min-w-0">
      <CurrencyValue value={value} money={money} emoji={emoji} size="xl" bright compact />
      {showRate && (
        <div className="text-[10px] tabular-nums text-phosphor mt-0.5" title={`${rateLabel} per second`}>
          {rateLabel}/s
        </div>
      )}
      <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">
        {label}
      </div>
    </div>
  );
}

/**
 * Format a per-second rate compactly. Sub-10 values keep one decimal so trickle
 * sources (0.3/s) don't round to 0; larger values floor for legibility.
 */
function formatRate(rate, money) {
  const prefix = `+${money ? '$' : ''}`;
  if (rate >= 1_000_000) return prefix + (rate / 1_000_000).toFixed(1) + 'M';
  if (rate >= 1_000) return prefix + (rate / 1_000).toFixed(1) + 'k';
  if (rate >= 10) return prefix + Math.floor(rate).toLocaleString();
  return prefix + rate.toFixed(1);
}
