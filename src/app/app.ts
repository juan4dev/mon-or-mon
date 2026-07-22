import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Creature, CreatureUniverse } from './creature.model';
import { DigimonService } from './digimon.service';
import { PokemonService } from './pokemon.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly digimonService = inject(DigimonService);
  private readonly pokemonService = inject(PokemonService);

  protected readonly selectedUniverse = signal<CreatureUniverse | null>(null);
  protected readonly streak = signal(0);
  protected creature$ = this.getRandomCreature();

  protected answer(selectedUniverse: CreatureUniverse, correctUniverse: CreatureUniverse): void {
    if (this.selectedUniverse() === null) {
      this.selectedUniverse.set(selectedUniverse);
      this.streak.update((streak) => (selectedUniverse === correctUniverse ? streak + 1 : 0));
    }
  }

  protected nextCreature(): void {
    this.selectedUniverse.set(null);
    this.creature$ = this.getRandomCreature();
  }

  private getRandomCreature(): Observable<Creature> {
    return Math.random() < 0.5
      ? this.pokemonService.getRandomPokemon()
      : this.digimonService.getRandomDigimon();
  }
}
