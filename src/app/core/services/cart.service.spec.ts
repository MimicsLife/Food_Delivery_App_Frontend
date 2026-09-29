import { TestBed } from '@angular/core/testing';

import { Jelo, Restoran } from '../models/restoran.model';

import { AuthService } from './auth.service';
import { CartService } from './cart.service';

const RESTORAN: Restoran = {
  id: 3,
  naziv: 'Kod Marka',
  adresa: 'Knez Mihailova 5',
  telefon: '011000000',
  otvoren: true,
};

const JELO: Jelo = { id: 7, naziv: 'Pljeskavica', opis: 'Lesan mesni proizvod', cena: 620 };

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    globalThis.localStorage?.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('starts empty', () => {
    expect(service.isEmpty()).toBe(true);
    expect(service.count()).toBe(0);
    expect(service.total()).toBe(0);
    expect(service.restoranId()).toBeNull();
  });

  it('adds an item and computes count and total', () => {
    service.add(JELO, RESTORAN);

    expect(service.isEmpty()).toBe(false);
    expect(service.count()).toBe(1);
    expect(service.total()).toBe(620);
    expect(service.restoranId()).toBe(3);
    expect(service.restoranNaziv()).toBe('Kod Marka');
  });

  it('merges the same dish instead of duplicating it', () => {
    service.add(JELO, RESTORAN);
    service.add(JELO, RESTORAN, 2);

    expect(service.items().length).toBe(1);
    expect(service.count()).toBe(3);
    expect(service.total()).toBe(1860);
  });

  it('increments and decrements quantity', () => {
    service.add(JELO, RESTORAN);
    service.increment(7);
    expect(service.count()).toBe(2);

    service.decrement(7);
    expect(service.count()).toBe(1);
  });

  it('removes an item when quantity drops to zero', () => {
    service.add(JELO, RESTORAN);
    service.decrement(7);

    expect(service.items().length).toBe(0);
  });

  it('removes a dish explicitly', () => {
    service.add(JELO, RESTORAN);
    service.remove(7);

    expect(service.isEmpty()).toBe(true);
  });

  it('maps items to the order request body', () => {
    service.add(JELO, RESTORAN, 4);
    expect(service.itemsForOrder()).toEqual([{ jeloId: 7, kolicina: 4 }]);
  });

  it('clears the cart', () => {
    service.add(JELO, RESTORAN);
    service.clear();

    expect(service.isEmpty()).toBe(true);
  });
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    globalThis.localStorage?.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.authorizationHeader()).toBeNull();
  });

  it('stores credentials on login', () => {
    service.login({ username: 'admin', password: 'admin' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()).toBe('admin');
  });

  it('builds a Basic authorization header', () => {
    service.login({ username: 'admin', password: 'admin' });

    // btoa('admin:admin') = YWRtaW46YWRtaW4=
    expect(service.authorizationHeader()).toBe('Basic YWRtaW46YWRtaW4=');
  });

  it('clears state on logout', () => {
    service.login({ username: 'admin', password: 'admin' });
    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.authorizationHeader()).toBeNull();
  });
});
