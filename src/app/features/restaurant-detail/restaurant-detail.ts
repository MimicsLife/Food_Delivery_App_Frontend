import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { Jelo, Restoran } from '../../core/models/restoran.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { RestaurantService, errorMessage } from '../../core/services/restaurant.service';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { Rating } from '../../shared/components/rating/rating';
import { Zippy } from '../../shared/components/zippy/zippy';
import { DishRow } from './dish-row/dish-row';

interface DetaljVM {
  restoran: Restoran | null;
  meni: Jelo[];
  greska: string | null;
  ucitava: boolean;
}

const POCETNO: DetaljVM = { restoran: null, meni: [], greska: null, ucitava: true };

/**
 * Detalj restorana i njegov meni.
 *
 * Ruta je 'restorani/:id', pa se ID cita iz ActivatedRoute.paramMap.
 * Koristi se paramMap + switchMap umesto snapshot-a, da bi se podaci
 * ponovo ucitali i kada se ruta promeni bez ponovnog kreiranja komponente.
 */
@Component({
  selector: 'app-restaurant-detail',
  imports: [AsyncPipe, Card, DishRow, Loading, Rating, RouterLink, Zippy],
  templateUrl: './restaurant-detail.html',
  styleUrl: './restaurant-detail.css',
})
export class RestaurantDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantService = inject(RestaurantService);
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);

  protected readonly prijavljen = this.auth.isLoggedIn;

  /**
   * Jedan Observable nosi sve sto stranica treba. async pipe u templateu
   * se pretpljuje na njega i automatski se odjavljuje pri unistavanju.
   */
  protected readonly vm$: Observable<DetaljVM> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) =>
      this.restaurantService.getById(id).pipe(
        switchMap((restoran) =>
          this.restaurantService.getMenu(id).pipe(
            map((meni): DetaljVM => ({ restoran, meni, greska: null, ucitava: false })),
          ),
        ),
        // Prva emisija nosi stanje "ucitava" dok se ceka odgovor.
        startWith(POCETNO),
        catchError((error: unknown) =>
          of({ ...POCETNO, ucitava: false, greska: errorMessage(error) }),
        ),
      ),
    ),
  );

  protected readonly samoDostupna = signal(false);
  protected readonly poslednjeDodato = signal<string | null>(null);
  protected readonly brojDodatih = signal(0);

  protected vidljivaJela(meni: Jelo[]): Jelo[] {
    return this.samoDostupna() ? meni.filter((j) => j.dostupno === true) : meni;
  }

  protected brojDostupnih(meni: Jelo[]): number {
    return meni.filter((j) => j.dostupno === true).length;
  }

  protected onDodato(jelo: Jelo, restoran: Restoran): void {
    this.cart.add(jelo, restoran);
    this.brojDodatih.update((n) => n + 1);
    this.poslednjeDodato.set(`${jelo.naziv} je dodato u korpu.`);
  }
}
