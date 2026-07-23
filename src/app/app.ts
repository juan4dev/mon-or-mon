import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GameComponent } from './game/game';

@Component({
  selector: 'app-root',
  imports: [GameComponent],
  template: '<app-game />',
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
