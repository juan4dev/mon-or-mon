import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay, switchMap } from 'rxjs';

import type { Creature } from '../models/creature.model';

interface DigimonListResponse {
  content: [DigimonSummary];
  pageable: {
    totalElements: number;
  };
}

interface DigimonSummary {
  id: number;
  name: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class DigimonService {
  private readonly http = inject(HttpClient);
  private readonly digimonUrl = 'https://digi-api.com/api/v1/digimon';
  private readonly digimonCount$ = this.getDigimonPage(0).pipe(
    map(({ pageable }) => pageable.totalElements),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getRandomDigimon(): Observable<Creature> {
    return this.digimonCount$.pipe(
      switchMap((count) => this.getDigimonPage(Math.floor(Math.random() * count))),
      map(({ content: [digimon] }): Creature => ({
        id: digimon.id,
        name: digimon.name,
        imageUrl: digimon.image,
        universe: 'digimon',
      })),
    );
  }

  private getDigimonPage(page: number): Observable<DigimonListResponse> {
    return this.http.get<DigimonListResponse>(this.digimonUrl, {
      params: { page, pageSize: 1 },
    });
  }
}
