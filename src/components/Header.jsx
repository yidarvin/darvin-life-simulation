/**
 * Page header: large display title + small uppercase subtitle.
 *
 * The cursor block animates with the `animate-blink` keyframe (from Tailwind config).
 *
 * @param {string} [version] - Version label shown in the subtitle.
 * @param {string} [stage] - Optional stage label shown next to the version.
 */
export function Header({ version = 'v0.0', stage }) {
  return (
    <header className="text-center mb-12 pt-4">
      <h1
        className="font-display text-6xl text-phosphor-bright leading-none tracking-wide"
        style={{
          textShadow:
            '0 0 10px rgba(45, 212, 191, 0.45), 0 0 24px rgba(45, 212, 191, 0.2)',
        }}
      >
        Life is a Simulation
        <span
          className="inline-block w-[0.5em] h-[0.85em] bg-phosphor-bright animate-blink ml-1 align-[-2px]"
          style={{ boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)' }}
        />
      </h1>
      <p className="mt-3 text-xs tracking-[0.16em] uppercase text-phosphor-dim">
        {version}
        {stage && ` // ${stage}`}
      </p>
    </header>
  );
}
