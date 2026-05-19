import clsx from 'clsx';

/**
 * Page-level shell. Sits inside <body>. Centers content, caps width, applies page padding.
 *
 * min-h-dvh uses the dynamic viewport unit so the iOS Safari address bar doesn't
 * eat space. max(1rem, env(safe-area-inset-*)) keeps the desktop padding floor.
 *
 * @param {React.ReactNode} children
 * @param {string} [className] - Extra utility classes if needed.
 */
export function AppShell({ children, className }) {
  return (
    <main
      className={clsx(
        'min-h-dvh max-w-[920px] mx-auto p-4 sm:p-8',
        'pt-[max(1rem,env(safe-area-inset-top))]',
        'pb-[max(1rem,env(safe-area-inset-bottom))]',
        'pl-[max(1rem,env(safe-area-inset-left))]',
        'pr-[max(1rem,env(safe-area-inset-right))]',
        className,
      )}
    >
      {children}
    </main>
  );
}
