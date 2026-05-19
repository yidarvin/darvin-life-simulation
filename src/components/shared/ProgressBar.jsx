import clsx from 'clsx';

/**
 * Thin horizontal progress bar with glow on the filled portion.
 *
 * @param {number} value - Current value.
 * @param {number} max - Goal/maximum value.
 * @param {boolean} [complete] - If true, fill switches to phosphor-bright.
 * @param {string} [className]
 */
export function ProgressBar({ value, max, complete, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const isComplete = complete ?? value >= max;
  return (
    <div
      className={clsx(
        'h-3 bg-bg-deep border border-phosphor-faint relative overflow-hidden',
        className,
      )}
    >
      <div
        className={clsx('h-full transition-[width] duration-300', isComplete ? 'bg-phosphor-bright' : 'bg-phosphor')}
        style={{
          width: `${pct}%`,
          boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)',
        }}
      />
    </div>
  );
}
