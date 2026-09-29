import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Dostava, Porudzbina, PorudzbinaDTO, PorudzbinaStatus } from '../models/porudzbina.model';
import { SAMPLE_ORDERS } from './sample-data';

/**
 * Pristup order-service resursima kroz api-gateway (/api/orders/**).
 * Sve rute ove servise u gatewayu traze autentifikaciju.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  private readonly fallback = signal(false);
  readonly usingFallback = this.fallback.asReadonly();

  /** POST /api/orders */
  create(dto: PorudzbinaDTO): Observable<Porudzbina> {
    return this.http.post<Porudzbina>(this.baseUrl, dto);
  }

  /** GET /api/orders/{id} */
  getById(id: number): Observable<Porudzbina> {
    return this.http.get<Porudzbina>(`${this.baseUrl}/${id}`).pipe(
      retry({ count: 2 }),
      catchError((error: unknown) => {
        if (!isServerDown(error)) {
          return throwError(() => error);
        }
        this.fallback.set(true);
        const probna = SAMPLE_ORDERS.find((o) => o.id === id);
        return probna ? of(probna) : throwError(() => error);
      }),
    );
  }

  /** GET /api/orders/user/{kupacId} */
  getByUser(kupacId: number): Observable<Porudzbina[]> {
    return this.http.get<Porudzbina[]>(`${this.baseUrl}/user/${kupacId}`).pipe(
      retry({ count: 2 }),
      catchError((error: unknown) => {
        if (!isServerDown(error)) {
          return throwError(() => error);
        }
        this.fallback.set(true);
        return of(SAMPLE_ORDERS.filter((o) => o.kupacId === kupacId));
      }),
    );
  }

  /**
   * PUT /api/orders/{id}/status?status={STATUS}
   * Backend ocekuje tacno ime enuma (velika slova, donja crta u "U_DOSTAVI").
   */
  updateStatus(id: number, status: PorudzbinaStatus): Observable<Porudzbina> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Porudzbina>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  /**
   * PUT /api/orders/{id}/assign-delivery?dostavljacId={id}
   * Jedini endpoint koji vraca objekat Dostava (Porudzbina ga ne sadrzi).
   * Efekat na serveru: postavlja dostavljacId i statusDostave = DODELJENA.
   */
  assignDelivery(id: number, dostavljacId: number): Observable<Dostava> {
    const params = new HttpParams().set('dostavljacId', dostavljacId);
    return this.http.put<Dostava>(`${this.baseUrl}/${id}/assign-delivery`, null, { params });
  }
}

/** status 0 = mrezna greska, 502/503 = gateway nije podignut. */
function isServerDown(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return status === 0 || status === 502 || status === 503;
}
