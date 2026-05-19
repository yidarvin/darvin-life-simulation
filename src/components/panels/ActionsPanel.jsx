import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ActionButton } from '../shared/ActionButton';
import { unlockedCurrencies } from '../../utils/gating';
import { copy, formatCopy } from '../../data/copy';
import { getEffectiveMultiplier } from '../../data/careerTracks';

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
 * Single action slot. Reads perClick with a narrow selector so the reward label
 * updates live when a shop purchase bumps the multiplier (session 12 behavior).
 */
function ActionSlot({ currency }) {
  const click = useGameStore((s) => s.click);
  const perClick = useGameStore((s) => s.perClick[currency]);
  const stage = useGameStore((s) => s.stage);
  const currentTrack = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);
  const specId = useGameStore((s) => s.career.specialization?.id);

  const copyBlock =
    stage === 'internship' && copy.actions.internship[currency]
      ? copy.actions.internship[currency]
      : copy.actions.undergrad[currency];

  if (!copyBlock) return null;

  const fauxState = {
    career: {
      currentTrack,
      rank,
      specialization: specId ? { id: specId } : null,
    },
  };
  const multiplier = getEffectiveMultiplier(fauxState, currency);
  const effective = Math.floor(perClick * multiplier);
  const isUpworkMoney = currency === 'money' && currentTrack === 'upwork';
  const displayValue = isUpworkMoney ? Math.floor(effective * 0.9) : effective;
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
