import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { CurrencyValue } from '../shared/CurrencyValue';

/**
 * Currencies displayed in the HUD, in their unlock order.
 * Each currency has a visibility predicate: only render the cell when unlocked.
 *
 * Unlock rules (from CURRENCY_SPEC.md):
 *   knowledge   → always visible (freshman onward)
 *   money       → visible from sophomore year onward
 *   research    → visible from junior year onward
 *   applications→ visible from senior year onward
 *   influence   → visible after internship complete (stage !== 'undergrad')
 *   equity      → visible after job offer (career.currentTrack !== null)
 */
const CURRENCY_CELLS = [
  {
    key: 'knowledge',
    emoji: '🧠',
    label: 'Knowledge',
    visible: () => true,
  },
  {
    key: 'money',
    emoji: '💵',
    label: 'Money',
    money: true,
    visible: (s) => isAtLeastYear(s.year, 'sophomore') || s.stage !== 'undergrad',
  },
  {
    key: 'research',
    emoji: '📄',
    label: 'Research',
    visible: (s) => isAtLeastYear(s.year, 'junior') || s.stage !== 'undergrad',
  },
  {
    key: 'applications',
    emoji: '📨',
    label: 'Applications',
    visible: (s) => isAtLeastYear(s.year, 'senior') || s.stage !== 'undergrad',
  },
  {
    key: 'influence',
    emoji: '🌟',
    label: 'Influence',
    visible: (s) => s.stage !== 'undergrad' && s.stage !== 'internship',
  },
  {
    key: 'equity',
    emoji: '🏛️',
    label: 'Equity',
    visible: (s) => s.career.currentTrack !== null,
  },
];

const YEAR_ORDER = ['freshman', 'sophomore', 'junior', 'senior'];

function isAtLeastYear(currentYear, targetYear) {
  return YEAR_ORDER.indexOf(currentYear) >= YEAR_ORDER.indexOf(targetYear);
}

/**
 * HUD panel: live currency display.
 */
export function HUD() {
  // Snapshot of fields needed for visibility (these don't change per tick).
  const year = useGameStore((s) => s.year);
  const stage = useGameStore((s) => s.stage);
  const currentTrack = useGameStore((s) => s.career.currentTrack);

  const stateForVisibility = { year, stage, career: { currentTrack } };
  const visibleCells = CURRENCY_CELLS.filter((c) => c.visible(stateForVisibility));

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
