import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { MAX_TEAMS, MAX_TEAM_SIZE, getTeamBonus, findHireTeam } from '../../utils/teams';
import {
  getHiresCap,
  getHireCost,
  getLevelUpCost,
  getPoachCost,
  MAX_HIRE_LEVEL,
} from '../../data/hires';
import { CURRENCY_EMOJI, canAfford, getSpendableCurrencies, formatCost } from '../../utils/currency';

export function TeamsPanel() {
  const stage = useGameStore((s) => s.stage);
  const rank = useGameStore((s) => s.career.rank);
  const teams = useGameStore((s) => s.career.teams);
  const createTeam = useGameStore((s) => s.createTeam);

  const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id ?? null);

  useEffect(() => {
    if (teams.length === 0) {
      if (activeTeamId !== null) setActiveTeamId(null);
      return;
    }
    if (!teams.find((t) => t.id === activeTeamId)) {
      setActiveTeamId(teams[0].id);
    }
  }, [teams, activeTeamId]);

  if (stage !== 'career' || rank < 6) return null;

  const activeTeam = teams.find((t) => t.id === activeTeamId) || null;

  const handleCreate = () => {
    const result = createTeam();
    if (result?.ok && result.team) setActiveTeamId(result.team.id);
  };

  return (
    <Panel title="[ Teams ]">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="text-phosphor-dim text-[11px] uppercase tracking-[0.12em] mr-2">
          Teams: <span className="text-phosphor tabular-nums">{teams.length} / {MAX_TEAMS}</span>
        </div>
        {teams.map((t) => {
          const isActive = t.id === activeTeamId;
          const memberCount = (t.memberHireIds || []).length;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTeamId(t.id)}
              className={clsx(
                'px-3 font-mono text-[11px] uppercase tracking-[0.1em] border transition-colors min-h-[44px] inline-flex items-center gap-2',
                isActive
                  ? 'border-phosphor text-phosphor-bright bg-[#11201d]'
                  : 'border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor',
              )}
            >
              <span className="truncate max-w-[140px]">{t.name}</span>
              <span className="tabular-nums opacity-70">{memberCount}/{MAX_TEAM_SIZE}</span>
            </button>
          );
        })}
        {teams.length < MAX_TEAMS && (
          <button
            onClick={handleCreate}
            className="px-3 font-mono text-[11px] uppercase tracking-[0.1em] border border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg transition-colors min-h-[44px] cursor-pointer"
          >
            + new team
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="text-phosphor-dim text-[11px] italic text-center py-3">
          No teams yet. Larger teams get bigger per-member bonuses (+15% / +25% / +35% at 2 / 3 / 4 members).
        </div>
      ) : activeTeam ? (
        <TeamView team={activeTeam} />
      ) : null}
    </Panel>
  );
}

