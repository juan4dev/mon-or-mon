import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DigimonService } from './digimon.service';
import { PokemonService } from './pokemon.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly digimonService = inject(DigimonService);
  private readonly pokemonService = inject(PokemonService);

  protected readonly creature$ =
    Math.random() < 0.5
      ? this.pokemonService.getRandomPokemon()
      : this.digimonService.getRandomDigimon();
}
