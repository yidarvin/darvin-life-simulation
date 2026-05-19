import { useRef } from 'react';
import clsx from 'clsx';

/**
 * Terminal-style action button. Used for the primary game actions (clickable currencies).
 *
 * @param {string} command - The command-style label (e.g., './do_pset.sh').
 * @param {string} flavor - Italic flavor text below the command.
 * @param {string|React.ReactNode} reward - The reward label (e.g., '+1 Knowledge').
 * @param {() => void} onClick - Click handler.
 * @param {boolean} [disabled] - Disabled state.
 * @param {string} [className] - Extra classes.
 */
export function ActionButton({ command, flavor, reward, onClick, disabled = false, className }) {
  const ref = useRef(null);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    spawnFloatText(ref.current, reward);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        'bg-bg-deep border border-phosphor-faint p-4 cursor-pointer text-left relative overflow-hidden font-mono text-[13px] transition-colors text-phosphor',
        !disabled && 'hover:border-phosphor hover:bg-[#11201d] active:scale-[0.98]',
        disabled && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      <div className="text-phosphor-bright font-medium mb-1 before:content-['$_'] before:text-phosphor-dim">
        {command}
      </div>
      <div className="text-phosphor-dim text-[11px] italic leading-snug mb-2.5">
        {flavor}
      </div>
      <div className="text-phosphor-bright text-[11px] font-medium tracking-[0.06em] uppercase">
        {reward}
      </div>
    </button>
  );
}

function spawnFloatText(parent, text) {
  if (!parent) return;
  const el = document.createElement('span');
  el.className =
    'absolute pointer-events-none text-phosphor-bright font-display text-[22px] animate-float-up';
  el.style.textShadow = '0 0 8px rgba(45, 212, 191, 0.5)';
  el.textContent = typeof text === 'string' ? text : '';
  const rect = parent.getBoundingClientRect();
  const x = rect.width / 2 - 20 + (Math.random() - 0.5) * 80;
  el.style.left = x + 'px';
  el.style.top = '10px';
  parent.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
