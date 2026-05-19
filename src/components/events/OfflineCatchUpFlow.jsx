import { useGameStore } from '../../game/state/store';
import { Modal } from '../shared/Modal';
import { copy } from '../../data/copy';

const CURRENCY_LABELS = {
  knowledge: '🧠 Knowledge',
  money: '💵 Money',
  research: '📄 Research',
  applications: '📨 Applications',
  influence: '🌟 Influence',
  equity: '🏛️ Equity',
  burnout: '🔥 Burnout',
};

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatDelta(currency, value) {
  const label = CURRENCY_LABELS[currency] || currency;
  const sign = value > 0 ? '+' : '−';
  if (currency === 'money') {
    return `${sign}$${Math.floor(Math.abs(value)).toLocaleString()} ${label.split(' ')[0]}`;
  }
  return `${sign}${Math.floor(Math.abs(value)).toLocaleString()} ${label}`;
}

export function OfflineCatchUpFlow() {
  const activeModal = useGameStore((s) => s.ui.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);

  if (!activeModal || activeModal.kind !== 'offline_catchup') return null;
  const { delta, secondsAway, capped } = activeModal.payload;

  const data = copy.modals.offlineCatchUp;
  const duration = formatDuration(secondsAway);
  const lines = Object.entries(delta)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([k, v]) => formatDelta(k, v));

  return (
    <Modal
      open
      title={data.title}
      actions={[{ label: data.confirmLabel, onClick: closeModal, variant: 'primary' }]}
      onClose={closeModal}
    >
      <p>
        You were away for <span className="text-phosphor-bright">{duration}</span>. The simulation kept running.
      </p>
      <div className="my-3 text-left inline-block">
        {lines.map((line, i) => (
          <div key={i} className="font-mono text-[12px] text-phosphor-bright tabular-nums">
            {line}
          </div>
        ))}
      </div>
      {capped && (
        <p className="text-[10px] text-phosphor-dim italic">{data.cappedNote}</p>
      )}
    </Modal>
  );
}
