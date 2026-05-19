import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy, formatCopy } from '../../data/copy';
import { CURRENCY_EMOJI } from '../../utils/currency';

export function RankUpFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);
  if (!activeModal || activeModal.kind !== 'rank_up') return null;
  return <RankUpModal payload={activeModal.payload} />;
}

function RankUpModal({ payload }) {
  const closeModal = useGameStore((s) => s.closeModal);
  const openModal = useGameStore((s) => s.openModal);

  const onConfirm = () => {
    if (payload.isEndgame) {
      openModal('endgame_reached', { track: payload.track });
    } else {
      closeModal();
    }
  };

  const title = formatCopy(copy.modals.rankUp.title, { rankLabel: payload.rankLabel });
  const costSummary = formatCostSummary(payload.cost);
  const body = formatCopy(copy.modals.rankUp.bodyTemplate, {
    costSummary,
    flavor: payload.flavor || '—',
  });
  const paragraphs = body.split('\n\n');

  return (
    <Modal
      open
      title={title}
      actions={[{ label: copy.modals.rankUp.confirmLabel, onClick: onConfirm, variant: 'primary' }]}
      dismissible
      onClose={onConfirm}
    >
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}

function formatCostSummary(cost) {
  return Object.entries(cost)
    .map(([c, amount]) => {
      const prefix = c === 'money' ? '$' : '';
      const suffix = c === 'money' ? '' : ` ${CURRENCY_EMOJI[c]}`;
      return `${prefix}${amount.toLocaleString()}${suffix}`;
    })
    .join('  +  ');
}
