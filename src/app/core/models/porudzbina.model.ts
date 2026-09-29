/**
 * Modeli za order-service.
 * PorudzbinaController je baziran na "/api/orders".
 */

export enum PorudzbinaStatus {
  KREIRANA = 'KREIRANA',
  UPRIPREMI = 'UPRIPREMI',
  U_DOSTAVI = 'U_DOSTAVI',
  DOSTAVLJENA = 'DOSTAVLJENA',
  OTKAZANA = 'OTKAZANA',
}

export const PORUDZBINA_STATUS_LABELS: Record<PorudzbinaStatus, string> = {
  [PorudzbinaStatus.KREIRANA]: 'Kreirana',
  [PorudzbinaStatus.UPRIPREMI]: 'U pripremi',
  [PorudzbinaStatus.U_DOSTAVI]: 'U dostavi',
  [PorudzbinaStatus.DOSTAVLJENA]: 'Dostavljena',
  [PorudzbinaStatus.OTKAZANA]: 'Otkazana',
};

export enum DostavaStatus {
  KREIRANA = 'KREIRANA',
  DODELJENA = 'DODELJENA',
  U_TOKU = 'U_TOKU',
  DOSTAVLJENA = 'DOSTAVLJENA',
}

export const DOSTAVA_STATUS_LABELS: Record<DostavaStatus, string> = {
  [DostavaStatus.KREIRANA]: 'Kreirana',
  [DostavaStatus.DODELJENA]: 'Dodeljena dostavljacu',
  [DostavaStatus.U_TOKU]: 'U toku',
  [DostavaStatus.DOSTAVLJENA]: 'Dostavljena',
};

/** Telo za POST /api/orders (@Valid na serveru). */
export interface StavkaDTO {
  jeloId: number;
  kolicina: number;
}

export interface PorudzbinaDTO {
  kupacId: number;
  restoranId: number;
  adresaDostave: string;
  stavke: StavkaDTO[];
}

export interface StavkaPorudzbine {
  id?: number;
  jeloId: number;
  kolicina: number;
  /** Cena po jedinici snimljena u trenutku porudzbine. */
  cenaPoJedinici: number;
}

/**
 * Odgovor backend-a. Backend NEMA polje `dostava`, pa se dostava moze
 * videti samo iz odgovora na PUT /api/orders/{id}/assign-delivery.
 */
export interface Porudzbina {
  id?: number;
  kupacId: number;
  restoranId: number;
  ukupnaCena: number;
  status: PorudzbinaStatus;
  /** ISO-8601, npr. "2026-09-28T10:30:00" */
  datum: string;
  stavke: StavkaPorudzbine[];
}

export interface Dostava {
  id?: number;
  dostavljacId?: number | null;
  adresa?: string;
  statusDostave: DostavaStatus;
  /** Backend postavlja na "vreme kreiranja + 45 min". */
  procenjenoVreme?: string;
}
