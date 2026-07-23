import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Creature, CreatureUniverse } from '../../models/creature.model';
import type { RoundEffectDefinition, RoundEffectPhase } from '../../models/round-effect.model';

@Component({
  selector: 'app-game-feedback',
  templateUrl: './game-feedback.html',
  styleUrl: './game-feedback.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameFeedbackComponent {
  readonly started = input.required<boolean>();
  readonly creature = input<Creature | null>(null);
  readonly unavailable = input.required<boolean>();
  readonly loading = input.required<boolean>();
  readonly selectedUniverse = input<CreatureUniverse | null>(null);
  readonly timedOut = input.required<boolean>();
  readonly lostStreak = input.required<number>();
  readonly roundEffect = input<RoundEffectDefinition | null>(null);
  readonly effectPhase = input.required<RoundEffectPhase>();
}
