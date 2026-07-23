export type RoundEffectId =
  'rocket-hijack' | 'static-jam' | 'digital-corruption' | 'glitch-shift' | 'shadow-lock';

export type RoundEffectPhase = 'active' | 'weak' | 'clear';

export type RoundEffectRecovery = 'early' | 'half' | 'last-two' | 'last-one';

export interface RoundEffectDefinition {
  id: RoundEffectId;
  label: string;
  prompt: string;
  recovery: RoundEffectRecovery;
}
