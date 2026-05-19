import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { EVENTS_BY_ID } from '../../data/events';
import { CURRENCY_EMOJI } from '../../utils/currency';

export function RandomEventFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);
  if (!activeModal || activeModal.kind !== 'random_event') return null;
  return <RandomEventModal payload={activeModal.payload} />;
}

function RandomEventModal({ payload }) {
  const resolve = useGameStore((s) => s.resolveRandomEvent);
  const event = EVENTS_BY_ID[payload.eventId];

  if (!event) return null;

  const actions = event.options.map((option, i) => ({
    label: option.label,
    onClick: () => resolve(event.id, i),
    variant: 'primary',
  }));

  return (
    <Modal open title={event.title} actions={actions} dismissible={false}>
      <p>{event.flavor}</p>
      {event.options.length > 1 && (
        <div className="text-[11px] text-phosphor-dim mt-3 leading-snug">
          {event.options.map((o, i) => (
            <div key={i} className="mt-1">
              <span className="text-phosphor">{o.label}</span>
              <span className="ml-2 text-phosphor-dim italic">{describeEffect(o.effect)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function describeEffect(effect) {
  if (!effect || Object.keys(effect).length === 0) return 'no effect';
  return Object.entries(effect)
    .map(([c, v]) => {
      const sign = v >= 0 ? '+' : '−';
      const abs = Math.abs(v);
      if (c === 'burnout') return `${sign}${abs} 🔥`;
      if (c === 'money') return `${sign}$${abs.toLocaleString()}`;
      return `${sign}${abs.toLocaleString()} ${CURRENCY_EMOJI[c]}`;
    })
    .join('  ');
}
