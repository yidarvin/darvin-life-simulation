/**
 * Companies that can offer an internship. One is picked randomly on internship offer.
 */
export const INTERNSHIP_COMPANIES = [
  { id: 'datamesh',     name: 'DataMesh Industries', flavor: "Series C. Their pitch deck mentions 'AI' 27 times." },
  { id: 'octopus',      name: 'Octopus Inc.',         flavor: 'FAANG-adjacent. Famously bad coffee.' },
  { id: 'reverberate',  name: 'Reverberate AI',       flavor: 'Pre-seed. The founder DMed you on LinkedIn.' },
  { id: 'quantworth',   name: 'Quantworth Capital',   flavor: 'Quant. They asked you about polar bears in the interview.' },
  { id: 'sigmoid',      name: 'Sigmoid Labs',         flavor: 'Research-y. The team has 4 PhDs and one TPM with vibes.' },
  { id: 'ledger',       name: 'Ledger Run',           flavor: 'Fintech. They have a foosball table. They use it.' },
];

export function pickRandomCompany(rng = Math.random) {
  const i = Math.floor(rng() * INTERNSHIP_COMPANIES.length);
  return INTERNSHIP_COMPANIES[i];
}