function TeamView({ team }) {
  const rank = useGameStore((s) => s.career.rank);
  const track = useGameStore((s) => s.career.currentTrack);
  const hires = useGameStore((s) => s.career.hires);
  const teams = useGameStore((s) => s.career.teams);
  const currencies = useGameStore((s) => s.currencies);
  const influenceAllocation = useGameStore((s) => s.career.influenceAllocation);
  const renameTeam = useGameStore((s) => s.renameTeam);
  const deleteTeam = useGameStore((s) => s.deleteTeam);
  const hireSomeone = useGameStore((s) => s.hireSomeone);
  const poachSomeone = useGameStore((s) => s.poachSomeone);
  const assignHireToTeam = useGameStore((s) => s.assignHireToTeam);

  const [nameEdit, setNameEdit] = useState(team.name);
  const [showDisbandConfirm, setShowDisbandConfirm] = useState(false);

  useEffect(() => {
    setNameEdit(team.name);
  }, [team.id, team.name]);

  const memberCount = (team.memberHireIds || []).length;
  const bonus = getTeamBonus(memberCount);
  const teamFull = memberCount >= MAX_TEAM_SIZE;

  const spendable = getSpendableCurrencies({ currencies, career: { influenceAllocation } });
  const cap = getHiresCap(rank);
  const slotsRemaining = cap - hires.length;

  const hireCost = getHireCost(track, hires.length);
  const canHire = !teamFull && slotsRemaining > 0 && canAfford(spendable, hireCost);

  const poachAvailable = rank >= 5;
  const poachCost = poachAvailable ? getPoachCost(track, hires.length) : null;
  const canPoach = poachAvailable && !teamFull && slotsRemaining > 0 && canAfford(spendable, poachCost);

  const members = (team.memberHireIds || [])
    .map((id) => hires.find((h) => h.id === id))
    .filter(Boolean);

  const unassignedHires = hires.filter((h) => !findHireTeam(teams, h.id));

  const handleNameBlur = () => {
    const next = nameEdit.trim();
    if (next && next !== team.name) {
      renameTeam(team.id, next);
    } else if (!next) {
      setNameEdit(team.name);
    }
  };

  const confirmDisband = () => {
    deleteTeam(team.id);
    setShowDisbandConfirm(false);
  };

  return (
    <div className="border border-phosphor-faint bg-bg-deep p-3">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <input
          type="text"
          value={nameEdit}
          onChange={(e) => setNameEdit(e.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          maxLength={30}
          className="bg-transparent border-none text-phosphor-bright font-mono text-base focus:outline-none focus:border-b focus:border-phosphor flex-1 min-w-[140px] min-h-[44px]"
        />
        <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.1em]">
          {memberCount} / {MAX_TEAM_SIZE} members ·{' '}
          {bonus > 0
            ? <span className="text-phosphor">+{Math.round(bonus * 100)}% each</span>
            : <span>need 2+ for bonus</span>}
        </div>
        <button
          onClick={() => setShowDisbandConfirm(true)}
          className="text-[10px] uppercase tracking-[0.12em] text-phosphor-dim hover:text-error px-2 border border-phosphor-faint hover:border-error min-h-[44px] inline-flex items-center"
        >
          disband
        </button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {teamFull ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-phosphor-dim border border-phosphor-faint px-3 py-1 inline-flex items-center min-h-[44px]">
            team full
          </span>
        ) : slotsRemaining <= 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-phosphor-dim border border-phosphor-faint px-3 py-1 inline-flex items-center min-h-[44px]">
            hire cap reached
          </span>
        ) : (
          <>
            <PillButton disabled={!canHire} onClick={() => hireSomeone(team.id)}>
              + hire ({formatCost(hireCost)})
            </PillButton>
            {poachAvailable && (
              <PillButton disabled={!canPoach} onClick={() => poachSomeone(team.id)} tone="warm">
                + poach lvl 3 ({formatCost(poachCost)})
              </PillButton>
            )}
          </>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-phosphor-dim text-[11px] italic py-2">
          No members yet. Hire someone above, or add an unassigned hire below.
        </div>
      ) : (
        <div className="space-y-1.5 mb-3">
          {members.map((hire) => (
            <MemberRow key={hire.id} hire={hire} track={track} canManage={rank >= 5} />
          ))}
        </div>
      )}

      {!teamFull && unassignedHires.length > 0 && (
        <div className="border-t border-phosphor-faint pt-3 mt-2">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.12em] mb-2">
            Add unassigned hire:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unassignedHires.map((hire) => (
              <button
                key={hire.id}
                onClick={() => assignHireToTeam(team.id, hire.id)}
                className="text-left px-2 py-1.5 text-[11px] border border-phosphor-faint bg-bg-deep text-phosphor hover:border-phosphor hover:bg-[#0e1a18] cursor-pointer min-h-[44px]"
              >
                <span className="font-mono">{hire.name}</span>
                <span className="text-[9px] text-phosphor-dim uppercase tracking-wide ml-2">
                  {hire.roleLabel} · L{hire.level}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDisbandConfirm}
        title={`Disband ${team.name}?`}
        onConfirm={confirmDisband}
        onCancel={() => setShowDisbandConfirm(false)}
        confirmLabel="Disband"
        tone="destructive"
      >
        <p>Members become unassigned and can be added to other teams.</p>
      </ConfirmDialog>
    </div>
  );
}

function MemberRow({ hire, track, canManage }) {
  const currencies = useGameStore((s) => s.currencies);
  const influenceAllocation = useGameStore((s) => s.career.influenceAllocation);
  const levelUpHire = useGameStore((s) => s.levelUpHire);
  const fireHire = useGameStore((s) => s.fireHire);
  const removeHireFromTeam = useGameStore((s) => s.removeHireFromTeam);
  const teams = useGameStore((s) => s.career.teams);

  const [showFireConfirm, setShowFireConfirm] = useState(false);

  const isMaxLevel = hire.level >= MAX_HIRE_LEVEL;
  const levelUpCost = !isMaxLevel ? getLevelUpCost(track, hire.level) : null;
  const canAffordLevelUp =
    levelUpCost &&
    canAfford(getSpendableCurrencies({ currencies, career: { influenceAllocation } }), levelUpCost);

  const team = findHireTeam(teams, hire.id);

  const confirmFire = () => {
    fireHire(hire.id);
    setShowFireConfirm(false);
  };

  return (
    <>
      <div className="grid grid-cols-[1fr_140px] sm:grid-cols-[1fr_140px_90px_260px] gap-2 sm:gap-3 items-center px-3 py-2 border border-phosphor-faint bg-bg-deep text-[11px]">
        <div>
          <div className="text-phosphor-bright font-mono">
            {hire.name}
            {hire.poached && (
              <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-phosphor-dim border border-phosphor-faint px-1.5 py-0.5">
                poached
              </span>
            )}
          </div>
          <div className="text-phosphor-dim text-[10px] uppercase tracking-wide mt-0.5">{hire.roleLabel}</div>
        </div>
        <div className="text-phosphor tabular-nums text-[11px]">
          {formatRates(hire.rates, hire.level)}
        </div>
        <div className="text-phosphor-dim text-[10px] uppercase tracking-wide text-center hidden sm:block">
          Level <span className="text-phosphor tabular-nums">{hire.level}</span>
        </div>
        <div className="flex gap-1 justify-start sm:justify-end flex-wrap col-span-2 sm:col-span-1">
          <span className="text-phosphor-dim text-[10px] uppercase tracking-wide sm:hidden self-center mr-1">
            L<span className="text-phosphor tabular-nums">{hire.level}</span>
          </span>
          {canManage && (
            <>
              {isMaxLevel ? (
                <span className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-phosphor-dim border border-phosphor-faint inline-flex items-center min-h-[44px]">
                  max
                </span>
              ) : (
                <PillButton
                  disabled={!canAffordLevelUp}
                  onClick={() => levelUpHire(hire.id)}
                >
                  lvl+1 ({formatCost(levelUpCost)})
                </PillButton>
              )}
              {team && (
                <PillButton onClick={() => removeHireFromTeam(team.id, hire.id)}>
                  unassign
                </PillButton>
              )}
              <PillButton tone="warm" onClick={() => setShowFireConfirm(true)}>
                fire
              </PillButton>
            </>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={showFireConfirm}
        title={`Fire ${hire.name}?`}
        onConfirm={confirmFire}
        onCancel={() => setShowFireConfirm(false)}
        confirmLabel="Fire"
        tone="destructive"
      >
        <p>{hire.name} will be removed from the team. The hire cost is sunk; you can&apos;t get it back.</p>
      </ConfirmDialog>
    </>
  );
}

function PillButton({ disabled, onClick, children, tone = 'normal' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-3 font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors min-h-[44px] inline-flex items-center justify-center',
        disabled
          ? 'border-phosphor-faint text-phosphor-dim cursor-not-allowed'
          : tone === 'warm'
            ? 'border-[#f0c674] text-[#f0c674] hover:bg-[#f0c674] hover:text-bg cursor-pointer'
            : 'border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg cursor-pointer',
      )}
    >
      {children}
    </button>
  );
}

function formatRates(rates, level) {
  return Object.entries(rates)
    .map(([c, baseRate]) => {
      const v = baseRate * level;
      const prefix = c === 'money' ? '$' : '';
      const suffix = c === 'money' ? '/s' : ` ${CURRENCY_EMOJI[c]}/s`;
      return `${prefix}${v}${suffix}`;
    })
    .join('  ');
}
