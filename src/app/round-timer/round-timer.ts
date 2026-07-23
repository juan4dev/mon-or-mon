import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-round-timer',
  templateUrl: './round-timer.html',
  styleUrl: './round-timer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundTimerComponent {
  readonly seconds = input.required<number>();
  readonly percentage = input.required<number>();

  protected readonly fillPercentage = computed(() => Math.min(100, Math.max(0, this.percentage())));
  protected readonly isWarning = computed(() => this.seconds() <= 3 && this.seconds() > 1);
  protected readonly isDanger = computed(() => this.seconds() <= 1);
}
