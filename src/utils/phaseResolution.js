/**
 * Resolve the current action-copy "phase" from game state.
 *
 * Phases:
 *   - 'undergrad-freshman' | 'undergrad-sophomore' | 'undergrad-junior' | 'undergrad-senior'
 *   - 'internship'
 *   - '{track}-low'  (ranks 1-3)
 *   - '{track}-mid'  (ranks 4-5)
 *   - '{track}-high' (ranks 6-7)
 */
export function getCurrentPhase(state) {
  if (state.stage === 'internship') return 'internship';
  if (state.stage === 'undergrad') return `undergrad-${state.year}`;
  if (state.stage === 'career' && state.career.currentTrack) {
    const tier = state.career.rank <= 3 ? 'low'
               : state.career.rank <= 5 ? 'mid'
               : 'high';
    return `${state.career.currentTrack}-${tier}`;
  }
  return 'undergrad-freshman';
}

/**
 * Resolve action copy for a (phase, currency) pair. Falls back through:
 *   1. phase-specific (e.g., 'faang-mid')
 *   2. track-default (e.g., 'faang')
 *   3. undergrad-senior (the "complete" undergrad copy)
 *
 * Returns null only if currency has no copy at any level.
 */
export function resolveActionCopy(phase, currency, copyActions) {
  const phaseBlock = copyActions[phase];
  if (phaseBlock?.[currency]) return phaseBlock[currency];

  const trackKey = phase.split('-')[0];
  const trackDefault = copyActions[trackKey];
  if (trackDefault?.[currency]) return trackDefault[currency];

  return copyActions['undergrad-senior']?.[currency] ?? null;
}
