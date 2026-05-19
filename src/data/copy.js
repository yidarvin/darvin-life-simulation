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
    internship: {
      knowledge: {
        command: './push_commit.sh',
        flavor: 'Push code. Reviewer was hired three weeks ago.',
        rewardLabel: '+{n} Knowledge +1 🌟',
      },
      money: {
        command: './close_ticket.sh',
        flavor: 'Close out a Jira ticket. #general celebrates with three rocket emojis.',
        rewardLabel: '+${n} +1 🌟',
      },
      research: {
        command: './read_internal_doc.sh',
        flavor: 'Skim the design doc. Half the diagrams are dead Figma links.',
        rewardLabel: '+{n} Research +1 🌟',
      },
      applications: {
        command: './prep_return_pitch.sh',
        flavor: 'Polish the slide deck for the return-offer conversation. Add a roadmap. Cite yourself.',
        rewardLabel: '+{n} Application +1 🌟',
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
  modals: {
    yearTransition: {
      title: 'End of {currentYear} year',
      bodyTemplate:
        'You survived. {currentYear}-year transcript: a few off-by-ones, several cans of cold brew, {flavor}\n\nNext: {nextYear} year. Unlocking {unlocks}.',
      confirmLabel: 'Continue',
      cancelLabel: 'Stay a while',
    },
    internshipOffer: {
      title: 'Summer internship offer',
      bodyTemplate:
        '{company} is offering you a summer internship.\n\n{companyFlavor}\n\n90 days. Perform well, you get a return offer. Perform poorly, you get a LinkedIn endorsement.',
      acceptLabel: 'Accept',
      declineLabel: 'Decline',
    },
    internshipResults: {
      titleSuccess: 'Return offer extended',
      titleFailure: 'No return offer',
      bodyTemplateSuccess:
        'You finished the summer at {company} with {influence} Influence — enough to earn a return offer.\n\nYou now have a fallback senior-year job offer. You will mention this in every conversation with your peers for the next nine months.',
      bodyTemplateFailure:
        'You finished the summer at {company} with {influence} Influence — not quite enough for a return offer.\n\nYou get a LinkedIn endorsement from your manager. Their connection still expires next quarter.',
      confirmLabel: 'Begin junior year',
      returnOfferThreshold: 30,
      returnOfferBonus: { knowledge: 500, influence: 20 },
    },
  },
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
