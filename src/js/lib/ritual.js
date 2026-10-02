// /src/js/lib/ritual.js
// Pure, deterministic matching logic for skin ritual formulation

import { products } from '../../data/products.js';
import { ingredients } from '../../data/ingredients.js';

export const QUESTION_DEFINITIONS = [
  {
    id: 'q1',
    number: '01',
    title: 'How does your skin feel by',
    accentWord: 'midday?',
    answers: [
      { id: 'DRY', title: 'Dry or Tight', hint: 'Craving continuous hydration & rich lipids', art: 'eucalyptus' },
      { id: 'BALANCED', title: 'Balanced & Steady', hint: 'Comfortable with even barrier retention', art: 'oliveTwig' },
      { id: 'SHINY', title: 'Shiny or Congested', hint: 'Excess sebum across T-zone and forehead', art: 'monsteraPiece' },
      { id: 'EASILY_IRRITATED', title: 'Easily Irritated', hint: 'Prone to sudden flushing, redness, or heat', art: 'singlePetal' }
    ]
  },
  {
    id: 'q2',
    number: '02',
    title: 'What would you prioritize',
    accentWord: 'first?',
    answers: [
      { id: 'HYDRATION', title: 'Deep Hydration', hint: 'Plump water reserves down to cellular layers', art: 'fern' },
      { id: 'CALM', title: 'Soothe & Pacify', hint: 'Quiet chronic inflammation and reactive redness', art: 'singlePetal' },
      { id: 'GLOW', title: 'Luminous Glow', hint: 'Buff away dull surface oxidation & fatigue', art: 'rosemarySprig' },
      { id: 'BARRIER', title: 'Barrier Shielding', hint: 'Reinforce lipid bilayers against climate loss', art: 'oliveTwig' }
    ]
  },
  {
    id: 'q3',
    number: '03',
    title: 'How much time do you give your',
    accentWord: 'mornings?',
    answers: [
      { id: '2_MIN', title: '2 Minutes', hint: 'A swift, distilled 2-step essentials routine', art: 'singlePetal', stepCount: 2 },
      { id: '5_MIN', title: '5 Minutes', hint: 'A balanced 3-step ritual of cleanse, feed & seal', art: 'eucalyptus', stepCount: 3 },
      { id: '10_MIN', title: '10 Minutes', hint: 'A complete 4-step sensory botanical immersion', art: 'fern', stepCount: 4 },
      { id: 'AS_LONG', title: 'As Long As Needed', hint: 'An unhurried ritual with mist layering', art: 'monsteraPiece', stepCount: 4 }
    ]
  },
  {
    id: 'q4',
    number: '04',
    title: 'What is the weather like where you',
    accentWord: 'live?',
    answers: [
      { id: 'HUMID', title: 'Humid & Tropical', hint: 'Heavy air, high moisture, moisture prone', art: 'monsteraPiece' },
      { id: 'DRY', title: 'Arid & Dry', hint: 'Desert winds, high evaporation, dry interiors', art: 'oliveTwig' },
      { id: 'COLD', title: 'Cold & Windblown', hint: 'Sub-zero temperatures and biting breezes', art: 'fern' },
      { id: 'VARIABLE', title: 'All of it / Variable', hint: 'Shifting seasons with dramatic climate swings', art: 'rosemarySprig' }
    ]
  },
  {
    id: 'q5',
    number: '05',
    title: 'How do you feel about natural',
    accentWord: 'scent?',
    answers: [
      { id: 'LOVE', title: 'Love It', hint: 'Aromatics derived strictly from steam flower waters', art: 'singlePetal' },
      { id: 'LIGHT', title: 'Light Botanical', hint: 'Subtle green whisper that dissipates on contact', art: 'eucalyptus' },
      { id: 'NONE', title: 'None Please', hint: 'Zero volatile oils, 100% unscented pure base', art: 'oliveTwig' },
      { id: 'SURPRISE', title: 'Surprise Me', hint: 'Earthy, wild moss and resin notes welcome', art: 'rosemarySprig' }
    ]
  }
];

/**
 * Computes a personalized skincare ritual from the 5 quiz answers.
 * Returns: { title, steps, topIngredients, matchScore, note, subtotal, discount, total }
 */
