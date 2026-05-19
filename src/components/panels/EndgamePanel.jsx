import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { useGameStore } from '../../game/state/store';
import { Panel } from '../shared/Panel';
import { ProgressBar } from '../shared/ProgressBar';
import { CurrencyValue } from '../shared/CurrencyValue';
import {
  FAANG_INITIATIVES,
  PHD_ENDOWMENTS,
  UPWORK_COURSES,
  getCurrentExitPrice,
} from '../../data/endgameMechanics';
import { CAREER_TRACKS } from '../../data/careerTracks';
import { canAfford, getSpendableCurrencies, formatCost, CURRENCY_EMOJI } from '../../utils/currency';
import { sound } from '../../utils/sound';

export function EndgamePanel() {
  const stage = useGameStore((s) => s.stage);
  const rank = useGameStore((s) => s.career.rank);
  const track = useGameStore((s) => s.career.currentTrack);

  if (stage !== 'career' || rank < 7 || !track) return null;

  const trackData = CAREER_TRACKS[track];
  const endgameLabel = trackData?.endgame?.label || 'Endgame';

  return (
    <Panel title={`[ ${endgameLabel} ]`}>
      {track === 'faang' && <FaangEndgame />}
      {track === 'startup' && <StartupEndgame />}
      {track === 'phd' && <PhdEndgame />}
      {track === 'upwork' && <UpworkEndgame />}
    </Panel>
  );
}

function FaangEndgame() {
  const currencies = useGameStore((s) => s.currencies);
  const influenceAllocation = useGameStore((s) => s.career.influenceAllocation);
  const launch = useGameStore((s) => s.launchFaangInitiative);
  const spendable = getSpendableCurrencies({ currencies, career: { influenceAllocation } });

  return (
    <>
      <div className="text-phosphor-dim text-[11px] italic mb-3">
        Fellow initiatives. Pay cost, claim outsized reward. Repeatable.
      </div>
      <div className="space-y-2">
        {FAANG_INITIATIVES.map((init) => {
          const can = canAfford(spendable, init.cost);
          return (
            <InitiativeRow
              key={init.id}
              data={init}
              affordable={can}
              onLaunch={() => launch(init.id)}
            />
          );
        })}
      </div>
    </>
  );
}

function StartupEndgame() {
  const equity = useGameStore((s) => s.currencies.equity);
  const sellEquity = useGameStore((s) => s.sellEquity);
  const [amount, setAmount] = useState(1);
  const [price, setPrice] = useState(getCurrentExitPrice());

  useEffect(() => {
    const id = setInterval(() => setPrice(getCurrentExitPrice()), 100);
    return () => clearInterval(id);
  }, []);

  const moneyValue = Math.floor(amount * price);
  const canSell = equity >= amount && amount > 0;

  const sellAll = () => {
    sellEquity(Math.floor(equity));
  };

  return (
    <>
      <div className="text-phosphor-dim text-[11px] italic mb-3">
        Convert Equity to Money at the current market price.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="border border-phosphor-faint bg-bg-deep p-3">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mb-1">Current price</div>
          <div
            className="font-display text-[24px] text-phosphor-bright tabular-nums"
            style={{ textShadow: '0 0 8px rgba(45, 212, 191, 0.4)' }}
          >
            ${price.toFixed(2)}
          </div>
          <div className="text-phosphor-dim text-[10px] mt-0.5">per 1 🏛️</div>
        </div>
        <div className="border border-phosphor-faint bg-bg-deep p-3">
          <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.14em] mb-1">Holdings</div>
          <div className="font-display text-[24px] text-phosphor tabular-nums">
            <CurrencyValue value={equity} size="lg" />
          </div>
          <div className="text-phosphor-dim text-[10px] mt-0.5">🏛️ Equity</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="1"
          max={Math.floor(equity)}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="flex-1 bg-bg-deep border border-phosphor-faint text-phosphor px-2 py-2 font-mono text-base focus:outline-none focus:border-phosphor min-h-[44px]"
        />
        <div className="text-phosphor text-[12px] tabular-nums whitespace-nowrap">
          = <span className="text-phosphor-bright">${moneyValue.toLocaleString()}</span>
        </div>
        <button
          onClick={() => { sound.play('click'); sellEquity(amount); }}
          disabled={!canSell}
          className={clsx(
            'px-3 min-h-[44px] font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors',
            canSell
              ? 'border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg cursor-pointer'
              : 'border-phosphor-faint text-phosphor-dim cursor-not-allowed',
          )}
        >
          sell
        </button>
        <button
          onClick={() => { sound.play('click'); sellAll(); }}
          disabled={equity < 1}
          className="px-3 min-h-[44px] font-mono text-[10px] uppercase tracking-[0.1em] border border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor cursor-pointer"
        >
          all
        </button>
      </div>
    </>
  );
}

