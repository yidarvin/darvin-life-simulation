import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy, formatCopy } from '../../data/copy';
import { getBurnoutMultiplier, VACATION_COST } from '../../utils/burnout';
// import { CURRENCY_EMOJI } from '../../utils/currency'; // used by disabled AnnualReviewModal

export function WellnessFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);
  if (!activeModal) return null;
  if (activeModal.kind === 'vacation_warning') return <VacationWarningModal />;
  // Annual performance review disabled.
  // if (activeModal.kind === 'annual_review') return <AnnualReviewModal payload={activeModal.payload} />;
  return null;
}

function VacationWarningModal() {
  const takeVacation = useGameStore((s) => s.takeVacation);
  const skipVacation = useGameStore((s) => s.skipVacation);
  const money = useGameStore((s) => s.currencies.money);
  const burnout = useGameStore((s) => s.burnout);

  const pct = Math.round(getBurnoutMultiplier(burnout) * 100);
  const canAfford = money >= VACATION_COST;

  const data = copy.modals.vacationWarning;
  const body = formatCopy(data.bodyTemplate, { pct });
  const paragraphs = body.split('\n\n');

  return (
    <Modal
      open
      title={data.title}
      actions={[
        { label: data.skipLabel, onClick: skipVacation, variant: 'secondary' },
        {
          label: canAfford ? data.takeLabel : `${data.takeLabel} — short`,
          onClick: canAfford ? takeVacation : skipVacation,
          variant: 'primary',
        },
      ]}
      onClose={skipVacation}
    >
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </Modal>
  );
}

// Annual performance review disabled.
// function AnnualReviewModal({ payload }) {
//   const dismissAnnualReview = useGameStore((s) => s.dismissAnnualReview);
//   const data = copy.modals.annualReview;
//
//   const body =
//     payload.outcome === 'success' ? data.bodySuccess
//     : payload.outcome === 'neutral' ? data.bodyNeutral
//     : data.bodyFailure;
//
//   const bonus =
//     payload.outcome === 'success' ? data.bonusSuccess
//     : payload.outcome === 'neutral' ? data.bonusNeutral
//     : null;
//
//   return (
//     <Modal
//       open
//       title={data.title}
//       actions={[{ label: data.confirmLabel, onClick: dismissAnnualReview, variant: 'primary' }]}
//       onClose={dismissAnnualReview}
//     >
//       <p>{body}</p>
//       {bonus && (
//         <p className="text-[11px] text-phosphor-dim mt-2">
//           Bonus: {Object.entries(bonus).map(([c, v]) => {
//             const prefix = c === 'money' ? '+$' : '+';
//             const emoji = c === 'money' ? '' : ` ${CURRENCY_EMOJI[c] || ''}`;
//             return `${prefix}${v.toLocaleString()}${emoji}`;
//           }).join('  ')}
//         </p>
//       )}
//     </Modal>
//   );
// }