export function computeRitual(answers = {}) {
  const q1 = answers.q1 || 'BALANCED';
  const q2 = answers.q2 || 'HYDRATION';
  const q3 = answers.q3 || '5_MIN';
  const q4 = answers.q4 || 'VARIABLE';
  const q5 = answers.q5 || 'LIGHT';

  // 1. Determine Step Count
  let stepCount = 3;
  if (q3 === '2_MIN') stepCount = 2;
  else if (q3 === '5_MIN') stepCount = 3;
  else stepCount = 4;

  const isOilyOrShiny = q1 === 'SHINY';

  // 2. Map Products
  // cleanser = Clay Cleanser, serum = Dew Serum, cream = Moss Cream, mist = Petal Mist
  const cleanser = products.find(p => p.id === 'clay-cleanser');
  const serum = products.find(p => p.id === 'dew-serum');
  const cream = products.find(p => p.id === 'moss-cream');
  const mist = products.find(p => p.id === 'petal-mist');

  // Build AM Steps
  let amList = [];
  if (stepCount === 2) {
    if (isOilyOrShiny) {
      amList = [
        { product: cleanser, instruction: 'Gently massage onto damp skin and rinse with tepid water.', wait: '30 sec' },
        { product: serum, instruction: 'Press 3 drops into freshly purified skin until dewy.', wait: 'absorbed' }
      ];
    } else {
      amList = [
        { product: serum, instruction: 'Warm 3 drops between palms and gently press upward.', wait: '30 sec' },
        { product: cream, instruction: 'Smooth a pea-sized amount to lock in vital morning lipids.', wait: 'absorbed' }
      ];
    }
  } else if (stepCount === 3) {
    amList = [
      { product: cleanser, instruction: 'Cleanse gently with circular upward motions.', wait: '30 sec' },
      { product: serum, instruction: 'Apply 3 drops of deep hydration concentrate.', wait: '45 sec' },
      { product: cream, instruction: 'Seal the moisture reservoir with barrier cream.', wait: 'absorbed' }
    ];
  } else {
    // 4 steps
    amList = [
      { product: cleanser, instruction: 'Purify with cold-milled oatmeal emulsion.', wait: '30 sec' },
      { product: serum, instruction: 'Quench skin with multi-depth mushroom polysaccharides.', wait: '45 sec' },
      { product: cream, instruction: 'Cushion the skin barrier against daily oxidative stress.', wait: '60 sec' },
      { product: mist, instruction: 'Mist generously over face and neck for a dewy veil.', wait: 'refresh' }
    ];
  }

  // Build PM Steps (cleanse, serum, cream)
  let pmList = [];
  if (stepCount === 2) {
    pmList = [
      { product: cleanser, instruction: 'Dissolve daily urban accumulation and environmental debris.', wait: '45 sec' },
      { product: isOilyOrShiny ? serum : cream, instruction: 'Nurture lipid restoration during peak overnight recovery.', wait: 'absorbed' }
    ];
  } else {
    pmList = [
      { product: cleanser, instruction: 'Rinse away daily buildup with unhurried care.', wait: '45 sec' },
      { product: serum, instruction: 'Pat deep moisture concentrate into relaxed skin.', wait: '45 sec' },
      { product: cream, instruction: 'Cocoon delicate cells with restorative sub-arctic lichens.', wait: 'absorbed' }
    ];
  }

  // 3. Rank Ingredients from ingredients.js
  // Concern scoring weights: primary concern = 3, secondary concern from Q1 = 2, climate bonus = 1
  const concernScores = {
    HYDRATION: q2 === 'HYDRATION' ? 3 : 0,
    CALM: q2 === 'CALM' ? 3 : 0,
    GLOW: q2 === 'GLOW' ? 3 : 0,
    BARRIER: q2 === 'BARRIER' ? 3 : 0
  };

  if (q1 === 'DRY') {
    concernScores.BARRIER += 2;
    concernScores.HYDRATION += 1;
  } else if (q1 === 'EASILY_IRRITATED') {
    concernScores.CALM += 2;
    concernScores.BARRIER += 1;
  } else if (q1 === 'SHINY') {
    concernScores.CALM += 1;
    concernScores.GLOW += 1;
  }

  if (q4 === 'DRY' || q4 === 'COLD') {
    concernScores.BARRIER += 1;
    concernScores.HYDRATION += 1;
  } else if (q4 === 'HUMID') {
    concernScores.CALM += 1;
  }

  // Calculate score for each ingredient
  const scoredIngredients = ingredients.map(ing => {
    let score = 0;
    ing.concerns.forEach(c => {
      score += (concernScores[c] || 0) * 1.5;
    });
    score += (ing.percent / 100) * 2;
    return { ingredient: ing, score };
  });

  scoredIngredients.sort((a, b) => b.score - a.score);
  const topThree = scoredIngredients.slice(0, 3).map(s => s.ingredient);

  // Compute Match Score (between 72% and 98%)
  const rawScore = scoredIngredients.slice(0, 3).reduce((acc, curr) => acc + curr.score, 0);
  const matchScore = Math.min(98, Math.max(72, Math.round(72 + (rawScore * 1.35))));

  // Scent note
  let note = '';
  if (q5 === 'NONE') {
    note = 'Fragrance-free botanical formulations with zero volatile essences.';
  } else {
    note = `Subtle aromatic profile carried by cold-macerated ${topThree[0].name.toLowerCase()} extracts.`;
  }

  // Ritual Title based on primary concerns
  let title = 'The Deep Botanical Hydration Ritual';
  if (q2 === 'CALM' || q1 === 'EASILY_IRRITATED') {
    title = 'The Calm Barrier Shield Ritual';
  } else if (q2 === 'GLOW') {
    title = 'The Radiant Botanical Renewal Ritual';
  } else if (q2 === 'BARRIER' || q1 === 'DRY') {
    title = 'The Restorative Lipid Cocoon Ritual';
  }

  // Price & Bundle Calculation
  const uniqueProducts = Array.from(new Set([...amList.map(s => s.product), ...pmList.map(s => s.product)]));
  const subtotal = uniqueProducts.reduce((acc, p) => acc + p.price, 0);
  const discount = Math.round(subtotal * 0.1);
  const total = subtotal - discount;

  return {
    title,
    steps: { am: amList, pm: pmList },
    topIngredients: topThree,
    matchScore,
    note,
    subtotal,
    discount,
    total,
    products: uniqueProducts
  };
}

// Dev-only deterministic verification assertion
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const testA = computeRitual({ q1: 'DRY', q2: 'CALM', q3: '5_MIN', q4: 'COLD', q5: 'LIGHT' });
  const testB = computeRitual({ q1: 'DRY', q2: 'CALM', q3: '5_MIN', q4: 'COLD', q5: 'LIGHT' });
  console.assert(
    testA.title === testB.title && testA.matchScore === testB.matchScore && testA.total === testB.total,
    '[Ritual Matching] Assertion Failed: computeRitual must be purely deterministic.'
  );
}
