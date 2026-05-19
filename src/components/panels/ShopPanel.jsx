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

  const visible = SHOP_ITEMS.filter((item) => {
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
