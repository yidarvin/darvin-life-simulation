/**
 * Player-facing copy. Mirrors src/context/COPY_REGISTRY.md.
 *
 * When editing, update both files in lockstep. The markdown is human-readable spec;
 * this file is what code imports.
 */

export const copy = {
  /**
   * Action button copy, keyed by "phase" (year / internship / track-tier). The
   * ActionsPanel resolves the right block via src/utils/phaseResolution.js, which
   * falls through phase-specific → track-default → undergrad-senior.
   */
  actions: {
    // ── Undergrad: per-year ───────────────────────────────────────────────
    'undergrad-freshman': {
      knowledge: {
        command: './compile_hello_world.sh',
        flavor: 'It took six tries. You blame the IDE. It wasn\'t the IDE.',
        rewardLabel: '+{n} Knowledge',
      },
    },
    'undergrad-sophomore': {
      knowledge: {
        command: './debug_segfault.sh',
        flavor: 'You added more print statements. It still segfaults. Different line now.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './ta_section.sh',
        flavor: "Explain recursion to five students who 'kind of get it.'",
        rewardLabel: '+${n}',
      },
    },
    'undergrad-junior': {
      knowledge: {
        command: './optimize_pset.sh',
        flavor: "O(n²) was fine. You'll make it O(n log n) anyway.",
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './grade_labs.sh',
        flavor: 'Hundred fifty lab reports. Each one different. Each one wrong.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './beg_advisor.sh',
        flavor: 'Wash glassware. Maybe get a coauthor credit. Maybe not.',
        rewardLabel: '+{n} Research',
      },
    },
    'undergrad-senior': {
      knowledge: {
        command: './review_distributed_systems.sh',
        flavor: 'You finally understand consensus. Tomorrow you\'ll forget.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './consult_freshman.sh',
        flavor: '$30/hour to explain pointers to a nineteen-year-old.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './run_experiment.sh',
        flavor: 'The cluster\'s down. Try again in an hour. Or tomorrow.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './fire_off_cv.sh',
        flavor: 'Customize a cover letter. The recruiter will not read it.',
        rewardLabel: '+{n} Application',
      },
    },

    // ── Internship ────────────────────────────────────────────────────────
    internship: {
      knowledge: {
        command: './push_first_commit.sh',
        flavor: 'Reviewer requests minor changes. Six rounds.',
        rewardLabel: '+{n} Knowledge +1 🌟',
      },
      money: {
        command: './close_jira_ticket.sh',
        flavor: 'Update three fields. Promote to In Review.',
        rewardLabel: '+${n} +1 🌟',
      },
      research: {
        command: './read_internal_doc.sh',
        flavor: 'Half the design doc is dead Figma links.',
        rewardLabel: '+{n} Research +1 🌟',
      },
      applications: {
        command: './polish_return_pitch.sh',
        flavor: 'Practice your slide. The hiring manager will not attend.',
        rewardLabel: '+{n} Application +1 🌟',
      },
    },

    // ── FAANG ─────────────────────────────────────────────────────────────
    'faang-low': {
      knowledge: {
        command: './push_pr.sh',
        flavor: 'Six review rounds. The diff is twelve lines.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './vest_quarterly.sh',
        flavor: 'RSU notification. Stock is sideways. So are you.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './skim_arxiv.sh',
        flavor: 'Three preprints, one bookmark, zero actually read.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './refer_a_friend.sh',
        flavor: '$5K referral bonus if they get past phone screen. They won\'t.',
        rewardLabel: '+{n} Application',
      },
    },
    'faang-mid': {
      knowledge: {
        command: './lead_design_review.sh',
        flavor: 'Two pages of comments. One actionable.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './advocate_for_promo.sh',
        flavor: 'Your manager wrote "works well with others." That\'s the whole bullet.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './author_internal_paper.sh',
        flavor: 'Quoted by your VP next quarter. You\'ll have moved teams by then.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './pipeline_referral.sh',
        flavor: 'Submitted. Stuck in ATS. Recruiter is on PTO.',
        rewardLabel: '+{n} Application',
      },
    },
    'faang-high': {
      knowledge: {
        command: './set_company_strategy.sh',
        flavor: 'Three orgs implement your doc. You forget you wrote it.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './attend_calibration.sh',
        flavor: 'You discuss other people\'s packets for four hours. You don\'t bring up your own.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './keynote_summit.sh',
        flavor: 'Standing room only. Two people taking notes.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './hire_distinguished_engineer.sh',
        flavor: 'You calibrate them. They\'ll outrank you in eighteen months.',
        rewardLabel: '+{n} Application',
      },
    },

    // ── Startup ───────────────────────────────────────────────────────────
    'startup-low': {
      knowledge: {
        command: './read_docs.sh',
        flavor: 'The docs are out of date. Read the source.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './close_pilot.sh',
        flavor: 'Three calls. One close. They\'ll churn in Q2.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './customer_interview.sh',
        flavor: 'They want a feature you already shipped. Call it discovery.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './investor_update.sh',
        flavor: 'Quarterly email. Skip the bad news.',
        rewardLabel: '+{n} Application',
      },
    },
    'startup-mid': {
      knowledge: {
        command: './review_engineering_doc.sh',
        flavor: 'Three rounds. Your CTO wrote one of them.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './close_enterprise.sh',
        flavor: 'Sales cycle: fourteen months. Contract: twelve months. Math: don\'t.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './rewrite_pitch_v2.sh',
        flavor: 'Same deck, new logo. Investors love it.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './recruit_vp.sh',
        flavor: 'Coffee chats. Five candidates ghost. One signs.',
        rewardLabel: '+{n} Application',
      },
    },
    'startup-high': {
      knowledge: {
        command: './review_skip_org.sh',
        flavor: 'Skip your skip. Trust your VP. They\'ll quit anyway.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './prep_roadshow.sh',
        flavor: 'Five cities, five days, one pitch. Memorize the breath marks.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './advise_portfolio_co.sh',
        flavor: 'Two hours, no fee. You call them "investments."',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './recruit_board_member.sh',
        flavor: 'Decline twelve LinkedIn DMs daily. Politely.',
        rewardLabel: '+{n} Application',
      },
    },

    // ── PhD ───────────────────────────────────────────────────────────────
    'phd-low': {
      knowledge: {
        command: './read_seminal_paper.sh',
        flavor: 'Three days. Eight pages. You missed the point.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './ta_intro_cs.sh',
        flavor: 'A hundred CS50 problem sets. Caffeine intensifies.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './run_experiment.sh',
        flavor: 'Cluster\'s down. Try again. Try again. Try again.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './apply_for_fellowship.sh',
        flavor: 'Re-skin last year\'s proposal. Pray.',
        rewardLabel: '+{n} Application',
      },
    },
    'phd-mid': {
      knowledge: {
        command: './teach_grad_seminar.sh',
        flavor: 'Five students. Three were on Slack the whole time.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './adjunct_evening_college.sh',
        flavor: '$3K per course. Ninety-minute drive each way.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './write_paper.sh',
        flavor: "Citation forty-seven doesn't say what you said it says.",
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './apply_to_neurips.sh',
        flavor: 'Reviewer 2 is back. You can tell by the tone.',
        rewardLabel: '+{n} Application',
      },
    },
    'phd-high': {
      knowledge: {
        command: './advise_grad_student.sh',
        flavor: 'They have questions. You have answers. They\'re different.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './give_keynote.sh',
        flavor: 'Travel reimbursed. Honorarium: $2K. Worth it.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './write_textbook.sh',
        flavor: 'Twelve chapters. Three years. Fourteen copies sold.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './recommend_postdoc.sh',
        flavor: "Strong letter. They'll get the position. You'll lose them.",
        rewardLabel: '+{n} Application',
      },
    },

    // ── Upwork ────────────────────────────────────────────────────────────
    'upwork-low': {
      knowledge: {
        command: './read_brief.sh',
        flavor: '"Make me a website like Amazon. Budget fifty dollars."',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './bid_on_gig.sh',
        flavor: 'Burn 16 Connects. Get auto-rejected. Burn 16 more.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './fix_clients_code.sh',
        flavor: 'Their last freelancer used jQuery in 2025. You sigh.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './update_profile_bio.sh',
        flavor: "Add the word 'passionate' for the third time.",
        rewardLabel: '+{n} Application',
      },
    },
    'upwork-mid': {
      knowledge: {
        command: './prepare_proposal.sh',
        flavor: 'Cover letter. Portfolio links. The CSV they asked for.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './complete_top_rated_gig.sh',
        flavor: 'Deliver. Upwork takes ten percent. Smile in the review.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './build_template_library.sh',
        flavor: 'Reuse the WordPress theme. Charge full price.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './pitch_long_term_client.sh',
        flavor: '"Looking forward to a multi-year engagement." They\'ll churn in 60 days.',
        rewardLabel: '+{n} Application',
      },
    },
    'upwork-high': {
      knowledge: {
        command: './record_course_module.sh',
        flavor: 'Forty minutes. Three takes. One usable.',
        rewardLabel: '+{n} Knowledge',
      },
      money: {
        command: './sell_one_more_course.sh',
        flavor: '$497. Bypasses the platform tax. That\'s the whole pitch.',
        rewardLabel: '+${n}',
      },
      research: {
        command: './poach_subcontractor.sh',
        flavor: '"Quick coffee?" They say yes. They always say yes.',
        rewardLabel: '+{n} Research',
      },
      applications: {
        command: './run_email_funnel.sh',
        flavor: '37,000 subscribers. Twenty-three actually open.',
        rewardLabel: '+{n} Application',
      },
    },
  },

  // Other sections populated in later sessions:
  shop: [],
  modals: {
    offlineCatchUp: {
      title: 'Welcome back',
      cappedNote: '(Catch-up capped at 4 hours. The clock keeps moving; the rewards plateau.)',
      confirmLabel: 'Back to it',
    },
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
    vacationWarning: {
      title: 'Burnout warning',
      bodyTemplate:
        'Your generation rates have dropped to {pct}% of normal. Your hires haven\'t had a 1:1 in weeks. You drafted a Slack message at 2am and didn\'t send it.\n\nTake a vacation for $1,000 (-50 burnout). Or push through and let it ride.',
      takeLabel: 'Vacation ($1,000)',
      skipLabel: 'Push through',
    },
    annualReview: {
      title: 'Annual performance review',
      bodySuccess: 'Your manager described your year as "exceptional." HR is processing a bonus.',
      bodyNeutral: 'Your manager called your year "solid." No mention of promotion.',
      bodyFailure: 'Your manager described your year as "showing potential." HR is processing nothing.',
      bonusSuccess: { money: 2500, influence: 100 },
      bonusNeutral: { money: 500 },
      confirmLabel: 'Acknowledged',
      thresholdSuccess: 0.5,
      thresholdNeutral: 0.1,
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
