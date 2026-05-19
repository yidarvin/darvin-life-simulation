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
    jobOfferResults: {
      titleSuccess: 'Offers in',
      titleFailure: 'No offers',
      bodyTemplateSuccess:
        'You submitted {applications} applications across the cycle. Your internship return-offer counted as a fallback. Influence accumulated: {influence}.\n\nFinal offer-score: {score}. You have options.',
      bodyTemplateFailure:
        'You submitted {applications} applications across the cycle. Most went into the void. A few asked you to "stay in touch."\n\nFinal offer-score: {score}. The job market this year is "challenging." Time to go freelance.',
      scoringThreshold: 20,
      scoringWeights: { applications: 1, influence: 0.25, returnOffer: 8, knowledge: 0.005 },
      confirmLabelSuccess: 'Pick a track',
      confirmLabelFailure: 'Begin Upwork track',
    },
    trackChoice: {
      title: 'Senior year — job offer',
      bodyParagraphs: [
        'Three tracks open up.',
        '• FAANG — high salary, low ownership. Your name on a million org-chart squares.',
        '• Startup — low salary, high equity. 60% chance of "liquidation event" being "we shut down."',
        '• PhD — almost no salary. Your name on three papers.',
        'Pick carefully. Swapping later costs ranks.',
      ],
      options: {
        faang: 'FAANG',
        startup: 'Startup',
        phd: 'PhD',
      },
    },
    forcedUpwork: {
      title: 'No offer',
      bodyParagraphs: [
        'The job market this year is "challenging." Your applications collectively received {responses} responses, {interviews} interviews, and zero offers.',
        'Time to go freelance. Welcome to Upwork.',
        'Starting balance: 40 Connects, JSS 100%. You\'ll be fine. Probably.',
      ],
      confirmLabel: 'Begin Upwork track',
    },
    rankUp: {
      title: 'Promoted: {rankLabel}',
      bodyTemplate:
        'You traded {costSummary} for the rank-up.\n\n{flavor}',
      confirmLabel: 'Acknowledged',
    },
    endgameReached: {
      faang: {
        title: 'Distinguished Fellow',
        body: 'Your name is now a section in the company\'s official engineering ladder doc.\n\nThree product orgs build on your former proposals. Two of those projects are quietly winding down. One won an industry award you\'ve already forgotten you received.\n\nYou have reached the top of the FAANG track.',
      },
      startup: {
        title: '$1B paper valuation',
        body: 'The IPO bell has rung. Your equity vested. The stock is up 12% on day one and down 30% by month three.\n\nYour cofounder has gone full-time on their podcast. Your investors have moved to their next bet.\n\nYou can stop checking Hacker News for posts about you now. You won\'t, but you can.\n\nYou have reached the top of the Startup track.',
      },
      phd: {
        title: 'The Named Chair',
        body: 'An endowed chair. Three of your former students are now junior faculty. Your h-index is high enough that your name appears in undergraduate textbooks.\n\nYou answer email twice a year.\n\nYou have reached the top of the PhD track.',
      },
      upwork: {
        title: 'Platform Influencer',
        body: 'You\'ve made it to the top of the Upwork freelancer ladder. Your YouTube subscribers think you\'re "an inspiration."\n\nYour former clients have started ghosting you the same way they used to.\n\nThe cycle is complete.',
      },
      confirmLabel: 'Acknowledge — keep playing',
    },
    swapConfirm: {
      title: 'Swap track?',
      bodyTemplate:
        'Leaving {currentTrackLabel} ({currentRankLabel}) for {targetTrackLabel} will drop you to rank {targetRank} ({targetRankLabel}).\n\nThis costs {swapCost} rank(s). Your specialization, hires, teams, and Influence allocation reset.',
      confirmLabel: 'Confirm swap',
      cancelLabel: 'Stay',
    },
    upworkGauntlet: [
      {
        title: 'Are you sure?',
        bodyTemplate:
          'Voluntarily leaving {currentTrackLabel} for Upwork will drop you to rank {targetRank} ({targetRankLabel}) and add three new mechanics: Connects, Job Success Score, and a 10% platform tax.\n\nThis is reversible — you can swap back at -2 ranks later — but you\'ll be rebuilding from the bottom.',
        continueLabel: 'Continue',
        cancelLabel: 'Cancel',
      },
      {
        title: 'Just so we\'re clear',
        bodyTemplate:
          'Connects regenerate at 10 per day. Each gig application costs 10–16 Connects. Application acceptance rate is 5–10%.\n\nJob Success Score starts at 100% and drops on bad reviews. Below 90%, you lose Top Rated tier and its rate bonus.\n\nUpwork takes 10% of every gig you complete. That counter never resets.\n\nStill in?',
        continueLabel: 'Yes',
        cancelLabel: 'No',
      },
      {
        title: 'One more thing',
        bodyTemplate:
          'Your LinkedIn title will read "Founder & CEO." You will not specify of what.\n\nPeople will assume your company has one employee. They will be correct.\n\nYou will start using the word "consulting" in conversation. You will not be able to stop.',
        continueLabel: 'Acknowledged',
        cancelLabel: 'Cancel',
      },
      {
        title: 'We need to talk about money',
        bodyTemplate:
          'Your former colleagues will offer you "consulting" work at 30% of your old rate, then ghost you mid-project.\n\nThe IRS will become your closest pen pal. You will learn what a quarterly estimated tax payment is. You will pay it late.\n\nYour accountant — whom you do not yet have — will charge $400/hour to tell you what you already know.\n\nLast chance to back out.',
        continueLabel: 'I want this',
        cancelLabel: 'Cancel',
      },
      {
        title: 'Fine',
        bodyTemplate:
          'Welcome to Upwork. Please upload a profile photo. We recommend something that looks like a hostage situation.\n\nYour starting balance: 40 Connects, $0, JSS 100%.\n\nGood luck out there.',
        continueLabel: 'Begin',
        // No cancelLabel — step 5 commits.
      },
    ],
  },
  gauntlet: [],
  specialization: {
    panelTitle: {
      faang: 'Pick a specialty',
      startup: 'Pick a wedge',
      phd: 'Pick a subfield',
      upwork: 'Pick a niche',
    },
    panelSubtitle: {
      faang: 'The internal job-leveling document calls all roles "Software Engineer." But your manager will ask which queue.',
      startup: 'Your investors want to know what you\'re "primarily" focused on. Pick something with a roadmap.',
      phd: 'Your advisor wants you to "commit." This is also for the candidacy paperwork.',
      upwork: 'Your profile needs a tagline. "Generalist" doesn\'t rank in search.',
    },
    confirmHint: 'One-time choice. Resets on track swap.',
  },
  tooltips: {},
};

/**
 * Lightweight template formatter. Replaces {token} placeholders with values.
 *   formatCopy('+{n} Knowledge', { n: 2 })  →  '+2 Knowledge'
 */
export function formatCopy(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in values ? values[key] : `{${key}}`));
}
