import clsx from 'clsx';

/**
 * Thin horizontal progress bar with glow on the filled portion.
 *
 * @param {number} value - Current value.
 * @param {number} max - Goal/maximum value.
 * @param {boolean} [complete] - If true, fill switches to phosphor-bright.
 * @param {boolean} [successOnComplete] - If true, fill turns green when complete to signal "threshold met".
 * @param {string} [className]
 */
export function ProgressBar({ value, max, complete, successOnComplete, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const isComplete = complete ?? value >= max;
  const useSuccess = successOnComplete && isComplete;
  return (
    <div
      className={clsx(
        'h-3 bg-bg-deep border relative overflow-hidden',
        useSuccess ? 'border-warning' : 'border-phosphor-faint',
        className,
      )}
    >
      <div
        className={clsx(
          'h-full transition-[width,background-color] duration-300',
          useSuccess ? 'bg-warning' : isComplete ? 'bg-phosphor-bright' : 'bg-phosphor',
        )}
        style={{
          width: `${pct}%`,
          boxShadow: useSuccess
            ? '0 0 10px rgba(240, 198, 116, 0.7)'
            : '0 0 10px rgba(45, 212, 191, 0.5)',
        }}
      />
    </div>
  );
}
