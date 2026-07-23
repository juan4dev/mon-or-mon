import type { RoundEffectId } from './models/round-effect.model';

export interface RoundDifficulty {
  minimumRound: number;
  durationSeconds: number;
  effectProbability: number;
  effectWeights: Partial<Record<RoundEffectId, number>>;
}

export const MAXIMUM_DIFFICULTY_ROUND = 30;

const ROUND_DIFFICULTIES: readonly RoundDifficulty[] = [
  {
    minimumRound: 1,
    durationSeconds: 10,
    effectProbability: 0,
    effectWeights: {},
  },
  {
    minimumRound: 5,
    durationSeconds: 9,
    effectProbability: 0.25,
    effectWeights: { 'rocket-hijack': 100 },
  },
  {
    minimumRound: 10,
    durationSeconds: 8,
    effectProbability: 0.45,
    effectWeights: { 'rocket-hijack': 60, 'static-jam': 40 },
  },
  {
    minimumRound: 15,
    durationSeconds: 7,
    effectProbability: 0.65,
    effectWeights: {
      'rocket-hijack': 30,
      'static-jam': 45,
      'digital-corruption': 25,
    },
  },
  {
    minimumRound: 20,
    durationSeconds: 6,
    effectProbability: 0.8,
    effectWeights: {
      'rocket-hijack': 15,
      'static-jam': 30,
      'digital-corruption': 35,
      'glitch-shift': 20,
    },
  },
  {
    minimumRound: 25,
    durationSeconds: 5,
    effectProbability: 0.9,
    effectWeights: {
      'rocket-hijack': 10,
      'static-jam': 20,
      'digital-corruption': 30,
      'glitch-shift': 25,
      'shadow-lock': 15,
    },
  },
  {
    minimumRound: MAXIMUM_DIFFICULTY_ROUND,
    durationSeconds: 5,
    effectProbability: 1,
    effectWeights: {
      'rocket-hijack': 5,
      'static-jam': 10,
      'digital-corruption': 20,
      'glitch-shift': 30,
      'shadow-lock': 35,
    },
  },
];

export function getRoundDifficulty(roundNumber: number): RoundDifficulty {
  for (let index = ROUND_DIFFICULTIES.length - 1; index >= 0; index -= 1) {
    if (roundNumber >= ROUND_DIFFICULTIES[index].minimumRound) {
      return ROUND_DIFFICULTIES[index];
    }
  }

  return ROUND_DIFFICULTIES[0];
}
