import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy } from '../../data/copy';

export function EndgameFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);
  if (!activeModal || activeModal.kind !== 'endgame_reached') return null;
  return <EndgameReachedModal payload={activeModal.payload} />;
}

function EndgameReachedModal({ payload }) {
  const closeModal = useGameStore((s) => s.closeModal);

  const data = copy.modals.endgameReached[payload.track];
  if (!data) return null;
  const paragraphs = data.body.split('\n\n');

  return (
    <Modal
      open
      title={data.title}
      actions={[{ label: copy.modals.endgameReached.confirmLabel, onClick: closeModal, variant: 'primary' }]}
      onClose={closeModal}
    >
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}
