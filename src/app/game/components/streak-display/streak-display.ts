import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MAXIMUM_DIFFICULTY_ROUND } from '../../difficulty';

@Component({
  selector: 'app-streak-display',
  templateUrl: './streak-display.html',
  styleUrl: './streak-display.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreakDisplayComponent {
  protected readonly maximumDifficultyStreak = MAXIMUM_DIFFICULTY_ROUND;

  readonly streak = input.required<number>();
  readonly lost = input(false);
  readonly updated = input(false);

  protected readonly streakHue = computed(() => {
    const progress = Math.min(this.streak() / this.maximumDifficultyStreak, 1);

    return Math.round(120 * (1 - progress));
  });
}
