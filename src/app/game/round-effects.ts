import type {
  RoundEffectDefinition,
  RoundEffectId,
  RoundEffectRecovery,
} from './models/round-effect.model';

interface EffectWeight {
  effect: RoundEffectDefinition;
  weight: number;
}

interface EffectBand {
  minimumStreak: number;
  probability: number;
  weights: Partial<Record<RoundEffectId, number>>;
}

export interface RoundEffectSelection {
  effect: RoundEffectDefinition | null;
  isBossRound: boolean;
}

const ROUND_EFFECTS: readonly RoundEffectDefinition[] = [
  {
    id: 'rocket-hijack',
    label: 'Rocket Hijack',
    minimumStreak: 3,
    prompt: 'A foreign scan is distorting the image.',
    recovery: 'early',
  },
  {
    id: 'static-jam',
    label: 'Static Jam',
    minimumStreak: 5,
    prompt: 'Guess now or wait for the scan.',
    recovery: 'half',
  },
  {
    id: 'digital-corruption',
    label: 'Digital Corruption',
    minimumStreak: 10,
    prompt: 'Read the remaining data or wait.',
    recovery: 'late',
  },
  {
    id: 'glitch-shift',
    label: 'Glitch Shift',
    minimumStreak: 15,
    prompt: 'Image sectors have been displaced.',
    recovery: 'last-three',
  },
  {
    id: 'shadow-lock',
    label: 'Shadow Lock',
    minimumStreak: 20,
    prompt: 'Trust the silhouette or wait.',
    recovery: 'last-three',
  },
];

const EFFECT_BANDS: readonly EffectBand[] = [
  {
    minimumStreak: 3,
    probability: 0.2,
    weights: { 'rocket-hijack': 100 },
  },
  {
    minimumStreak: 5,
    probability: 0.35,
    weights: { 'rocket-hijack': 60, 'static-jam': 40 },
  },
  {
    minimumStreak: 10,
    probability: 0.5,
    weights: {
      'rocket-hijack': 30,
      'static-jam': 45,
      'digital-corruption': 25,
    },
  },
  {
    minimumStreak: 15,
    probability: 0.6,
    weights: {
      'rocket-hijack': 15,
      'static-jam': 30,
      'digital-corruption': 35,
      'glitch-shift': 20,
    },
  },
  {
    minimumStreak: 20,
    probability: 0.7,
    weights: {
      'rocket-hijack': 10,
      'static-jam': 20,
      'digital-corruption': 30,
      'glitch-shift': 25,
      'shadow-lock': 15,
    },
  },
  {
    minimumStreak: 25,
    probability: 0.75,
    weights: {
      'rocket-hijack': 5,
      'static-jam': 10,
      'digital-corruption': 20,
      'glitch-shift': 30,
      'shadow-lock': 35,
    },
  },
];

export function selectRoundEffect(
  streak: number,
  previousEffectId: RoundEffectId | null,
  random: () => number = Math.random,
): RoundEffectSelection {
  const isBossRound = streak > 0 && streak % 5 === 0;
  const unlockedEffects = ROUND_EFFECTS.filter((effect) => streak >= effect.minimumStreak);

  if (unlockedEffects.length === 0) {
    return { effect: null, isBossRound: false };
  }

  const weightedEffects = isBossRound
    ? getBossWeights(unlockedEffects)
    : getRegularWeights(streak, unlockedEffects, random);

  if (weightedEffects.length === 0) {
    return { effect: null, isBossRound: false };
  }

  const variedEffects =
    previousEffectId !== null && weightedEffects.length > 1
      ? weightedEffects.filter(({ effect }) => effect.id !== previousEffectId)
      : weightedEffects;

  return {
    effect: pickWeightedEffect(variedEffects, random),
    isBossRound,
  };
}

export function getEffectRecoverySeconds(
  recovery: RoundEffectRecovery,
  durationSeconds: number,
): number {
  switch (recovery) {
    case 'early':
      return Math.max(3, durationSeconds - 2);
    case 'half':
      return Math.max(3, Math.ceil(durationSeconds / 2));
    case 'late':
      return Math.max(3, Math.ceil(durationSeconds * 0.45));
    case 'last-three':
      return 3;
  }
}

function getBossWeights(unlockedEffects: readonly RoundEffectDefinition[]): EffectWeight[] {
  const hardestEffects = unlockedEffects.slice(-2);

  return hardestEffects.map((effect, index) => ({
    effect,
    weight: hardestEffects.length === 1 || index === 1 ? 70 : 30,
  }));
}

function getRegularWeights(
  streak: number,
  unlockedEffects: readonly RoundEffectDefinition[],
  random: () => number,
): EffectWeight[] {
  const band = getEffectBand(streak);

  if (!band || random() >= band.probability) {
    return [];
  }

  return unlockedEffects
    .map((effect) => ({ effect, weight: band.weights[effect.id] ?? 0 }))
    .filter(({ weight }) => weight > 0);
}

function getEffectBand(streak: number): EffectBand | null {
  for (let index = EFFECT_BANDS.length - 1; index >= 0; index -= 1) {
    if (streak >= EFFECT_BANDS[index].minimumStreak) {
      return EFFECT_BANDS[index];
    }
  }

  return null;
}

function pickWeightedEffect(
  weightedEffects: readonly EffectWeight[],
  random: () => number,
): RoundEffectDefinition {
  const totalWeight = weightedEffects.reduce((total, { weight }) => total + weight, 0);
  const targetWeight = random() * totalWeight;
  let accumulatedWeight = 0;

  for (const weightedEffect of weightedEffects) {
    accumulatedWeight += weightedEffect.weight;

    if (targetWeight < accumulatedWeight) {
      return weightedEffect.effect;
    }
  }

  return weightedEffects[weightedEffects.length - 1].effect;
}
