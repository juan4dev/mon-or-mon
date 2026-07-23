import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

import type { Creature } from '../models/creature.model';

interface PokemonListResponse {
  count: number;
  results: [PokemonResource];
}

interface PokemonResource {
  url: string;
}

interface PokemonResponse {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly pokemonUrl = 'https://pokeapi.co/api/v2/pokemon';

  getRandomPokemon(): Observable<Creature> {
    return this.http.get<PokemonListResponse>(this.pokemonUrl, { params: { limit: 1 } }).pipe(
      switchMap(({ count }) => {
        const offset = Math.floor(Math.random() * count);

        return this.http.get<PokemonListResponse>(this.pokemonUrl, {
          params: { limit: 1, offset },
        });
      }),
      switchMap(({ results }) => this.http.get<PokemonResponse>(results[0].url)),
      map((pokemon): Creature => ({
        id: pokemon.id,
        name: this.formatName(pokemon.name),
        imageUrl: pokemon.sprites.other['official-artwork'].front_default,
        universe: 'pokemon',
      })),
    );
  }

  private formatName(name: string): string {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
