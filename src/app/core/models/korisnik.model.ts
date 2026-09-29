/**
 * Modeli za user-service.
 * Nazivi polja moraju da se poklapaju sa JSON imenima koja vraca
 * KorisnikController / RegistracijaDTO (Jackson koristi imena Java polja).
 */

export enum KorisnikTip {
  KUPAC = 'KUPAC',
  DOSTAVLJAC = 'DOSTAVLJAC',
  VLASNIK = 'VLASNIK',
}

export const KORISNIK_TIP_LABELS: Record<KorisnikTip, string> = {
  [KorisnikTip.KUPAC]: 'Kupac',
  [KorisnikTip.DOSTAVLJAC]: 'Dostavljac',
  [KorisnikTip.VLASNIK]: 'Vlasnik restorana',
};

export interface Uloga {
  id?: number;
  naziv: string;
}

export interface Adresa {
  id?: number;
  grad?: string;
  ulica?: string;
  broj?: string;
}

/**
 * Odgovor backend-a. Napomena: `sifra` se VRAĆA u svakom odgovoru jer backend
 * cuva i serializuje lozinku u plain tekstu. Nikada je ne prikazujemo u interfejsu.
 */
export interface Korisnik {
  id?: number;
  ime: string;
  prezime: string;
  email: string;
  sifra?: string;
  tip: KorisnikTip;
  datumRegistracije?: string;
  adrese?: Adresa[];
  uloge?: Uloga[];
}

/** Telo za POST /api/users/register (@Valid na serveru). */
export interface RegistracijaDTO {
  ime: string;
  prezime: string;
  email: string;
  sifra: string;
  tip: KorisnikTip;
  grad?: string;
  ulica?: string;
  broj?: string;
}
