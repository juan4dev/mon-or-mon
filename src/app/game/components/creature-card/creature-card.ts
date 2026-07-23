import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { Creature, CreatureUniverse } from '../../models/creature.model';
import { GameFeedbackComponent } from '../game-feedback/game-feedback';
import { RoundTimerComponent } from '../round-timer/round-timer';

export type CreatureCardAction = 'start' | 'retry' | 'next' | 'restart';

interface CreatureCardOverlayAction {
  label: string;
  type: CreatureCardAction;
}

@Component({
  selector: 'app-creature-card',
  imports: [GameFeedbackComponent, RoundTimerComponent],
  templateUrl: './creature-card.html',
  styleUrl: './creature-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatureCardComponent {
  readonly started = input.required<boolean>();
  readonly creature = input<Creature | null>(null);
  readonly imageReady = input.required<boolean>();
  readonly unavailable = input.required<boolean>();
  readonly loading = input.required<boolean>();
  readonly selectedUniverse = input<CreatureUniverse | null>(null);
  readonly timedOut = input.required<boolean>();
  readonly lostStreak = input.required<number>();
  readonly seconds = input.required<number>();
  readonly percentage = input.required<number>();

  readonly imageLoaded = output<void>();
  readonly imageFailed = output<void>();
  readonly actionRequested = output<CreatureCardAction>();

  protected readonly isCorrect = computed(
    () => this.selectedUniverse() !== null && this.selectedUniverse() === this.creature()?.universe,
  );
  protected readonly isIncorrect = computed(
    () =>
      this.timedOut() ||
      (this.selectedUniverse() !== null && this.selectedUniverse() !== this.creature()?.universe),
  );
  protected readonly isLoading = computed(
    () => this.started() && !this.unavailable() && this.loading(),
  );
  protected readonly overlayAction = computed<CreatureCardOverlayAction | null>(() => {
    if (!this.started()) {
      return { label: 'Start game', type: 'start' };
    }

    if (this.unavailable()) {
      return { label: 'Try again', type: 'retry' };
    }

    if (this.timedOut()) {
      return { label: 'Restart game', type: 'restart' };
    }

    const selectedUniverse = this.selectedUniverse();

    if (selectedUniverse === null) {
      return null;
    }

    return selectedUniverse === this.creature()?.universe
      ? { label: 'Next creature', type: 'next' }
      : { label: 'Restart game', type: 'restart' };
  });
}
