import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { canAfford, getSpendableCurrencies, formatCost, CURRENCY_EMOJI } from '../../utils/currency';
import { sound } from '../../utils/sound';

/**
 * Single shop item row.
 *
 * @param {object} item - one entry from SHOP_ITEMS
 */
export function ShopItem({ item }) {
  const currencies = useGameStore((s) => s.currencies);
  const influenceAllocation = useGameStore((s) => s.career.influenceAllocation);
  const buyShopItem = useGameStore((s) => s.buyShopItem);

  const affordable = canAfford(
    getSpendableCurrencies({ currencies, career: { influenceAllocation } }),
    item.cost,
  );

  const handleClick = () => {
    if (!affordable) return;
    sound.play('click');
    buyShopItem(item.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!affordable}
      className={clsx(
        'w-full flex items-center gap-4 p-3 border transition-colors text-left',
        !affordable && 'border-phosphor-faint bg-bg-deep cursor-not-allowed',
        affordable &&
          'border-phosphor bg-bg-deep cursor-pointer hover:bg-[#11201d] active:scale-[0.99]',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-phosphor-bright font-mono text-[13px] mb-0.5">
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
        <div
          className={clsx(
            'font-mono text-[10px] tabular-nums',
            affordable ? 'text-phosphor-bright' : 'text-phosphor-dim',
          )}
        >
          {formatCost(item.cost)}
        </div>
      </div>
    </button>
  );
}

function effectLabel(effect) {
  const emoji = CURRENCY_EMOJI[effect.currency];
  if (effect.kind === 'instant') {
    const sign = effect.amount >= 0 ? '+' : '';
    return `${sign}${effect.amount.toLocaleString()} ${emoji} (one-time)`;
  }
  const verb = effect.kind === 'perClick' ? '/click' : '/sec';
  const amount =
    effect.kind === 'perSecond' && effect.amount < 1
      ? effect.amount.toFixed(1)
      : String(effect.amount);
  const sign = effect.amount >= 0 ? '+' : '';
  return `${sign}${amount} ${emoji}${verb}`;
}
