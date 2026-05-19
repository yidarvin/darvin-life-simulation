import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy, formatCopy } from '../../data/copy';

export function SwapFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);
  if (!activeModal) return null;
  if (activeModal.kind === 'swap_confirm') return <SwapConfirmModal payload={activeModal.payload} />;
  if (activeModal.kind === 'upwork_gauntlet') return <GauntletModal payload={activeModal.payload} />;
  return null;
}

function SwapConfirmModal({ payload }) {
  const cancelSwap = useGameStore((s) => s.cancelSwap);
  const confirmSwap = useGameStore((s) => s.confirmSwap);

  const data = copy.modals.swapConfirm;
  const body = formatCopy(data.bodyTemplate, payload);
  const paragraphs = body.split('\n\n');

  return (
    <Modal
      open
      title={data.title}
      actions={[
        { label: data.cancelLabel, onClick: cancelSwap, variant: 'secondary' },
        { label: data.confirmLabel, onClick: () => confirmSwap(payload.targetTrack, payload.targetRank), variant: 'primary' },
      ]}
      onClose={cancelSwap}
    >
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}

function GauntletModal({ payload }) {
  const cancelSwap = useGameStore((s) => s.cancelSwap);
  const advanceGauntlet = useGameStore((s) => s.advanceGauntlet);

  const stepIndex = payload.step - 1;
  const stepData = copy.modals.upworkGauntlet[stepIndex];
  if (!stepData) return null;

  const body = formatCopy(stepData.bodyTemplate, payload);
  const paragraphs = body.split('\n\n');

  const actions = [];
  if (stepData.cancelLabel) {
    actions.push({ label: stepData.cancelLabel, onClick: cancelSwap, variant: 'secondary' });
  }
  actions.push({ label: stepData.continueLabel, onClick: advanceGauntlet, variant: 'primary' });

  return (
    <Modal
      open
      title={stepData.title}
      actions={actions}
      onClose={stepData.cancelLabel ? cancelSwap : undefined}
      dismissible={Boolean(stepData.cancelLabel)}
    >
      <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mb-2">
        Step {payload.step} of 5
      </div>
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}
