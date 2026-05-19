import clsx from 'clsx';

/**
 * Page-level shell. Sits inside <body>. Centers content, caps width, applies page padding.
 *
 * @param {React.ReactNode} children
 * @param {string} [className] - Extra utility classes if needed.
 */
export function AppShell({ children, className }) {
  return (
    <main className={clsx('min-h-screen max-w-[920px] mx-auto p-8', className)}>
      {children}
    </main>
  );
}