function PhdEndgame() {
  const currencies = useGameStore((s) => s.currencies);
  const influenceAllocation = useGameStore((s) => s.career.influenceAllocation);
  const endowments = useGameStore((s) => s.career.phdEndowments || []);
  const activate = useGameStore((s) => s.activatePhdEndowment);
  const spendable = getSpendableCurrencies({ currencies, career: { influenceAllocation } });

  return (
    <>
      <div className="text-phosphor-dim text-[11px] italic mb-3">
        Permanent endowments. Activate once. Adds to passive generation forever.
      </div>
      <div className="space-y-2">
        {PHD_ENDOWMENTS.map((end) => {
          const owned = endowments.includes(end.id);
          const can = !owned && canAfford(spendable, end.cost);
          return (
            <InitiativeRow
              key={end.id}
              data={end}
              affordable={can}
              owned={owned}
              isPermanent
              onLaunch={() => activate(end.id)}
            />
          );
        })}
      </div>
    </>
  );
}

function UpworkEndgame() {
  const currencies = useGameStore((s) => s.currencies);
  const influenceAllocation = useGameStore((s) => s.career.influenceAllocation);
  const upwork = useGameStore((s) => s.upwork);
  const launch = useGameStore((s) => s.launchUpworkCourse);
  const spendable = getSpendableCurrencies({ currencies, career: { influenceAllocation } });
  const activeCourse = upwork.activeCourse;
  const activeCourseData = activeCourse
    ? UPWORK_COURSES.find((c) => c.id === activeCourse.courseId)
    : null;

  return (
    <>
      <div className="text-phosphor-dim text-[11px] italic mb-3">
        Publish a course. 60-second run. Earns Money <span className="text-phosphor">tax-free</span>.
      </div>

      <div className="text-[11px] text-phosphor-dim mb-3">
        Lifetime course sales:{' '}
        <span className="text-phosphor-bright tabular-nums">
          ${Math.floor(upwork.courseSales).toLocaleString()}
        </span>
      </div>

      {activeCourse && activeCourseData && (
        <ActiveCourseBar course={activeCourse} data={activeCourseData} />
      )}

      <div className="space-y-2 mt-3">
        {UPWORK_COURSES.map((course) => {
          const can = !activeCourse && canAfford(spendable, course.cost);
          return (
            <InitiativeRow
              key={course.id}
              data={course}
              affordable={can}
              isCourse
              onLaunch={() => launch(course.id)}
            />
          );
        })}
      </div>
    </>
  );
}

function ActiveCourseBar({ course, data }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);
  const elapsed = (now - course.startedAt) / 1000;
  const remaining = Math.max(0, data.durationSec - elapsed);

  return (
    <div className="border border-phosphor bg-[#11201d] p-3 mb-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-phosphor-bright font-mono text-[12px]">{data.label} — running</div>
        <div className="text-phosphor-dim text-[11px] tabular-nums">{remaining.toFixed(1)}s left</div>
      </div>
      <ProgressBar value={elapsed} max={data.durationSec} />
      <div className="text-phosphor-dim text-[10px] mt-1 tabular-nums">
        Earned: ${Math.floor(course.totalEarned).toLocaleString()} (tax-free)
      </div>
    </div>
  );
}

function InitiativeRow({ data, affordable, owned, isPermanent, isCourse, onLaunch }) {
  return (
    <div className="border border-phosphor-faint bg-bg-deep p-3 grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3 items-center">
      <div>
        <div className="text-phosphor-bright font-mono text-[12px]">{data.label}</div>
        <div className="text-phosphor-dim text-[11px] italic mt-0.5 leading-snug">{data.flavor}</div>
        <div className="text-phosphor-dim text-[10px] uppercase tracking-[0.1em] mt-2 flex gap-3 flex-wrap">
          <span>
            cost: <span className="text-phosphor">{formatCost(data.cost)}</span>
          </span>
          {data.reward && (
            <span>
              reward: <span className="text-phosphor">{formatRewardOrBoost(data.reward)}</span>
            </span>
          )}
          {data.perSecondBoost && (
            <span>
              perm boost: <span className="text-phosphor">{formatRewardOrBoost(data.perSecondBoost, '/s')}</span>
            </span>
          )}
          {data.moneyRate !== undefined && (
            <span>
              generates: <span className="text-phosphor">${data.moneyRate}/s for {data.durationSec}s</span>
            </span>
          )}
        </div>
      </div>
      <div className="text-right">
        {owned ? (
          <span className="text-[10px] uppercase tracking-[0.12em] text-phosphor-bright border border-phosphor-bright px-2 py-1 inline-block">
            ✓ active
          </span>
        ) : (
          <button
            onClick={() => { sound.play('click'); onLaunch(); }}
            disabled={!affordable}
            className={clsx(
              'px-3 py-2 min-h-[44px] font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors w-full',
              affordable
                ? 'border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg cursor-pointer'
                : 'border-phosphor-faint text-phosphor-dim cursor-not-allowed',
            )}
          >
            {isPermanent ? 'activate' : isCourse ? 'launch' : 'execute'}
          </button>
        )}
      </div>
    </div>
  );
}

function formatRewardOrBoost(obj, suffix = '') {
  return Object.entries(obj)
    .map(([c, v]) => {
      const prefix = c === 'money' ? '$' : '';
      const emojiSuffix = c === 'money' ? '' : ` ${CURRENCY_EMOJI[c]}`;
      return `+${prefix}${v.toLocaleString()}${emojiSuffix}${suffix}`;
    })
    .join('  ');
}
