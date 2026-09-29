import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

/**
 * Redosled ruta je bitan - uvek se koristi prva odgovarajuca.
 * Zato idu konkretne rute pre wildcard rute '*' na krajnjem mestu.
 *
 * loadComponent() ucitava komponentu lenjo (code splitting): fajl se trazi
 * tek kada korisnik prvi put ode na tu rutu.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Dostava',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'restorani',
    title: 'Restorani',
    loadComponent: () => import('./features/restaurants/restaurants').then((m) => m.Restaurants),
  },
  {
    // Parametar rute: /restorani/3 -> params['id'] === '3'
    path: 'restorani/:id',
    title: 'Detalj restorana',
    loadComponent: () =>
      import('./features/restaurant-detail/restaurant-detail').then((m) => m.RestaurantDetail),
  },
  {
    path: 'korpa',
    title: 'Korpa',
    loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'porudzba',
    title: 'Porudžbina',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'porudzbine',
    title: 'Moje porudžbine',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'porudzbine/:id',
    title: 'Detalj porudžbine',
    canActivate: [authGuard],
    loadComponent: () => import('./features/order-detail/order-detail').then((m) => m.OrderDetail),
  },
  {
    path: 'korisnici',
    title: 'Korisnici',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users').then((m) => m.Users),
  },
  {
    path: 'login',
    title: 'Prijava',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'registracija',
    title: 'Registracija',
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
  },

  // Wildcard ruta: sve sto se ne poklapa sa prethodnima.
  {
    path: '**',
    title: 'Stranica nije nađena',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
