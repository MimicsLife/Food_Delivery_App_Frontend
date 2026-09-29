/**
 * Modeli za restaurant-service.
 * RestoranController je baziran na "/api" (ne na "/api/restaurants"),
 * pa se podeljeni resursi nalaze na /api/restaurants/** i /api/dishes/**.
 */

export interface Kategorija {
  id?: number;
  naziv: string;
}

export interface Jelo {
  id?: number;
  naziv: string;
  opis?: string;
  /** JSON broj (BigDecimal), npr. 850.00 */
  cena: number;
  dostupno?: boolean;
  /** Backend ga uvek ignorise u JSON (@JsonIgnore) i prepisuje iz putanje. */
  restoran?: Restoran;
  /** Ovo JE serializovano i moze biti null. */
  kategorija?: Kategorija | null;
}

/** Ista klasa se koristi i za request i za response. */
export interface Restoran {
  id?: number;
  naziv: string;
  vlasnikId?: number;
  adresa?: string;
  telefon?: string;
  otvoren?: boolean;
}

/** Jelo koje se salje za POST /api/restaurants/{id}/dishes. */
export interface JeloDTO {
  naziv: string;
  opis?: string;
  cena: number;
  dostupno?: boolean;
  kategorija?: Kategorija | null;
}
