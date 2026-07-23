export type CreatureUniverse = 'pokemon' | 'digimon';

export interface Creature {
  id: number;
  name: string;
  imageUrl: string;
  universe: CreatureUniverse;
}
