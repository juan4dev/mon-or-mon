import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
  protected readonly lostStreak = signal(0);
  protected readonly streakHue = computed(() => {
    const progress = Math.min(this.streak() / 50, 1);

    return Math.round(120 * (1 - progress));
  });
  protected creature$ = this.getRandomCreature();

  protected answer(selectedUniverse: CreatureUniverse, correctUniverse: CreatureUniverse): void {
    if (this.selectedUniverse() === null) {
      this.selectedUniverse.set(selectedUniverse);

      if (selectedUniverse === correctUniverse) {
        this.streak.update((streak) => streak + 1);
      } else {
        this.lostStreak.set(this.streak());
        this.streak.set(0);
      }
    }
  }

  protected nextCreature(): void {
    this.startRound();
  }

  protected restartGame(): void {
    this.streak.set(0);
    this.startRound();
  }

  private startRound(): void {
    this.selectedUniverse.set(null);
    this.lostStreak.set(0);
    this.creature$ = this.getRandomCreature();
  }

  private getRandomCreature(): Observable<Creature> {
    return Math.random() < 0.5
      ? this.pokemonService.getRandomPokemon()
      : this.digimonService.getRandomDigimon();
  }
}
