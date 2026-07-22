import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { catchError, map, of, startWith, timeout } from 'rxjs';
import type { Observable } from 'rxjs';

import type { Creature, CreatureUniverse } from './creature.model';
import { DigimonService } from './digimon.service';
import { PokemonService } from './pokemon.service';

type CreatureLoadState =
  | { status: 'loading'; creature: null }
  | { status: 'ready'; creature: Creature }
  | { status: 'error'; creature: null };

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
  protected readonly imageReady = signal(false);
  protected readonly imageFailed = signal(false);
  protected readonly streakHue = computed(() => {
    const progress = Math.min(this.streak() / 50, 1);

    return Math.round(120 * (1 - progress));
  });
  protected creatureState$ = this.loadCreature();

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

  protected retryCreature(): void {
    this.startRound();
  }

  protected handleImageLoad(): void {
    this.imageReady.set(true);
  }

  protected handleImageError(): void {
    this.imageReady.set(false);
    this.imageFailed.set(true);
  }

  private startRound(): void {
    this.selectedUniverse.set(null);
    this.lostStreak.set(0);
    this.imageReady.set(false);
    this.imageFailed.set(false);
    this.creatureState$ = this.loadCreature();
  }

  private loadCreature(): Observable<CreatureLoadState> {
    return this.getRandomCreature().pipe(
      timeout({ first: 12_000 }),
      map((creature): CreatureLoadState => ({ status: 'ready', creature })),
      startWith({ status: 'loading', creature: null } as const),
      catchError(() => of({ status: 'error', creature: null } as const)),
    );
  }

  private getRandomCreature(): Observable<Creature> {
    return Math.random() < 0.5
      ? this.pokemonService.getRandomPokemon()
      : this.digimonService.getRandomDigimon();
  }
}
