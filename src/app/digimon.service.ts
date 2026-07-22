import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import type { Creature } from './creature.model';

interface DigimonResponse {
  name: string;
  img: string;
  level: string;
}

@Injectable({ providedIn: 'root' })
export class DigimonService {
  private readonly http = inject(HttpClient);
  private readonly digimonUrl = 'https://digimon-api.vercel.app/api/digimon';

  getRandomDigimon(): Observable<Creature> {
    return this.http.get<DigimonResponse[]>(this.digimonUrl).pipe(
      map((digimonList): Creature => {
        const index = Math.floor(Math.random() * digimonList.length);
        const digimon = digimonList[index];

        return {
          id: index + 1,
          name: digimon.name,
          imageUrl: digimon.img,
          universe: 'digimon',
        };
      }),
    );
  }
}
