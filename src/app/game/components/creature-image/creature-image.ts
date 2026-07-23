import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { Creature } from '../../models/creature.model';
import type { RoundEffectDefinition, RoundEffectPhase } from '../../models/round-effect.model';

@Component({
  selector: 'app-creature-image',
  templateUrl: './creature-image.html',
  styleUrl: './creature-image.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatureImageComponent {
  readonly creature = input.required<Creature>();
  readonly imageReady = input.required<boolean>();
  readonly effect = input<RoundEffectDefinition | null>(null);
  readonly effectPhase = input.required<RoundEffectPhase>();
  readonly bossRound = input.required<boolean>();

  readonly imageLoaded = output<void>();
  readonly imageFailed = output<void>();

  protected readonly requiresDuplicateLayers = computed(() => {
    const effectId = this.effect()?.id;

    return effectId === 'glitch-shift' || effectId === 'shadow-lock';
  });
  protected readonly badgeLabel = computed(() => {
    const effect = this.effect();

    if (!effect) {
      return '';
    }

    if (this.effectPhase() === 'clear') {
      return 'Signal clear';
    }

    return this.bossRound() ? `Boss · ${effect.label}` : effect.label;
  });
}
