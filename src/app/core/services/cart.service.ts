import { Injectable, computed, effect, signal } from '@angular/core';

import { CartItem, cartItemSubtotal } from '../models/cart.model';
import { Jelo, Restoran } from '../models/restoran.model';
import { StavkaDTO } from '../models/porudzbina.model';

const STORAGE_KEY = 'nwp.cart';

/**
 * Stanje korpe je podeljeno izmedu komponenti koje nisu u direktnoj vezi
 * (restoran -> meni -> korpa), zato se drzi u servisu. Servis je singleton,
 * pa sve komponente vide istu instancu.
 *
 * Stanje se cuva u signalima; computed() izvodene vrednosti se automatski
 * racunaju kad se signal promeni, bez rucnog osvezavanja u templateu.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<CartItem[]>(readFromStorage());

  constructor() {
    // effect() se automatski ponovo izvrsava kad se state signal promeni,
    // pa korpa ostaje sacuvana i posle osvezavanja stranice.
    effect(() => writeToStorage(this.state()));
  }

  /** @for iterira nad ovim signalom. */
  readonly items = this.state.asReadonly();

  readonly isEmpty = computed(() => this.state().length === 0);

  readonly count = computed(() => this.state().reduce((sum, i) => sum + i.kolicina, 0));

  readonly total = computed(() => this.state().reduce((sum, i) => sum + cartItemSubtotal(i), 0));

  /** Sve stavke moraju biti iz istog restorana (jedna porudzbina = jedan restoran). */
  readonly restoranId = computed(() => this.state()[0]?.restoranId ?? null);

  readonly restoranNaziv = computed(() => this.state()[0]?.restoranNaziv ?? '');

  readonly itemsForOrder = computed<StavkaDTO[]>(() =>
    this.state().map((i) => ({ jeloId: i.jeloId, kolicina: i.kolicina })),
  );

  add(jelo: Jelo, restoran: Restoran, kolicina = 1): void {
    const id = jelo.id;
    if (id === undefined) {
      return;
    }
    this.state.update((items) => {
      const postoji = items.find((i) => i.jeloId === id);
      if (postoji) {
        return items.map((i) =>
          i.jeloId === id ? { ...i, kolicina: i.kolicina + kolicina } : i,
        );
      }
      const novo: CartItem = {
        jeloId: id,
        naziv: jelo.naziv,
        cena: jelo.cena,
        kolicina,
        restoranId: restoran.id ?? 0,
        restoranNaziv: restoran.naziv,
        opis: jelo.opis,
      };
      return [...items, novo];
    });
  }

  setQuantity(jeloId: number, kolicina: number): void {
    this.state.update((items) =>
      kolicina <= 0
        ? items.filter((i) => i.jeloId !== jeloId)
        : items.map((i) => (i.jeloId === jeloId ? { ...i, kolicina } : i)),
    );
  }

  increment(jeloId: number): void {
    this.state.update((items) =>
      items.map((i) => (i.jeloId === jeloId ? { ...i, kolicina: i.kolicina + 1 } : i)),
    );
  }

  decrement(jeloId: number): void {
    this.state.update((items) =>
      items
        .map((i) => (i.jeloId === jeloId ? { ...i, kolicina: i.kolicina - 1 } : i))
        .filter((i) => i.kolicina > 0),
    );
  }

  remove(jeloId: number): void {
    this.state.update((items) => items.filter((i) => i.jeloId !== jeloId));
  }

  clear(): void {
    this.state.set([]);
  }
}

function readFromStorage(): CartItem[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: CartItem[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage moze biti nedostupan (privatni mod) - korpa tada traje do refresha.
  }
}
