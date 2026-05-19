import { getSpecMultiplier } from './specializations';

/**
 * Canonical career-track data.
 *
 * - `label`: display name for the track
 * - `rankLabels`: tier name per rank (1–7)
 * - `rankFlavor`: a single sarcastic line per rank, shown in modals
 * - `rates`: per-currency multiplier applied at click/tick time on this track
 * - `endgame`: name + flavor for reaching rank 7
 */
export const CAREER_TRACKS = {
  faang: {
    label: 'FAANG',
    rankLabels: {
      1: 'L3 Software Engineer',
      2: 'L4 SWE II',
      3: 'L5 Senior',
      4: 'L6 Staff',
      5: 'L7 Principal',
      6: 'L8 Distinguished',
      7: 'Fellow',
    },
    rankFlavor: {
      1: 'Coffee badge tier. Your manager forgot your name in standup.',
      2: 'You ship without your senior\'s review. Sometimes.',
      3: 'Your impostor syndrome has gained a level.',
      4: 'You can use the word "leadership" on your resume. Slightly.',
      5: 'You started getting calendar invites without context.',
      6: 'Calibration committees now include you. You are now part of the problem.',
      7: 'Your name is a section in the engineering ladder doc.',
    },
    rates: {
      knowledge: 2,
      money: 5,
      research: 0.5,
      applications: 0.5,
      influence: 0.5,
      equity: 1,
    },
    endgame: {
      key: 'fellow',
      label: 'Distinguished Fellow',
    },
  },

  startup: {
    label: 'Startup',
    rankLabels: {
      1: 'Pre-seed Founder',
      2: 'Seed Round',
      3: 'Series A',
      4: 'Series B',
      5: 'Series C',
      6: 'Series D',
      7: 'IPO',
    },
    rankFlavor: {
      1: 'You and your cofounder share one MacBook.',
      2: 'You raised. The angel investors all have podcasts now.',
      3: 'TechCrunch noticed. Two recruiters from Octopus Inc. just DMed.',
      4: 'Your headcount doubled. The org chart is in Notion. Nobody updates it.',
      5: 'You hired a Chief of Staff. They run your calendar. They run your life.',
      6: 'An IPO banker bought you lunch. They ordered a salad.',
      7: 'The bell rang. Stock is up 12% on day one and down 30% by month three.',
    },
    rates: {
      knowledge: 1,
      money: 2,
      research: 0.5,
      applications: 0.5,
      influence: 2,
      equity: 5,
    },
    endgame: {
      key: 'exit',
      label: '$1B paper valuation',
    },
  },

  phd: {
    label: 'PhD',
    rankLabels: {
      1: 'First-year PhD',
      2: 'Candidate',
      3: 'Postdoc',
      4: 'Assistant Professor',
      5: 'Associate Professor',
      6: 'Full Professor',
      7: 'Named Chair',
    },
    rankFlavor: {
      1: 'Your advisor is now the smartest person you know. They are not impressed.',
      2: 'You passed quals. The relief lasts six hours.',
      3: 'Your advisor is now your "colleague." You still call them Dr. {LASTNAME}.',
      4: 'You have grad students. They have questions you cannot answer.',
      5: 'Tenured. You can finally say what you think. You don\'t.',
      6: 'You wrote the textbook. Sales of your textbook: 14 last quarter.',
      7: 'Three of your former students are now junior faculty.',
    },
    rates: {
      knowledge: 3,
      money: 0.5,
      research: 5,
      applications: 0.5,
      influence: 3,
      equity: 0,
    },
    endgame: {
      key: 'chair',
      label: 'The {Subject} Chair',
    },
  },

  upwork: {
    label: 'Upwork',
    rankLabels: {
      1: 'New Freelancer',
      2: 'Rising Talent',
      3: 'Top Rated',
      4: 'Top Rated Plus',
      5: 'Expert-Vetted',
      6: 'Agency Owner',
      7: 'Platform Influencer',
    },
    rankFlavor: {
      1: 'Your profile is up. Your photo is fine. Your bio mentions "passionate."',
      2: 'You\'ve completed five gigs. JSS is holding at 100. So far.',
      3: 'Top Rated badge unlocked. You feel an unearned superiority.',
      4: 'Top Rated Plus. You charge $5 more per hour. You feel rich. You are not.',
      5: 'Expert-Vetted. Upwork put your face on the marketing page. Without permission.',
      6: 'You hired subcontractors. You mark up their rates 30%. The cycle deepens.',
      7: 'Your course "How I Make $50K/Month on Upwork" hit r/Upworked.',
    },
    rates: {
      knowledge: 1,
      money: 1.5,
      research: 0.2,
      applications: 0.5,
      // Influence flips at rank 7 — handled specially in getTrackMultiplier.
      influence: 0.1,
      equity: 0,
    },
    endgame: {
      key: 'platform_influencer',
      label: 'Platform Influencer',
    },
  },
};

/**
 * Get the multiplier for a (track, currency) pair. Returns 1 if no track or unknown currency.
 *
 * Special case: Upwork rank-7 ("Platform Influencer") flips Influence from 0.1× to 4×
 * because the endgame mechanic is "sell courses." Checked at rate-lookup time.
 */
export function getTrackMultiplier(track, currency, rank) {
  if (!track || !CAREER_TRACKS[track]) return 1;
  if (track === 'upwork' && currency === 'influence' && rank === 7) {
    return 4;
  }
  return CAREER_TRACKS[track].rates[currency] ?? 1;
}

/**
 * Combined multiplier: track × specialization × influence allocation.
 *
 * Use this everywhere instead of `getTrackMultiplier` for click/tick math.
 * Components reading multipliers for display should also use this.
 */
export function getEffectiveMultiplier(state, currency) {
  const trackMult = getTrackMultiplier(state.career.currentTrack, currency, state.career.rank);
  const specMult = getSpecMultiplier(
    state.career.currentTrack,
    state.career.specialization?.id,
    currency,
  );
  const allocMult = getAllocMultiplier(state, currency);
  return trackMult * specMult * allocMult;
}

/**
 * Compute the Influence-allocation multiplier for a currency.
 *
 * - Only knowledge / money / research have buckets.
 * - Only unlocks at rank 3+.
 * - If total allocation exceeds current Influence (e.g., after losing Influence to an event),
 *   each bucket scales down proportionally so total effective ≤ current Influence.
 * - Formula: min(5, 1 + effective * 0.001). Capped at 5× when 4000+ Influence allocated.
 *
 * Tuning: 100 alloc → 1.1×, 500 → 1.5×, 1000 → 2×, 4000 → 5× (cap).
 */
export function getAllocMultiplier(state, currency) {
  if (state.stage !== 'career') return 1;
  if (state.career.rank < 3) return 1;
  if (!['knowledge', 'money', 'research'].includes(currency)) return 1;

  const alloc = state.career.influenceAllocation;
  const requested = alloc[currency] ?? 0;
  if (requested <= 0) return 1;

  const totalAllocated = (alloc.knowledge ?? 0) + (alloc.money ?? 0) + (alloc.research ?? 0);
  const currentInfluence = state.currencies.influence;

  let effective = requested;
  if (totalAllocated > currentInfluence && totalAllocated > 0) {
    const scale = currentInfluence / totalAllocated;
    effective *= scale;
  }

  return Math.min(5, 1 + effective * 0.001);
}
