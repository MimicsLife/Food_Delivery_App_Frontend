import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, share } from 'rxjs';
import { catchError, map, retry, switchMap } from 'rxjs/operators';

import { Korisnik, RegistracijaDTO } from '../models/korisnik.model';
import { ErrorResponse } from '../models/error.model';

/**
 * Pristup user-service resursima kroz api-gateway (PUT /api/users/**).
 *
 * Konkretne metode uvek vracaju Observable objekat; HTTP poziv se salje tek
 * kada neko pozove subscribe().
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  /** Deljeni Observable: vise komponenti se pretpljuje na isti HTTP poziv. */
  private readonly allUsers$ = this.http.get<Korisnik[]>(this.baseUrl).pipe(
    // Nestabilna konekcija: ponovi neuspesan zahtev najvise 3 puta.
    retry({ count: 3 }),
    catchError((error: unknown) => {
      console.error('Greska pri ucitavanju korisnika', error);
      return of([] as Korisnik[]);
    }),
    // Jedan HTTP poziv deljen izmedu svih pretplata, umesto jednog po pretplati.
    share(),
  );

  /** POST /api/users/register - jedini javni endpoint ove servise. */
  register(dto: RegistracijaDTO): Observable<Korisnik> {
    return this.http.post<Korisnik>(`${this.baseUrl}/register`, dto);
  }

  /** GET /api/users - deljeni poziv (share()). */
  getAll(): Observable<Korisnik[]> {
    return this.allUsers$;
  }

  /** GET /api/users/{id} */
  getById(id: number): Observable<Korisnik> {
    return this.http.get<Korisnik>(`${this.baseUrl}/${id}`);
  }

  /** GET /api/users/{id}/exists - backend vraca obican boolean, ne objekat. */
  exists(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${id}/exists`);
  }

  /**
   * GET /api/users sa query parametrima (HttpParams).
   *
   * Poziv se ponavlja bez `email` parametra ako prvi vrati praznu listu:
   * backend moze da ignorise filter i vratiti sve korisnike, a u tom slucaju
   * lokalno filtriranje daje tacnog. Ako ni drugi poziv ne radi (server nije
   * podignut), greska se propusta - prijava mora da razlikuje "nema naloga"
   * od "server ne radi".
   */
  findByEmail(email: string): Observable<Korisnik[]> {
    const cilj = email.trim().toLowerCase();
    const odgovara = (k: Korisnik): boolean => (k.email ?? '').trim().toLowerCase() === cilj;
    const params = new HttpParams().set('email', email.trim());

    return this.http.get<Korisnik[]>(this.baseUrl, { params }).pipe(
      switchMap((korisnici) =>
        korisnici.length > 0 ? of(korisnici) : this.http.get<Korisnik[]>(this.baseUrl),
      ),
      map((korisnici) => korisnici.filter(odgovara)),
    );
  }

  /** Pretvara HttpErrorResponse u poruku koju mozemo prikazati korisniku. */
  static messageFrom(error: unknown): string {
    const body = (error as { error?: ErrorResponse | Record<string, string> })?.error;
    if (!body) {
      return 'Greska u komunikaciji sa serverom.';
    }
    if (typeof (body as ErrorResponse).message === 'string') {
      return (body as ErrorResponse).message;
    }
    // @Valid greske dolaze kao mapa polje -> poruka.
    const first = Object.values(body as Record<string, string>)[0];
    return first ?? 'Podaci nisu ispravni.';
  }
}
