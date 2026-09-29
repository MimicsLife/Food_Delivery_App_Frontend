import { AsyncPipe, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { Porudzbina, PorudzbinaStatus } from '../../core/models/porudzbina.model';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { UserService } from '../../core/services/user.service';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';

interface ListaVM {
  porudzbine: Porudzbina[];
  greska: string | null;
  ucitava: boolean;
}

/**
 * Lista porudzbine jednog kupca: GET /api/orders/user/{kupacId}.
 *
 * Signal `kupacId` je izvor istine; pretvara se u Observable preko
 * toObservable(), pa svaka njegova promena automatski ponovo pokrece
 * ceo lanac (switchMap) - nema rucnog unsubscribe/subscribe koda.
 */
@Component({
  selector: 'app-orders',
  imports: [AsyncPipe, Card, CurrencyPipe, DatePipe, Loading, NgClass, RouterLink, StatusLabelPipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  private readonly orderService = inject(OrderService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly auth = inject(AuthService);

  /** Lista restorana se cita jednom da se ID restorana pretvori u naziv. */
  private readonly restorani = toSignal(this.restaurantService.getAll(), { initialValue: [] });

  /** Lista se uvek cita za ulogovanog kupca; ruta je pod authGuard-om. */
  private readonly kupacId = computed(() => this.auth.currentUserId() ?? 0);

  protected readonly vm$: Observable<ListaVM> = toObservable(this.kupacId).pipe(
    switchMap((kupacId) =>
      this.orderService.getByUser(kupacId).pipe(
        map((porudzbine): ListaVM => ({ porudzbine, greska: null, ucitava: false })),
        // startWith prikazuje "ucitava" dok se ceka odgovor servera.
        startWith<ListaVM>({ porudzbine: [], greska: null, ucitava: true }),
        // Greska se pretvara u vrednost (catchError umesto da pukne ceo stream),
        // pa async pipe uvek dobija objekat za prikaz.
        catchError((error: unknown) =>
          of<ListaVM>({ porudzbine: [], greska: UserService.messageFrom(error), ucitava: false }),
        ),
      ),
    ),
  );

  protected statusKlasa(status: PorudzbinaStatus): string {
    return `status--${status.toLowerCase()}`;
  }

  protected restoranNaziv(id: number): string {
    return this.restorani().find((r) => r.id === id)?.naziv ?? 'Restoran';
  }

  protected brojStavki(p: Porudzbina): number {
    return p.stavke.reduce((sum, s) => sum + s.kolicina, 0);
  }
}
