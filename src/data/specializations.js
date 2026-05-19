/**
 * Specialization options, 3 per track. One-time choice at rank 1. Resets on track swap.
 * Each option boosts ONE currency by `multiplier` (default 1.2 = +20%).
 */
export const SPECIALIZATIONS = {
  faang: [
    {
      id: 'backend',
      label: 'Backend',
      flavor:
        'You will become known for the time you saved the team from a redis outage at 3am. Promotion delayed by six months for unclear reasons.',
      effect: { currency: 'money', multiplier: 1.2 },
    },
    {
      id: 'frontend',
      label: 'Frontend',
      flavor:
        'You will fight with the design team about pixel placement. You will lose. You will accept it.',
      effect: { currency: 'knowledge', multiplier: 1.2 },
    },
    {
      id: 'ml',
      label: 'ML',
      flavor:
        'You will reuse the same notebook for three years. It will become unmaintainable. You will become indispensable.',
      effect: { currency: 'research', multiplier: 1.2 },
    },
  ],

  startup: [
    {
      id: 'b2b_saas',
      label: 'B2B SaaS',
      flavor:
        'Your customers are CFOs. They want a spreadsheet export. Always.',
      effect: { currency: 'money', multiplier: 1.2 },
    },
    {
      id: 'b2c',
      label: 'B2C',
      flavor:
        "Your users have 47-character email addresses. Half are bots. You can't tell which half.",
      effect: { currency: 'influence', multiplier: 1.2 },
    },
    {
      id: 'deeptech',
      label: 'DeepTech',
      flavor:
        'You sell to enterprises with 18-month sales cycles. You raise on patents.',
      effect: { currency: 'research', multiplier: 1.2 },
    },
  ],

  phd: [
    {
      id: 'theory',
      label: 'Theory',
      flavor:
        'You will derive bounds. The bounds will be tight. Three people in the world will care.',
      effect: { currency: 'research', multiplier: 1.2 },
    },
    {
      id: 'applied',
      label: 'Applied',
      flavor:
        "You will build systems that work. Reviewers will call them 'engineering.' You will be hurt.",
      effect: { currency: 'knowledge', multiplier: 1.2 },
    },
    {
      id: 'interdisciplinary',
      label: 'Interdisciplinary',
      flavor:
        "You will collaborate across departments. Your CV will say 'cross-cutting.' Your hiring committee will not know what to do with you.",
      effect: { currency: 'influence', multiplier: 1.2 },
    },
  ],

  upwork: [
    {
      id: 'wordpress',
      label: 'WordPress themes',
      flavor:
        "You will explain to clients that yes you can fix it, no it's not 'just' a quick change.",
      effect: { currency: 'money', multiplier: 1.2 },
    },
    {
      id: 'logo_design',
      label: 'Logo design (undercutting graphic designers)',
      flavor:
        'Your competitive advantage is being faster and cheaper than people who went to design school.',
      effect: { currency: 'knowledge', multiplier: 1.2 },
    },
    {
      id: 'ai_agents',
      label: 'AI agents',
      flavor:
        'Clients have no idea what they want. You have no idea what they want. The deliverable is whatever you ship.',
      effect: { currency: 'influence', multiplier: 1.2 },
    },
  ],
};

/**
 * Lookup specialization data by track + id.
 */
export function getSpec(track, specId) {
  if (!track || !specId) return null;
  return SPECIALIZATIONS[track]?.find((s) => s.id === specId) ?? null;
}

/**
 * Returns the multiplier for a (track, specId, currency) tuple.
 * Returns 1 if specialization doesn't match the queried currency.
 */
export function getSpecMultiplier(track, specId, currency) {
  const spec = getSpec(track, specId);
  if (!spec) return 1;
  if (spec.effect.currency !== currency) return 1;
  return spec.effect.multiplier;
}
