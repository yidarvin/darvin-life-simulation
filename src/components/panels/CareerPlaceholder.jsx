import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';

const TRACK_LABELS = {
  faang: 'FAANG',
  startup: 'Startup',
  phd: 'PhD',
  upwork: 'Upwork',
};

const RANK_1_LABELS = {
  faang: 'L3 Software Engineer',
  startup: 'Pre-seed Founder',
  phd: 'First-year PhD',
  upwork: 'New Freelancer',
};

export function CareerPlaceholder() {
  const stage = useGameStore((s) => s.stage);
  const track = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);

  if (stage !== 'career' || !track) return null;

  const trackLabel = TRACK_LABELS[track] || track;
  const rankLabel = RANK_1_LABELS[track] || `Rank ${rank}`;

  return (
    <Panel title={`[ ${trackLabel} Track ]`}>
      <div className="text-center py-2">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.14em] mb-2">Current rank</div>
        <div
          className="font-display text-[32px] text-phosphor-bright leading-none"
          style={{ textShadow: '0 0 8px rgba(45, 212, 191, 0.4)' }}
        >
          {rankLabel}
        </div>
        <div className="text-phosphor-dim text-[11px] italic mt-3 leading-snug">
          Career-stage mechanics (rank-up, specialization, events, hires, teams, endgames) come in sessions 16+.
        </div>
      </div>
    </Panel>
  );
}
