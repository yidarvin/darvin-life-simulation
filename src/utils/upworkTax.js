/**
 * The 10% platform tax that applies to all Money earnings on the Upwork track,
 * except course sales (which are deliberately excluded — see session 25).
 */

export const UPWORK_TAX_RATE = 0.10;

/**
 * Split a money-earning event into net + tax components.
 * Tax only applies when on the Upwork track.
 */
export function splitTax(grossAmount, isUpwork) {
  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    return { net: 0, tax: 0 };
  }
  if (!isUpwork) {
    return { net: grossAmount, tax: 0 };
  }
  const tax = grossAmount * UPWORK_TAX_RATE;
  return { net: grossAmount - tax, tax };
}

/**
 * Connects bundles available for purchase. Pricing is $0.15/Connect (bulk discount on 200-pack).
 */
export const CONNECT_BUNDLES = [
  { amount: 50, price: 7.5 },
  { amount: 200, price: 25 },
];

/**
 * Connects max balance.
 */
export const CONNECTS_CAP = 100;

/**
 * Cost to bid on a gig: randomly 10–16 Connects.
 */
export function getGigBidCost(rng = Math.random) {
  return 10 + Math.floor(rng() * 7);
}

/**
 * Gig outcome: 5–10% acceptance, $800–$1600 if accepted.
 */
export function rollGigOutcome(rng = Math.random) {
  const acceptanceRate = 0.05 + rng() * 0.05;
  const accepted = rng() < acceptanceRate;
  if (!accepted) return { accepted: false, gross: 0 };
  const gross = 800 + Math.floor(rng() * 800);
  return { accepted: true, gross };
}
