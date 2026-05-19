/**
 * Player-facing copy. Mirrors src/context/COPY_REGISTRY.md.
 *
 * When editing, update both files in lockstep. The markdown is human-readable spec;
 * this file is what code imports.
 */

export const copy = {
  /**
   * Action button copy. The `undergrad` block is per-currency; the career-track blocks
   * are per-track-per-currency (since labels re-skin once a track is chosen).
   */
  actions: {
    undergrad: {
      knowledge: {
        command: './do_pset.sh',
        flavor: 'Spend three hours hunting an off-by-one error.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './ta_section.sh',
        flavor: "Explain recursion to five students who 'kind of get it.'",
        rewardLabel: '+${n}',
      },
      research: {
        command: './beg_advisor.sh',
        flavor: 'Wash glassware. Maybe get a coauthor credit. Maybe not.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './fire_off_cv.sh',
        flavor: 'Customize a cover letter. The recruiter will not read it.',
        rewardLabel: '+{n} Application',
      },
    },
    // Career-track action copy is populated in session 17+.
    faang: {},
    startup: {},
    phd: {},
    upwork: {},
  },

  // Other sections populated in later sessions:
  shop: [],
  modals: {},
  gauntlet: [],
  specialization: {},
  tooltips: {},
};

/**
 * Lightweight template formatter. Replaces {token} placeholders with values.
 *   formatCopy('+{n} Knowledge', { n: 2 })  →  '+2 Knowledge'
 */
export function formatCopy(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in values ? values[key] : `{${key}}`));
}
