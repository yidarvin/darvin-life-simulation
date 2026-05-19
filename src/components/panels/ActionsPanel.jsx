import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ActionButton } from '../shared/ActionButton';
import { unlockedCurrencies } from '../../utils/gating';
import { copy, formatCopy } from '../../data/copy';
import { getCurrentPhase, resolveActionCopy } from '../../utils/phaseResolution';
import { getEffectiveClickAmount } from '../../data/careerTracks';

/**
 * The four undergrad currencies, in their unlock order. Slot positions stay stable
 * as actions unlock (muscle-memory preservation); locked slots are hidden, not greyed.
 */
const ACTION_SLOTS = [
  { currency: 'knowledge' },
  { currency: 'money' },
  { currency: 'research' },
  { currency: 'applications' },
];

export function ActionsPanel() {
  const year = useGameStore((s) => s.year);
  const stage = useGameStore((s) => s.stage);
  const currentTrack = useGameStore((s) => s.career.currentTrack);

  const unlocked = unlockedCurrencies({ year, stage, career: { currentTrack } });
  const visible = ACTION_SLOTS.filter((slot) => unlocked.has(slot.currency));

  if (visible.length === 0) return null;

  return (
    <Panel title="[ Actions ]">
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        {visible.map((slot) => (
          <ActionSlot key={slot.currency} currency={slot.currency} />
        ))}
      </div>
    </Panel>
  );
}

/**
 * Single action slot. Reads the full store snapshot so the reward label updates
 * live whenever a shop purchase, rank-up, or specialization changes the
 * effective click amount (per-track BASE_RATES + shop bonuses + multipliers).
 *
 * Subscribing to `shop.owned` keys + key career fields covers every input to
 * getEffectiveClickAmount, so the floored display reflects current state.
 */
function ActionSlot({ currency }) {
  const click = useGameStore((s) => s.click);
  const stage = useGameStore((s) => s.stage);
  const year = useGameStore((s) => s.year);
  const currentTrack = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);
  // Subscriptions below exist for their re-render side effect — any change to
  // these inputs will refresh the displayed reward via getState() below.
  useGameStore((s) => s.career.specialization?.id);
  useGameStore((s) => s.shop.owned);
  useGameStore((s) => s.burnout);

  const phase = getCurrentPhase({ stage, year, career: { currentTrack, rank } });
  const copyBlock = resolveActionCopy(phase, currency, copy.actions);
  if (!copyBlock) return null;

  const grossEffective = Math.floor(getEffectiveClickAmount(useGameStore.getState(), currency));
  const isUpworkMoney = currency === 'money' && currentTrack === 'upwork';
  const displayValue = isUpworkMoney ? Math.floor(grossEffective * 0.9) : grossEffective;
  const rewardLabel = formatCopy(copyBlock.rewardLabel, { n: displayValue });

  return (
    <ActionButton
      command={copyBlock.command}
      flavor={copyBlock.flavor}
      reward={rewardLabel}
      onClick={() => click(currency)}
    />
  );
}
