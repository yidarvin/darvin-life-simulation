import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { CurrencyValue } from '../shared/CurrencyValue';
import { unlockedCurrencies } from '../../utils/gating';

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
      <div
        className="grid gap-4 text-center"
        style={{ gridTemplateColumns: `repeat(${visibleCells.length}, minmax(0, 1fr))` }}
      >
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
 */
function HUDCell({ cellKey, emoji, label, money }) {
  const value = useGameStore((s) => s.currencies[cellKey]);

  return (
    <div>
      <CurrencyValue value={value} money={money} emoji={emoji} size="xl" bright />
      <div className="text-[10px] tracking-[0.18em] uppercase text-phosphor-dim mt-1.5">
        {label}
      </div>
    </div>
  );
}
