import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-streak-display',
  templateUrl: './streak-display.html',
  styleUrl: './streak-display.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreakDisplayComponent {
  readonly streak = input.required<number>();
  readonly lost = input(false);
  readonly updated = input(false);

  protected readonly streakHue = computed(() => {
    const progress = Math.min(this.streak() / 50, 1);

    return Math.round(120 * (1 - progress));
  });
}
