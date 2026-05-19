import { useState } from 'react';
import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { Button } from '../shared/Button';
import { MAX_TEAMS, MAX_TEAM_SIZE, getTeamBonus, findHireTeam } from '../../utils/teams';

export function TeamsPanel() {
  const stage = useGameStore((s) => s.stage);
  const rank = useGameStore((s) => s.career.rank);
  const teams = useGameStore((s) => s.career.teams);
  const createTeam = useGameStore((s) => s.createTeam);

  if (stage !== 'career' || rank < 6) return null;

  return (
    <Panel title="[ Teams ]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.12em]">
          Teams: <span className="text-phosphor tabular-nums">{teams.length} / {MAX_TEAMS}</span>
        </div>
        {teams.length < MAX_TEAMS && (
          <Button onClick={() => createTeam()}>+ Create team</Button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="text-phosphor-dim text-[11px] italic text-center py-3">
          No teams yet. Larger teams get bigger per-member bonuses (+15% / +25% / +35% at 2 / 3 / 4 members).
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function TeamCard({ team }) {
  const hires = useGameStore((s) => s.career.hires);
  const teams = useGameStore((s) => s.career.teams);
  const renameTeam = useGameStore((s) => s.renameTeam);
  const deleteTeam = useGameStore((s) => s.deleteTeam);
  const assignHireToTeam = useGameStore((s) => s.assignHireToTeam);
  const removeHireFromTeam = useGameStore((s) => s.removeHireFromTeam);

  const [nameEdit, setNameEdit] = useState(team.name);

  const memberCount = (team.memberHireIds || []).length;
  const bonus = getTeamBonus(memberCount);
  const teamFull = memberCount >= MAX_TEAM_SIZE;

  const handleNameBlur = () => {
    if (nameEdit.trim() !== team.name) {
      renameTeam(team.id, nameEdit.trim() || `Team ${team.id.slice(-4)}`);
    }
  };

  return (
    <div className="border border-phosphor-faint bg-bg-deep p-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <input
          type="text"
          value={nameEdit}
          onChange={(e) => setNameEdit(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          maxLength={30}
          className="bg-transparent border-none text-phosphor-bright font-mono text-[13px] focus:outline-none focus:border-b focus:border-phosphor flex-1 min-w-[140px]"
        />
        <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.1em]">
          {memberCount} / {MAX_TEAM_SIZE} members ·{' '}
          {bonus > 0
            ? <span className="text-phosphor">+{Math.round(bonus * 100)}% each</span>
            : <span>need 2+ for bonus</span>}
        </div>
        <button
          onClick={() => {
            if (window.confirm(`Disband ${team.name}?`)) deleteTeam(team.id);
          }}
          className="text-[10px] uppercase tracking-[0.12em] text-phosphor-dim hover:text-error px-2 py-0.5 border border-phosphor-faint hover:border-error"
        >
          disband
        </button>
      </div>

      {hires.length === 0 ? (
        <div className="text-phosphor-dim text-[11px] italic">No hires yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {hires.map((hire) => {
            const inThisTeam = (team.memberHireIds || []).includes(hire.id);
            const otherTeam = inThisTeam ? null : findHireTeam(teams, hire.id);
            const blockedByCap = !inThisTeam && teamFull;
            const blockedByOtherTeam = !inThisTeam && Boolean(otherTeam);

            const onClick = () => {
              if (inThisTeam) {
                removeHireFromTeam(team.id, hire.id);
              } else if (!blockedByCap && !blockedByOtherTeam) {
                assignHireToTeam(team.id, hire.id);
              }
            };

            const disabled = blockedByCap || blockedByOtherTeam;

            return (
              <button
                key={hire.id}
                onClick={onClick}
                disabled={disabled}
                title={
                  blockedByOtherTeam
                    ? `In ${otherTeam.name}`
                    : blockedByCap
                      ? 'Team full'
                      : ''
                }
                className={clsx(
                  'text-left px-2 py-1.5 text-[11px] border transition-colors',
                  inThisTeam
                    ? 'border-phosphor bg-[#11201d] text-phosphor-bright'
                    : disabled
                      ? 'border-phosphor-faint bg-bg-deep text-phosphor-dim opacity-40 cursor-not-allowed'
                      : 'border-phosphor-faint bg-bg-deep text-phosphor hover:border-phosphor hover:bg-[#0e1a18] cursor-pointer',
                )}
              >
                <div className="font-mono text-[11px] truncate">{hire.name}</div>
                <div className="text-[9px] text-phosphor-dim uppercase tracking-wide mt-0.5 truncate">
                  {hire.roleLabel} · L{hire.level}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
