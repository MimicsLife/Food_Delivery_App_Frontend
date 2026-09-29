/**
 * Stavka korpe. Ovo je cisto klijentski model - backend nema koncept korpe,
 * porudzbina se salje tek sa checkout forme.
 */
export interface CartItem {
  jeloId: number;
  naziv: string;
  cena: number;
  kolicina: number;
  restoranId: number;
  restoranNaziv: string;
  opis?: string;
}

export function cartItemSubtotal(item: CartItem): number {
  return item.cena * item.kolicina;
}
