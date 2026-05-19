/**
 * Maps game phases (17 from session 31) to music file keys (13 after consolidation).
 *
 * Phases that share a music key play the same file with no transition
 * when crossing between them — e.g., freshman → sophomore keeps the same
 * loop running.
 */
export const PHASE_TO_MUSIC_KEY = {
  'undergrad-freshman':  'undergrad-early',
  'undergrad-sophomore': 'undergrad-early',
  'undergrad-junior':    'undergrad-late',
  'undergrad-senior':    'undergrad-late',
  'internship':          'internship',
  'faang-low':           'faang-low',
  'faang-mid':           'faang-mid',
  'faang-high':          'faang-high',
  'startup-low':         'startup-low',
  'startup-mid':         'startup-mid',
  'startup-high':        'startup-high',
  'phd-low':             'phd-low',
  'phd-mid':             'phd-mid',
  'phd-high':            'phd-high',
  'upwork-low':          'upwork',
  'upwork-mid':          'upwork',
  'upwork-high':         'upwork',
};

export function getMusicKey(phase) {
  return PHASE_TO_MUSIC_KEY[phase] ?? null;
}
