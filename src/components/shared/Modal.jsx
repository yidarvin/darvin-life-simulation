import { useEffect } from 'react';
import clsx from 'clsx';

/**
 * Full-screen modal overlay.
 *
 * @param {boolean} open - Whether the modal is visible.
 * @param {string} [title] - Title shown in display font.
 * @param {React.ReactNode} children - Body content (paragraphs, etc.)
 * @param {Array<{label: string, onClick: () => void, variant?: 'primary'|'secondary'}>} actions - Buttons at the bottom.
 * @param {() => void} [onClose] - Called on Escape or backdrop click. Omit / pass null to disable both.
 * @param {boolean} [dismissible=true] - If false, backdrop click and Escape do nothing (use for forced flows).
 * @param {string} [className] - Extra classes for the modal panel.
 */
export function Modal({ open, title, children, actions = [], onClose, dismissible = true, className }) {
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
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={clsx(
          'bg-bg-elevated border border-phosphor p-9 max-w-[580px] w-full text-center',
          className,
        )}
        style={{ boxShadow: '0 0 50px rgba(45, 212, 191, 0.35)' }}
      >
        {title && (
          <h2
            id="modal-title"
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
          <div className="mt-5 flex justify-center gap-3">
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
    'px-7 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors border';
  const styles = {
    primary: 'bg-bg-deep border-phosphor text-phosphor-bright hover:bg-phosphor hover:text-bg',
    secondary: 'bg-bg-deep border-phosphor-faint text-phosphor-dim hover:border-phosphor hover:text-phosphor',
  };
  return (
    <button className={clsx(base, styles[variant])} onClick={onClick}>
      {label}
    </button>
  );
}
