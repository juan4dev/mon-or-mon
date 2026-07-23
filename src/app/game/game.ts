import { AsyncPipe, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { catchError, map, of, startWith, switchMap, timeout } from 'rxjs';
import type { Observable } from 'rxjs';

import { AnswerChoicesComponent } from './components/answer-choices/answer-choices';
import {
  CreatureCardComponent,
  type CreatureCardAction,
} from './components/creature-card/creature-card';
import { StreakDisplayComponent } from './components/streak-display/streak-display';
import { getRoundDifficulty } from './difficulty';
import type { Creature, CreatureUniverse } from './models/creature.model';
import type {
  RoundEffectDefinition,
  RoundEffectId,
  RoundEffectPhase,
} from './models/round-effect.model';
import { getEffectRecoverySeconds, selectRoundEffect } from './round-effects';
import { DigimonService } from './services/digimon.service';
import { PokemonService } from './services/pokemon.service';

type CreatureLoadState =
  | { status: 'idle'; creature: null }
  | { status: 'loading'; creature: null }
  | { status: 'ready'; creature: Creature }
  | { status: 'error'; creature: null };

@Component({
  selector: 'app-game',
  imports: [AsyncPipe, AnswerChoicesComponent, CreatureCardComponent, StreakDisplayComponent],
  templateUrl: './game.html',
  styleUrl: './game.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  private readonly digimonService = inject(DigimonService);
  private readonly pokemonService = inject(PokemonService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recentCreatureKeys = new Set<string>();
  private readonly recentCreatureLimit = 50;
  private readonly duplicateRetryLimit = 5;
  private readonly imageReplacementLimit = 2;
  private imageReplacementAttempts = 0;
  private lastRoundEffectId: RoundEffectId | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;

  protected readonly selectedUniverse = signal<CreatureUniverse | null>(null);
  protected readonly streak = signal(0);
  protected readonly lostStreak = signal(0);
  protected readonly imageReady = signal(false);
  protected readonly imageFailed = signal(false);
  protected readonly timedOut = signal(false);
  protected readonly hasStarted = signal(false);
  protected readonly roundEffect = signal<RoundEffectDefinition | null>(null);
  protected readonly bossRound = signal(false);
  protected readonly roundDurationSeconds = signal(10);
  protected readonly timeRemainingSeconds = signal(10);
  protected readonly timeRemainingPercentage = computed(
    () => (this.timeRemainingSeconds() / this.roundDurationSeconds()) * 100,
  );
  protected readonly effectPhase = computed<RoundEffectPhase>(() => {
    const effect = this.roundEffect();

    if (!effect || this.selectedUniverse() !== null || this.timedOut()) {
      return 'clear';
    }

    if (this.bossRound()) {
      return 'active';
    }

    const recoverySeconds = getEffectRecoverySeconds(effect.recovery, this.roundDurationSeconds());
    const timeRemainingSeconds = this.timeRemainingSeconds();

    if (timeRemainingSeconds <= recoverySeconds) {
      return 'clear';
    }

    return timeRemainingSeconds <= recoverySeconds + 1 ? 'weak' : 'active';
  });
  protected creatureState$: Observable<CreatureLoadState> = of({
    status: 'idle',
    creature: null,
  });

  constructor() {
    this.document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.stopTimer();
    });
  }

  protected answer(
    selectedUniverse: CreatureUniverse,
    creature: Creature | null | undefined,
  ): void {
    if (!creature || this.selectedUniverse() !== null || this.timedOut()) {
      return;
    }

    this.stopTimer();
    this.selectedUniverse.set(selectedUniverse);

    if (selectedUniverse === creature.universe) {
      this.streak.update((streak) => streak + 1);
    } else {
      this.lostStreak.set(this.streak());
      this.streak.set(0);
      this.lastRoundEffectId = null;
    }
  }

  protected nextCreature(): void {
    this.startRound();
  }

  protected startGame(): void {
    this.hasStarted.set(true);
    this.streak.set(0);
    this.lastRoundEffectId = null;
    this.startRound();
  }

  protected restartGame(): void {
    this.streak.set(0);
    this.lastRoundEffectId = null;
    this.startRound();
  }

  protected retryCreature(): void {
    this.startRound();
  }

  protected handleCardAction(action: CreatureCardAction): void {
    switch (action) {
      case 'start':
        this.startGame();
        break;
      case 'retry':
        this.retryCreature();
        break;
      case 'next':
        this.nextCreature();
        break;
      case 'restart':
        this.restartGame();
        break;
    }
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
      const roundNumber = this.streak() + 1;
      const roundDifficulty = getRoundDifficulty(roundNumber);
      const roundEffectSelection = selectRoundEffect(roundNumber, this.lastRoundEffectId);

      this.roundDurationSeconds.set(roundDifficulty.durationSeconds);
      this.roundEffect.set(roundEffectSelection.effect);
      this.bossRound.set(roundEffectSelection.isBossRound);
      this.lastRoundEffectId = roundEffectSelection.effect?.id ?? null;
    }

    this.timeRemainingSeconds.set(this.roundDurationSeconds());
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

  private startTimer(): void {
    if (
      !this.hasStarted() ||
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
    this.lastRoundEffectId = null;
    this.timedOut.set(true);
  }

  private readonly handleVisibilityChange = (): void => {
    if (this.document.hidden) {
      this.stopTimer();

      return;
    }

    if (this.hasStarted() && this.imageReady() && !this.imageFailed()) {
      this.startTimer();
    }
  };
}
