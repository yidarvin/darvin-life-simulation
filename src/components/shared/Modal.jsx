import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { usePreviousFocus } from '../../utils/usePreviousFocus';

const TITLE_ID = 'modal-title';

/**
 * Full-screen modal overlay with focus trap, initial focus, focus restoration,
 * and dialog ARIA semantics.
 *
 * @param {boolean} open
 * @param {string} [title]
 * @param {React.ReactNode} children
 * @param {Array<{label: string, onClick: () => void, variant?: 'primary'|'secondary'}>} [actions]
 * @param {() => void} [onClose] - Called on Escape or backdrop click.
 * @param {boolean} [dismissible=true]
 * @param {string} [className]
 */
export function Modal({
  open,
  title,
  children,
  actions = [],
  onClose,
  dismissible = true,
  className,
}) {
  const dialogRef = useRef(null);
  usePreviousFocus(open);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const firstPrimary = dialog.querySelector('[data-variant="primary"]');
    (firstPrimary || dialog).focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open || !dismissible || !onClose) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && dismissible && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(13,13,13,0.94)] flex items-center justify-center z-[100] animate-fade-in p-5"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? TITLE_ID : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={clsx(
          'bg-bg-elevated border border-phosphor p-9 max-w-[580px] w-full text-center outline-none',
          className,
        )}
        style={{ boxShadow: '0 0 50px rgba(45, 212, 191, 0.35)' }}
      >
        {title && (
          <h2
            id={TITLE_ID}
            className="font-display text-[44px] text-phosphor-bright mb-4 tracking-wide"
            style={{ textShadow: '0 0 10px rgba(45, 212, 191, 0.5)' }}
          >
            {title}
          </h2>
        )}
        <div className="text-phosphor leading-relaxed text-[13px] [&>p]:mb-3 [&>p:last-child]:mb-0">
          {children}
        </div>
        {actions.length > 0 && (
          <div className="mt-5 flex justify-center gap-3 flex-wrap">
            {actions.map((action, i) => (
              <ModalActionButton key={i} {...action} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModalActionButton({ label, onClick, variant = 'primary' }) {
  const base =
    'px-7 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors border focus:outline-none focus:ring-2 focus:ring-phosphor-bright focus:ring-offset-2 focus:ring-offset-bg-elevated';
  const styles = {
    primary: 'bg-bg-deep border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg',
    secondary: 'bg-bg-deep border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor',
  };
  return (
    <button data-variant={variant} className={clsx(base, styles[variant])} onClick={onClick}>
      {label}
    </button>
  );
}
