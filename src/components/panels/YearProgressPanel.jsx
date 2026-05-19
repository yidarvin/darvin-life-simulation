import { useState } from 'react';
import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { Modal } from '../shared/Modal';
import { ProgressBar } from '../shared/ProgressBar';
import { CurrencyValue } from '../shared/CurrencyValue';
import { YEAR_TRANSITIONS, YEAR_LABELS } from '../../data/yearTransitions';
import { CURRENCY_EMOJI, canAfford } from '../../utils/currency';
import { copy, formatCopy } from '../../data/copy';

const CURRENCY_NAMES = {
  knowledge: 'Knowledge',
  money: 'Money',
  research: 'Research',
  applications: 'Applications',
  influence: 'Influence',
  equity: 'Equity',
};

export function YearProgressPanel() {
  const stage = useGameStore((s) => s.stage);
  const year = useGameStore((s) => s.year);
  const currencies = useGameStore((s) => s.currencies);
  const tryAdvanceYear = useGameStore((s) => s.tryAdvanceYear);

  const [modalOpen, setModalOpen] = useState(false);

  if (stage !== 'undergrad') return null;

  const transition = YEAR_TRANSITIONS[year];
  if (!transition) return null;

  const ready = canAfford(currencies, transition.threshold);
  const eventRequired = Boolean(transition.requiresEvent);

  const handleContinueClick = () => {
    setModalOpen(true);
  };

  const handleConfirm = () => {
    const result = tryAdvanceYear();
    if (result.ok) {
      setModalOpen(false);
    } else {
      console.warn('tryAdvanceYear failed:', result);
      setModalOpen(false);
    }
  };

  return (
    <>
      <Panel title={`[ ${YEAR_LABELS[year]} Year ]`}>
        <div className="space-y-2 mb-4">
          {Object.entries(transition.threshold).map(([currency, target]) => {
            const value = currencies[currency] ?? 0;
            const labelText = `${CURRENCY_EMOJI[currency]} ${CURRENCY_NAMES[currency]}`;
            return (
              <div key={currency} className="grid grid-cols-[170px_1fr_120px] gap-3 items-center text-[12px]">
                <div className="text-phosphor-dim text-[11px] uppercase tracking-wide">{labelText}</div>
                <ProgressBar value={value} max={target} />
                <div className="text-phosphor tabular-nums text-right text-[11px]">
                  <CurrencyValue value={value} money={currency === 'money'} size="sm" /> /{' '}
                  <CurrencyValue value={target} money={currency === 'money'} size="sm" />
                </div>
              </div>
            );
          })}
        </div>

        {eventRequired ? (
          transition.requiresEvent === 'summer_internship' ? (
            <SummerInternshipTrigger ready={ready} />
          ) : transition.requiresEvent === 'senior_year_job_offer' ? (
            <SeniorYearJobOfferTrigger ready={ready} />
          ) : (
            <EventRequiredNotice event={transition.requiresEvent} ready={ready} />
          )
        ) : (
          <button
            onClick={handleContinueClick}
            disabled={!ready}
            className={clsx(
              'w-full py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors',
              ready
                ? 'bg-bg-deep border-phosphor text-phosphor-bright cursor-pointer hover:bg-phosphor hover:text-bg'
                : 'bg-bg-deep border-phosphor-faint text-phosphor-dim cursor-not-allowed',
            )}
          >
            {ready ? `Advance to ${YEAR_LABELS[transition.nextYear]} year` : 'Keep grinding'}
          </button>
        )}
      </Panel>

      <YearTransitionModal
        open={modalOpen}
        currentYear={year}
        transition={transition}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}

function SummerInternshipTrigger({ ready }) {
  const beginInternshipOffer = useGameStore((s) => s.beginInternshipOffer);
  return (
    <button
      onClick={() => beginInternshipOffer()}
      disabled={!ready}
      className={clsx(
        'w-full py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors',
        ready
          ? 'bg-bg-deep border-phosphor text-phosphor-bright cursor-pointer hover:bg-phosphor hover:text-bg'
          : 'bg-bg-deep border-phosphor-faint text-phosphor-dim cursor-not-allowed',
      )}
    >
      {ready ? 'Apply for summer internships' : 'Keep grinding (thresholds not met)'}
    </button>
  );
}

function SeniorYearJobOfferTrigger({ ready }) {
  const beginJobOffer = useGameStore((s) => s.beginJobOffer);
  return (
    <button
      onClick={() => beginJobOffer()}
      disabled={!ready}
      className={clsx(
        'w-full py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] border transition-colors',
        ready
          ? 'bg-bg-deep border-phosphor text-phosphor-bright cursor-pointer hover:bg-phosphor hover:text-bg'
          : 'bg-bg-deep border-phosphor-faint text-phosphor-dim cursor-not-allowed',
      )}
    >
      {ready ? 'Send out applications' : 'Keep grinding (thresholds not met)'}
    </button>
  );
}

function EventRequiredNotice({ event, ready }) {
  const label =
    event === 'summer_internship'
      ? 'Summer Internship event required — session 14'
      : event === 'senior_year_job_offer'
        ? 'Senior-Year Job Offer event required — session 15'
        : `Event required: ${event}`;
  return (
    <div className="border border-phosphor-faint bg-bg-deep p-3 text-center">
      <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.12em] mb-1">
        {ready ? 'Thresholds met' : 'Still grinding'}
      </div>
      <div className="text-phosphor-dim text-[11px] italic">
        {label}
      </div>
    </div>
  );
}

function YearTransitionModal({ open, currentYear, transition, onConfirm, onCancel }) {
  if (!open) return null;

  const title = formatCopy(copy.modals.yearTransition.title, {
    currentYear: YEAR_LABELS[currentYear],
  });
  const body = formatCopy(copy.modals.yearTransition.bodyTemplate, {
    currentYear: YEAR_LABELS[currentYear],
    nextYear: YEAR_LABELS[transition.nextYear] || '—',
    flavor: transition.flavor,
    unlocks: transition.unlocks
      ? `${CURRENCY_EMOJI[transition.unlocks]} ${CURRENCY_NAMES[transition.unlocks]}`
      : 'nothing new',
  });

  const paragraphs = body.split('\n\n');

  return (
    <Modal
      open={open}
      title={title}
      actions={[
        { label: copy.modals.yearTransition.cancelLabel, onClick: onCancel, variant: 'secondary' },
        { label: copy.modals.yearTransition.confirmLabel, onClick: onConfirm, variant: 'primary' },
      ]}
      onClose={onCancel}
    >
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </Modal>
  );
}
