import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ShopItem } from './ShopItem';
import { SHOP_ITEMS } from '../../data/shopItems';
import { isAtLeastYear } from '../../utils/gating';

/**
 * Shop panel: renders all items unlocked at or before the current year.
 * Items appear in declaration order — no dynamic sorting (would jump on every
 * currency change).
 */
export function ShopPanel() {
  const year = useGameStore((s) => s.year);
  const stage = useGameStore((s) => s.stage);
  const currentTrack = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);
  const owned = useGameStore((s) => s.shop.owned);

  // Pre-internship: hide internship-gated items entirely. Sophomore→junior requires
  // the internship event, so once year >= junior we know the player has been through it
  // (even though `stage` flips back to 'undergrad' after `finishInternship`).
  const preInternship = stage === 'undergrad' && (year === 'freshman' || year === 'sophomore');

  const visible = SHOP_ITEMS.filter((item) => {
    if (owned[item.id]) return false;
    if (item.lockedUntilInternship && preInternship) return false;
    if (item.requiresTrack && item.requiresTrack !== currentTrack) return false;
    // Instant items grant a lump sum at purchase, so buying them below the rank gate
    // would just waste money. Hide until the rank is met. (perClick/perSecond items
    // intentionally stay visible early — their bonus activates when rank is reached.)
    if (item.effect.kind === 'instant' && item.requiresRank && rank < item.requiresRank) {
      return false;
    }
    if (stage !== 'undergrad') return true;
    return !item.unlocksAtYear || isAtLeastYear(year, item.unlocksAtYear);
  });

  if (visible.length === 0) {
    return (
      <Panel title="[ Shop ]">
        <div className="text-phosphor-dim text-[12px] italic text-center py-2">
          Nothing yet. Survive the semester.
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="[ Shop ]">
      <div className="flex flex-col gap-2">
        {visible.map((item) => (
          <ShopItem key={item.id} item={item} />
        ))}
      </div>
    </Panel>
  );
}
