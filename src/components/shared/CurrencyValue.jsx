import clsx from 'clsx';

/**
 * Formatted currency display. Floors the value, adds thousands separators, uses tabular nums.
 *
 * @param {number} value - The raw numeric value.
 * @param {boolean} [money] - If true, prefix with $.
 * @param {string} [emoji] - Optional emoji shown before the value.
 * @param {'sm'|'md'|'lg'|'xl'} [size='md'] - Display size tier.
 * @param {boolean} [bright] - Use phosphor-bright color with glow.
 * @param {string} [className]
 */
export function CurrencyValue({ value, money = false, emoji, size = 'md', bright = false, className }) {
  const formatted = (money ? '$' : '') + Math.floor(value).toLocaleString();
  const sizeClasses = {
    sm: 'font-mono text-[13px]',
    md: 'font-mono text-[14px]',
    lg: 'font-display text-[24px]',
    xl: 'font-display text-[36px]',
  };
  const colorClasses = bright ? 'text-phosphor-bright' : 'text-phosphor';
  const glowStyle = bright ? { textShadow: '0 0 6px rgba(45, 212, 191, 0.35)' } : undefined;

  return (
    <span
      className={clsx('tabular-nums', sizeClasses[size], colorClasses, className)}
      style={glowStyle}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      {formatted}
    </span>
  );
}
