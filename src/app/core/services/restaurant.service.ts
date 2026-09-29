import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  share,
  startWith,
  switchMap,
} from 'rxjs/operators';

import { ErrorResponse } from '../models/error.model';
import { Jelo, Kategorija, JeloDTO, Restoran } from '../models/restoran.model';
import { SAMPLE_KATEGORIJE, SAMPLE_MENI, SAMPLE_RESTAURANTS } from './sample-data';

/**
 * NAPOMENA O RUTAMA: api-gateway ima samo predikate
 *   Path=/api/restaurants/** i Path=/api/dishes/**
 * pa rute /api/categories ne prolaze kroz gateway po svom prirodnom putu.
 * Do njih se dolazi preko ukljucenog discovery locator-a:
 *   /restaurant-service/api/categories
 */
const CATEGORIJE_URL = '/restaurant-service/api/categories';

/**
 * Pristup restaurant-service resursima.
 *
 * Svaka metoda vraca Observable; HTTP poziv se izvrsava tek na subscribe().
 * Ako backend nije pokrenut, prikaz se prebacuje na lokalne probne podatke
 * da interfejs ostane pregledan - `usingFallback` to signalizira.
 */
@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/restaurants';

  private readonly fallback = signal(false);
  readonly usingFallback = this.fallback.asReadonly();

  private readonly allRestaurants$ = this.http.get<Restoran[]>(this.baseUrl).pipe(
    catchError(() => this.useSample(SAMPLE_RESTAURANTS)),
    // Jedan HTTP poziv deljen izmedu svih pretplata umesto jednog po pretplati.
    share(),
  );

  /** Izvor pretrage: komponenta poziva next() na svaki unos korisnika. */
  private readonly searchTerm = new Subject<string>();

  /**
   * Scenario 3 iz prezentacije: server se pita tek nakon 500ms pauze u kucanju
   * (debounceTime), samo ako se tekst stvarno promenio (distinctUntilChanged),
   * a novi unos otkazuje prethodni zahtev (switchMap).
   *
   * Pretraga se ovde radi nad vec dobijenim nizom, pa nema novog HTTP poziva,
   * ali je obrazac isti kao u verziji koja pita udaljeni servis.
   */
  readonly filteredRestaurants$: Observable<Restoran[]> = this.searchTerm.pipe(
    startWith<string>(''),
    debounceTime(500),
    distinctUntilChanged(),
    switchMap((term) =>
      this.allRestaurants$.pipe(
        map((restorani) => filterRestorani(restorani, term)),
        startWith<Restoran[]>([]),
      ),
    ),
  );

  /** Poziva se iz templatea pri svakom unosu u polje za pretragu. */
  search(term: string): void {
    this.searchTerm.next(term);
  }

  /** GET /api/restaurants - javna ruta. */
  getAll(): Observable<Restoran[]> {
    return this.allRestaurants$;
  }

  /** GET /api/restaurants/{id} - zahteva autentifikaciju. */
  getById(id: number): Observable<Restoran> {
    return this.http.get<Restoran>(`${this.baseUrl}/${id}`).pipe(
      catchError((error: unknown) => {
        if (!isServerDown(error)) {
          return throwError(() => error);
        }
        // U probnom skupu bira se restoran sa trazenim id-om; ako ga nema,
        // vraca se prvi, da detalj uvek ima nesto da prikaze.
        this.fallback.set(true);
        return of(SAMPLE_RESTAURANTS.find((r) => r.id === id) ?? SAMPLE_RESTAURANTS[0]);
      }),
    );
  }

  /** GET /api/restaurants/{id}/menu - zahteva autentifikaciju. */
  getMenu(id: number): Observable<Jelo[]> {
    return this.http.get<Jelo[]>(`${this.baseUrl}/${id}/menu`).pipe(
      catchError((error: unknown) => this.handleDown(error, SAMPLE_MENI)),
    );
  }

  /** POST /api/restaurants */
  create(restoran: Restoran): Observable<Restoran> {
    return this.http.post<Restoran>(this.baseUrl, restoran);
  }

  /**
   * POST /api/restaurants/{id}/dishes
   * Backend uvek prepisuje `jelo.restoran` iz putanje, pa se to ne salje.
   */
  addDish(restoranId: number, jelo: JeloDTO): Observable<Jelo> {
    return this.http.post<Jelo>(`${this.baseUrl}/${restoranId}/dishes`, jelo);
  }

  /** GET /api/dishes/{id}/price - javna ruta, vraca obican broj (Double). */
  getDishPrice(id: number): Observable<number> {
    return this.http.get<number>(`/api/dishes/${id}/price`);
  }

  /** GET /restaurant-service/api/categories */
  getCategories(): Observable<Kategorija[]> {
    return this.http.get<Kategorija[]>(CATEGORIJE_URL).pipe(
      catchError((error: unknown) => this.handleDown(error, SAMPLE_KATEGORIJE)),
    );
  }

  /** POST /restaurant-service/api/categories */
  createCategory(kategorija: Kategorija): Observable<Kategorija> {
    return this.http.post<Kategorija>(CATEGORIJE_URL, kategorija);
  }

  private useSample<T>(values: T[]): Observable<T[]> {
    this.fallback.set(true);
    return of(values);
  }

  /** Ako je backend ugasen prikazujemo probne podatke, inace vraca originalnu gresku. */
  private handleDown<T>(error: unknown, samples: T[]): Observable<T[]> {
    return isServerDown(error) ? this.useSample(samples) : throwError(() => error);
  }
}

function filterRestorani(restorani: Restoran[], term: string): Restoran[] {
  const query = term.trim().toLowerCase();
  if (!query) {
    return restorani;
  }
  return restorani.filter(
    (r) => r.naziv.toLowerCase().includes(query) || (r.adresa ?? '').toLowerCase().includes(query),
  );
}

/** status 0 = mrezna greska, 502/503 = gateway nije podignut. */
function isServerDown(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return status === 0 || status === 502 || status === 503;
}

export function errorMessage(error: unknown): string {
  const status = (error as { status?: number })?.status;
  if (status === 401) {
    return 'Prijavite se da biste videli meni i poručili.';
  }
  if (status === 403) {
    return 'Nemate dozvolu da vidite ovaj sadržaj.';
  }
  if (isServerDown(error)) {
    return 'Server trenutno nije dostupan. Pokušajte ponovo za koji minut.';
  }
  const body = (error as { error?: ErrorResponse })?.error;
  return body?.message ?? 'Došlo je do greške. Pokušajte ponovo.';
}
