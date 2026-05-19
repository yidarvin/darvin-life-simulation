import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy, formatCopy } from '../../data/copy';
import { INTERNSHIP_EVENTS_BY_ID } from '../../data/internshipEvents';

export function InternshipFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);

  if (!activeModal) return null;
  if (activeModal.kind === 'internship_offer') return <InternshipOfferModal payload={activeModal.payload} />;
  if (activeModal.kind === 'internship_event') return <InternshipEventModal payload={activeModal.payload} />;
  if (activeModal.kind === 'internship_results') return <InternshipResultsModal payload={activeModal.payload} />;
  return null;
}

function InternshipOfferModal({ payload }) {
  const acceptInternship = useGameStore((s) => s.acceptInternship);
  const declineInternship = useGameStore((s) => s.declineInternship);

  const company = payload.company;
  const title = copy.modals.internshipOffer.title;
  const body = formatCopy(copy.modals.internshipOffer.bodyTemplate, {
    company: company.name,
    companyFlavor: company.flavor,
  });
  const paragraphs = body.split('\n\n');

  return (
    <Modal
      open
      title={title}
      actions={[
        { label: copy.modals.internshipOffer.declineLabel, onClick: declineInternship, variant: 'secondary' },
        { label: copy.modals.internshipOffer.acceptLabel, onClick: () => acceptInternship(company), variant: 'primary' },
      ]}
      onClose={declineInternship}
    >
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </Modal>
  );
}

function InternshipEventModal({ payload }) {
  const resolve = useGameStore((s) => s.resolveInternshipEvent);
  const event = INTERNSHIP_EVENTS_BY_ID[payload.eventId];

  if (!event) return null;

  const actions = event.options.map((option, i) => ({
    label: option.label,
    onClick: () => resolve(event.id, i),
    variant: 'primary',
  }));

  return (
    <Modal open title={event.title} actions={actions} dismissible={false}>
      <p>{event.flavor}</p>
      <div className="text-[11px] text-phosphor-dim mt-2">
        {event.options.map((o, i) => (
          <div key={i} className="leading-snug">
            <span className="text-phosphor">{o.label}</span>
            <span className="ml-2 text-phosphor-dim italic">{describeEffect(o.effect)}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function InternshipResultsModal({ payload }) {
  const finishInternship = useGameStore((s) => s.finishInternship);
  const internship = useGameStore((s) => s.internship);
  const company = internship.company;

  const tpl = payload.success
    ? copy.modals.internshipResults.bodyTemplateSuccess
    : copy.modals.internshipResults.bodyTemplateFailure;
  const title = payload.success
    ? copy.modals.internshipResults.titleSuccess
    : copy.modals.internshipResults.titleFailure;
  const body = formatCopy(tpl, {
    company: company?.name || 'the internship',
    influence: payload.influenceEarned,
  });
  const paragraphs = body.split('\n\n');

  return (
    <Modal
      open
      title={title}
      actions={[
        { label: copy.modals.internshipResults.confirmLabel, onClick: finishInternship, variant: 'primary' },
      ]}
      dismissible={false}
    >
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </Modal>
  );
}

function describeEffect(effect) {
  return Object.entries(effect)
    .map(([c, v]) => {
      const sign = v >= 0 ? '+' : '';
      const emoji = { knowledge: '🧠', money: '💵', research: '📄', applications: '📨', influence: '🌟' }[c] || '';
      return `${sign}${v} ${emoji}`;
    })
    .join('  ');
}
