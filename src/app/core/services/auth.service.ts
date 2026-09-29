import { Injectable, computed, signal } from '@angular/core';

import { GATEWAY_CREDENTIAL, basicAuthHeader } from '../api.config';
import { Korisnik, KorisnikTip } from '../models/korisnik.model';

const STORAGE_KEY = 'nwp.session';
/** Stara sesija je cuvala lozinku u plain tekstu - uklanja se pri ucitavanju. */
const LEGACY_STORAGE_KEY = 'nwp.credentials';

/**
 * Sadrzaj sesije: podaci o korisniku BEZ lozinke.
 * Lozinka se cuva samo trenutno (za proveru pri prijavi) i nikada se ne upisuje
 * u localStorage, pa je prepisani kljuc `nwp.session` umesto `nwp.credentials`.
 */
export interface SessionUser {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  tip: KorisnikTip;
}

/**
 * Zavrsena sesija jednog korisnika u aplikaciji.
 *
 * Razdvajamo dve stvari koje su ranije bile pomešane:
 *   1. KO JE ULOGOVAN u aplikaciju - to je ovaj signal i on kontrolise
 *      `authGuard` i prikaz u zaglavlju;
 *   2. STA SE SALJE GATEWAYU - to je statički kredencijal iz api.config.ts,
 *      jer gateway prihvata samo admin/admin (vidi tamo detalje).
 *
 * Zato svaki prijavljeni korisnik, bez obzira na ulogu, moze da otvara
 * detalj restorana, meni i da narucuje: nalog se vise ne uporedjuje sa
 * kredencijalima gatewaya.
 *
 * Servis je singleton (providedIn: 'root') - svi korisnici DI sistema
 * dobijaju istu instancu, sto je razlog zbog kog je koriscen signal:
 * promena na jednom mestu automatski obavesava sve komponente koje ga citaju.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<SessionUser | null>(readFromStorage());

  constructor() {
    // Stare verzije su upisivale email i lozinku pod `nwp.credentials`.
    try {
      globalThis.localStorage?.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Privatni mod: nema sta da se ocisti.
    }
  }

  /**
   * computed() je uvek read-only i sam se preracunava kad zavisnost promeni,
   * pa ne moze da se desi da currentUser ostane zastareo posle logout().
   */
  readonly currentUser = computed(() => this.session()?.email ?? null);

  /** ID ulogovanog kupca - order-service ocekuje pravi `kupacId`, ne fiksni 1. */
  readonly currentUserId = computed(() => this.session()?.id ?? null);

  readonly isLoggedIn = computed(() => this.session() !== null);

  /**
   * Zaglavlje za zasticene rute. Ne zavisi od sesije: gateway ne razlikuje
   * korisnike, pa bi bezavno (a i gresno) bilo vezivati ga za `isLoggedIn`.
   */
  readonly authorizationHeader = basicAuthHeader(GATEWAY_CREDENTIAL);

  /**
   * Zapocinje sesiju. Ignorise korisnike bez `id` jer se id koristi kao
   * `kupacId` pri slanju porudzbine - bez njega bi se salala porudzbina
   * sa tudim kupcem.
   */
  login(korisnik: Korisnik): boolean {
    if (korisnik.id === undefined || korisnik.id === null) {
      return false;
    }
    const korisnikSesije: SessionUser = {
      id: korisnik.id,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      email: korisnik.email,
      tip: korisnik.tip,
    };
    this.session.set(korisnikSesije);
    writeToStorage(korisnikSesije);
    return true;
  }

  logout(): void {
    this.session.set(null);
    writeToStorage(null);
  }

  /**
   * Provera lozinke. Backend nema login endpoint i u svakom odgovoru vraca
   * polje `sifra` u plain tekstu, pa se jedina dostupna provera radi ovde.
   * Ako backend nekad ne vrati `sifra`, prijava se odbija umesto da se
   * propusti - sigurnije je da korisnik vidi gresku nego da uide u sesiju.
   */
  static passwordMatches(korisnik: Korisnik, sifra: string): boolean {
    return typeof korisnik.sifra === 'string' && korisnik.sifra === sifra;
  }
}

function readFromStorage(): SessionUser | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsirano = JSON.parse(raw) as SessionUser;
    return typeof parsirano?.id === 'number' ? parsirano : null;
  } catch {
    return null;
  }
}

function writeToStorage(value: SessionUser | null): void {
  try {
    if (value) {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage moze biti nedostupan (privatni mod) - tada sessija traje do refresha.
  }
}
