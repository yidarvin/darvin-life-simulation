import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy, formatCopy } from '../../data/copy';

export function JobOfferFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);

  if (!activeModal) return null;
  if (activeModal.kind === 'job_offer_results') return <JobOfferResultsModal payload={activeModal.payload} />;
  if (activeModal.kind === 'track_choice') return <TrackChoiceModal />;
  if (activeModal.kind === 'forced_upwork') return <ForcedUpworkModal payload={activeModal.payload} />;
  return null;
}

function JobOfferResultsModal({ payload }) {
  const openModal = useGameStore((s) => s.openModal);

  const tpl = payload.success
    ? copy.modals.jobOfferResults.bodyTemplateSuccess
    : copy.modals.jobOfferResults.bodyTemplateFailure;
  const title = payload.success
    ? copy.modals.jobOfferResults.titleSuccess
    : copy.modals.jobOfferResults.titleFailure;
  const body = formatCopy(tpl, {
    applications: payload.applicationsSubmitted,
    influence: payload.influenceAccumulated,
    score: payload.score,
  });
  const paragraphs = body.split('\n\n');

  const confirmLabel = payload.success
    ? copy.modals.jobOfferResults.confirmLabelSuccess
    : copy.modals.jobOfferResults.confirmLabelFailure;

  const onConfirm = () => {
    if (payload.success) {
      openModal('track_choice');
    } else {
      openModal('forced_upwork', {
        responses: Math.floor(payload.applicationsSubmitted * 0.3),
        interviews: Math.floor(payload.applicationsSubmitted * 0.05),
      });
    }
  };

  return (
    <Modal
      open
      title={title}
      actions={[{ label: confirmLabel, onClick: onConfirm, variant: 'primary' }]}
      dismissible={false}
    >
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}

function TrackChoiceModal() {
  const chooseTrack = useGameStore((s) => s.chooseTrack);
  const data = copy.modals.trackChoice;

  return (
    <Modal
      open
      title={data.title}
      actions={[
        { label: data.options.faang, onClick: () => chooseTrack('faang'), variant: 'primary' },
        { label: data.options.startup, onClick: () => chooseTrack('startup'), variant: 'primary' },
        { label: data.options.phd, onClick: () => chooseTrack('phd'), variant: 'primary' },
      ]}
      dismissible={false}
    >
      {data.bodyParagraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}

function ForcedUpworkModal({ payload }) {
  const forceUpwork = useGameStore((s) => s.forceUpwork);
  const data = copy.modals.forcedUpwork;

  return (
    <Modal
      open
      title={data.title}
      actions={[{ label: data.confirmLabel, onClick: forceUpwork, variant: 'primary' }]}
      dismissible={false}
    >
      {data.bodyParagraphs.map((p, i) => (
        <p key={i}>{formatCopy(p, payload)}</p>
      ))}
    </Modal>
  );
}
