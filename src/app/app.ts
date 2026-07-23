import { AsyncPipe, DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { catchError, map, of, startWith, switchMap, timeout } from 'rxjs';
import type { Observable } from 'rxjs';

import type { Creature, CreatureUniverse } from './creature.model';
import { DigimonService } from './digimon.service';
import { PokemonService } from './pokemon.service';
import { RoundTimerComponent } from './round-timer/round-timer';

type CreatureLoadState =
  | { status: 'loading'; creature: null }
  | { status: 'ready'; creature: Creature }
  | { status: 'error'; creature: null };

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, RoundTimerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly digimonService = inject(DigimonService);
  private readonly pokemonService = inject(PokemonService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recentCreatureKeys = new Set<string>();
  private readonly recentCreatureLimit = 50;
  private readonly duplicateRetryLimit = 5;
  private readonly imageReplacementLimit = 2;
  private imageReplacementAttempts = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;

  protected readonly selectedUniverse = signal<CreatureUniverse | null>(null);
  protected readonly streak = signal(0);
  protected readonly lostStreak = signal(0);
  protected readonly imageReady = signal(false);
  protected readonly imageFailed = signal(false);
  protected readonly timedOut = signal(false);
  private readonly roundDurationSeconds = signal(10);
  protected readonly timeRemainingSeconds = signal(10);
  protected readonly timeRemainingPercentage = computed(
    () => (this.timeRemainingSeconds() / this.roundDurationSeconds()) * 100,
  );
  protected readonly streakHue = computed(() => {
    const progress = Math.min(this.streak() / 50, 1);

    return Math.round(120 * (1 - progress));
  });
  protected creatureState$ = this.loadCreature();

  constructor() {
    this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.stopTimer();
    });
  }

  protected answer(selectedUniverse: CreatureUniverse, correctUniverse: CreatureUniverse): void {
    if (this.selectedUniverse() === null && !this.timedOut()) {
      this.stopTimer();
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
    this.imageReplacementAttempts = 0;
    this.imageReady.set(true);
    this.startTimer();
  }

  protected handleImageError(): void {
    this.stopTimer();
    this.imageReady.set(false);

    if (this.imageReplacementAttempts < this.imageReplacementLimit) {
      this.imageReplacementAttempts += 1;
      this.startRound(false);

      return;
    }

    this.imageFailed.set(true);
  }

  private startRound(resetImageReplacementAttempts = true): void {
    this.stopTimer();

    if (resetImageReplacementAttempts) {
      this.imageReplacementAttempts = 0;
    }

    const roundDurationSeconds = this.getRoundDurationSeconds();

    this.roundDurationSeconds.set(roundDurationSeconds);
    this.timeRemainingSeconds.set(roundDurationSeconds);
    this.selectedUniverse.set(null);
    this.timedOut.set(false);
    this.lostStreak.set(0);
    this.imageReady.set(false);
    this.imageFailed.set(false);
    this.creatureState$ = this.loadCreature();
  }

  private loadCreature(): Observable<CreatureLoadState> {
    return this.getUniqueRandomCreature().pipe(
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

  private getUniqueRandomCreature(retriesLeft = this.duplicateRetryLimit): Observable<Creature> {
    return this.getRandomCreature().pipe(
      switchMap((creature) => {
        const key = `${creature.universe}:${creature.id}`;

        if (retriesLeft > 0 && this.recentCreatureKeys.has(key)) {
          return this.getUniqueRandomCreature(retriesLeft - 1);
        }

        this.rememberCreature(key);

        return of(creature);
      }),
    );
  }

  private rememberCreature(key: string): void {
    this.recentCreatureKeys.delete(key);
    this.recentCreatureKeys.add(key);

    if (this.recentCreatureKeys.size > this.recentCreatureLimit) {
      const oldestKey = this.recentCreatureKeys.values().next().value;

      if (oldestKey) {
        this.recentCreatureKeys.delete(oldestKey);
      }
    }
  }

  private getRoundDurationSeconds(): number {
    const streak = this.streak();

    if (streak >= 35) {
      return 6;
    }

    if (streak >= 20) {
      return 7;
    }

    if (streak >= 10) {
      return 8;
    }

    if (streak >= 5) {
      return 9;
    }

    return 10;
  }

  private startTimer(): void {
    if (
      this.document.hidden ||
      this.timeRemainingSeconds() <= 0 ||
      this.selectedUniverse() !== null ||
      this.timedOut()
    ) {
      return;
    }

    this.stopTimer();
    this.timerId = setInterval(() => {
      const timeRemainingSeconds = Math.max(0, this.timeRemainingSeconds() - 1);

      this.timeRemainingSeconds.set(timeRemainingSeconds);

      if (timeRemainingSeconds === 0) {
        this.finishRoundByTimeout();
      }
    }, 1_000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private finishRoundByTimeout(): void {
    if (this.selectedUniverse() !== null || this.timedOut()) {
      return;
    }

    this.stopTimer();
    this.timeRemainingSeconds.set(0);
    this.lostStreak.set(this.streak());
    this.streak.set(0);
    this.timedOut.set(true);
  }

  private readonly handleVisibilityChange = (): void => {
    if (this.document.hidden) {
      this.stopTimer();

      return;
    }

    if (this.imageReady() && !this.imageFailed()) {
      this.startTimer();
    }
  };
}
