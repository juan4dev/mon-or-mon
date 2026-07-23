import type {
  RoundEffectDefinition,
  RoundEffectId,
  RoundEffectRecovery,
} from './models/round-effect.model';
import { getRoundDifficulty, type RoundDifficulty } from './difficulty';

interface EffectWeight {
  effect: RoundEffectDefinition;
  weight: number;
}

export interface RoundEffectSelection {
  effect: RoundEffectDefinition | null;
  isBossRound: boolean;
}

const ROUND_EFFECTS: readonly RoundEffectDefinition[] = [
  {
    id: 'rocket-hijack',
    label: 'Rocket Hijack',
    prompt: 'A foreign scan is distorting the image.',
    recovery: 'early',
  },
  {
    id: 'static-jam',
    label: 'Static Jam',
    prompt: 'Guess now or wait for the scan.',
    recovery: 'half',
  },
  {
    id: 'digital-corruption',
    label: 'Digital Corruption',
    prompt: 'Read the remaining data or wait.',
    recovery: 'last-two',
  },
  {
    id: 'glitch-shift',
    label: 'Glitch Shift',
    prompt: 'Image sectors have been displaced.',
    recovery: 'last-one',
  },
  {
    id: 'shadow-lock',
    label: 'Shadow Lock',
    prompt: 'Trust the silhouette or wait.',
    recovery: 'last-one',
  },
];

export function selectRoundEffect(
  roundNumber: number,
  previousEffectId: RoundEffectId | null,
  random: () => number = Math.random,
): RoundEffectSelection {
  const difficulty = getRoundDifficulty(roundNumber);
  const isBossRound = roundNumber >= 5 && roundNumber % 5 === 0;
  const unlockedEffects = ROUND_EFFECTS.filter(
    (effect) => (difficulty.effectWeights[effect.id] ?? 0) > 0,
  );

  if (unlockedEffects.length === 0) {
    return { effect: null, isBossRound: false };
  }

  if (isBossRound) {
    return {
      effect: pickWeightedEffect(getBossWeights(unlockedEffects), random),
      isBossRound: true,
    };
  }

  const weightedEffects = getRegularWeights(difficulty, unlockedEffects, random);
  if (weightedEffects.length === 0) {
    return { effect: null, isBossRound: false };
  }

  const variedEffects =
    previousEffectId !== null && weightedEffects.length > 1
      ? weightedEffects.filter(({ effect }) => effect.id !== previousEffectId)
      : weightedEffects;

  return {
    effect: pickWeightedEffect(variedEffects, random),
    isBossRound: false,
  };
}

export function getEffectRecoverySeconds(
  recovery: RoundEffectRecovery,
  durationSeconds: number,
): number {
  switch (recovery) {
    case 'early':
      return Math.max(1, durationSeconds - 2);
    case 'half':
      return Math.max(1, Math.ceil(durationSeconds / 2));
    case 'last-two':
      return 2;
    case 'last-one':
      return 1;
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
  difficulty: RoundDifficulty,
  unlockedEffects: readonly RoundEffectDefinition[],
  random: () => number,
): EffectWeight[] {
  if (random() >= difficulty.effectProbability) {
    return [];
  }

  return unlockedEffects
    .map((effect) => ({ effect, weight: difficulty.effectWeights[effect.id] ?? 0 }))
    .filter(({ weight }) => weight > 0);
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
