export type RoundEffectId =
  'rocket-hijack' | 'static-jam' | 'digital-corruption' | 'glitch-shift' | 'shadow-lock';

export type RoundEffectPhase = 'active' | 'weak' | 'clear';

export type RoundEffectRecovery = 'early' | 'half' | 'late' | 'last-three';

export interface RoundEffectDefinition {
  id: RoundEffectId;
  label: string;
  minimumStreak: number;
  prompt: string;
  recovery: RoundEffectRecovery;
}
