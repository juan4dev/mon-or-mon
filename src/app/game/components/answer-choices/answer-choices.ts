import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { CreatureUniverse } from '../../models/creature.model';

@Component({
  selector: 'app-answer-choices',
  templateUrl: './answer-choices.html',
  styleUrl: './answer-choices.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswerChoicesComponent {
  readonly creatureUniverse = input<CreatureUniverse | null>(null);
  readonly selectedUniverse = input<CreatureUniverse | null>(null);
  readonly enabled = input.required<boolean>();
  readonly timedOut = input.required<boolean>();

  readonly answered = output<CreatureUniverse>();

  protected readonly roundFinished = computed(
    () => this.selectedUniverse() !== null || this.timedOut(),
  );
  protected readonly disabled = computed(() => !this.enabled() || this.roundFinished());

  protected isCorrect(universe: CreatureUniverse): boolean {
    return this.roundFinished() && this.creatureUniverse() === universe;
  }

  protected isIncorrect(universe: CreatureUniverse): boolean {
    return this.selectedUniverse() === universe && this.creatureUniverse() !== universe;
  }
}
