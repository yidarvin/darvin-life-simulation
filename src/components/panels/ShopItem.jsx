import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { canAfford, formatCost, CURRENCY_EMOJI } from '../../utils/currency';

/**
 * Single shop item row.
 *
 * @param {object} item - one entry from SHOP_ITEMS
 */
export function ShopItem({ item }) {
  const currencies = useGameStore((s) => s.currencies);
  const owned = useGameStore((s) => Boolean(s.shop.owned[item.id]));
  const stage = useGameStore((s) => s.stage);

  const isLocked = item.lockedUntilInternship && stage === 'undergrad';
  const affordable = canAfford(currencies, item.cost);

  const state = owned
    ? 'owned'
    : isLocked
      ? 'locked'
      : affordable
        ? 'affordable'
        : 'unaffordable';

  return (
    <div
      className={clsx(
        'flex items-center gap-4 p-3 border transition-colors',
        state === 'owned' && 'border-phosphor-faint bg-bg-deep opacity-60',
        state === 'locked' && 'border-phosphor-faint bg-bg-deep opacity-50',
        state === 'unaffordable' && 'border-phosphor-faint bg-bg-deep',
        state === 'affordable' && 'border-phosphor bg-bg-deep hover:bg-[#11201d]',
      )}
    >
      <div className="flex-1 min-w-0">
        <div
          className={clsx(
            'text-phosphor-bright font-mono text-[13px] mb-0.5',
            state === 'owned' && 'line-through',
          )}
        >
          {item.name}
        </div>
        <div className="text-phosphor-dim text-[11px] italic leading-snug">
          {item.flavor}
        </div>
        <div className="text-phosphor text-[10px] uppercase tracking-[0.1em] mt-1.5">
          {effectLabel(item.effect)}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {state === 'owned' && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-phosphor-bright border border-phosphor-bright px-2 py-1">
            ✓ owned
          </span>
        )}
        {state === 'locked' && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-phosphor-dim border border-phosphor-faint px-2 py-1 max-w-[140px] text-center leading-tight">
            internship required
          </span>
        )}
        {(state === 'affordable' || state === 'unaffordable') && (
          <BuyButton item={item} affordable={affordable} />
        )}
        {!owned && !isLocked && (
          <div className="font-mono text-[10px] text-phosphor-dim tabular-nums">
            {formatCost(item.cost)}
          </div>
        )}
      </div>
    </div>
  );
}

function BuyButton({ item, affordable }) {
  const buyShopItem = useGameStore((s) => s.buyShopItem);

  const handleClick = () => {
    if (!affordable) return;
    buyShopItem(item.id);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!affordable}
      className={clsx(
        'px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors',
        affordable
          ? 'border-phosphor text-phosphor-bright cursor-pointer hover:bg-phosphor hover:text-bg active:scale-[0.97]'
          : 'border-phosphor-faint text-phosphor-dim cursor-not-allowed',
      )}
    >
      buy
    </button>
  );
}

function effectLabel(effect) {
  const emoji = CURRENCY_EMOJI[effect.currency];
  const verb = effect.kind === 'perClick' ? '/click' : '/sec';
  const amount =
    effect.kind === 'perSecond' && effect.amount < 1
      ? effect.amount.toFixed(1)
      : String(effect.amount);
  const sign = effect.amount >= 0 ? '+' : '';
  return `${sign}${amount} ${emoji}${verb}`;
}
