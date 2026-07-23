import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { Creature, CreatureUniverse } from '../../models/creature.model';

@Component({
  selector: 'app-game-feedback',
  templateUrl: './game-feedback.html',
  styleUrl: './game-feedback.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameFeedbackComponent {
  readonly creature = input<Creature | null>(null);
  readonly unavailable = input.required<boolean>();
  readonly loading = input.required<boolean>();
  readonly selectedUniverse = input<CreatureUniverse | null>(null);
  readonly timedOut = input.required<boolean>();
  readonly lostStreak = input.required<number>();

  readonly retryRequested = output<void>();
  readonly nextRequested = output<void>();
  readonly restartRequested = output<void>();
}
