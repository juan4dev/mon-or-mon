import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { Creature, CreatureUniverse } from '../../models/creature.model';
import { RoundTimerComponent } from '../round-timer/round-timer';

@Component({
  selector: 'app-creature-card',
  imports: [RoundTimerComponent],
  templateUrl: './creature-card.html',
  styleUrl: './creature-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatureCardComponent {
  readonly creature = input<Creature | null>(null);
  readonly imageReady = input.required<boolean>();
  readonly unavailable = input.required<boolean>();
  readonly selectedUniverse = input<CreatureUniverse | null>(null);
  readonly timedOut = input.required<boolean>();
  readonly seconds = input.required<number>();
  readonly percentage = input.required<number>();

  readonly imageLoaded = output<void>();
  readonly imageFailed = output<void>();

  protected readonly isCorrect = computed(
    () => this.selectedUniverse() !== null && this.selectedUniverse() === this.creature()?.universe,
  );
  protected readonly isIncorrect = computed(
    () =>
      this.timedOut() ||
      (this.selectedUniverse() !== null && this.selectedUniverse() !== this.creature()?.universe),
  );
  protected readonly isLoading = computed(
    () => !this.unavailable() && (!this.creature() || !this.imageReady()),
  );
}
