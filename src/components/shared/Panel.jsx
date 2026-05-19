import clsx from 'clsx';

/**
 * The canonical container. Bordered box with optional "tab" label that interrupts the border.
 *
 * @param {string} [title] - The bracketed label shown on the top border. Omit for a plain panel.
 * @param {string} [className] - Extra Tailwind classes for the panel root.
 * @param {React.ReactNode} children - Panel content.
 */
export function Panel({ title, className, children }) {
  return (
    <div
      className={clsx(
        'relative border border-phosphor-faint bg-bg-elevated p-5 pb-4 mb-5',
        className,
      )}
    >
      {title && (
        <span className="absolute -top-2.5 left-3.5 bg-bg px-2.5 text-[11px] tracking-[0.16em] uppercase text-phosphor-dim z-10">
          {title}
        </span>
      )}
      {children}
    </div>
  );
}
