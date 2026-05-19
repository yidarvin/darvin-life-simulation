import clsx from 'clsx';
import { sound } from '../../utils/sound';

/**
 * Secondary button. Smaller than ActionButton; used for footer controls and meta UI.
 *
 * @param {React.ReactNode} children - Label.
 * @param {() => void} onClick - Click handler.
 * @param {'normal'|'active'} [variant='normal'] - 'active' shows a brighter border.
 * @param {string} [className]
 */
export function Button({ children, onClick, variant = 'normal', className, ...rest }) {
  const handleClick = (e) => {
    sound.play('click');
    onClick?.(e);
  };
  return (
    <button
      onClick={handleClick}
      className={clsx(
        'bg-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] cursor-pointer transition-colors border',
        variant === 'normal'
          ? 'border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor'
          : 'border-phosphor-bright text-phosphor-bright',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
