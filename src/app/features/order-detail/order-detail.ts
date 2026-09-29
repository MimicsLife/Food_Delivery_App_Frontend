import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import {
  Dostava,
  PORUDZBINA_STATUS_LABELS,
  Porudzbina,
  PorudzbinaStatus,
} from '../../core/models/porudzbina.model';
import { Jelo } from '../../core/models/restoran.model';
import { OrderService } from '../../core/services/order.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { UserService } from '../../core/services/user.service';
import { Card } from '../../shared/components/card/card';
import { Loading } from '../../shared/components/loading/loading';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';

interface DetaljVM {
  porudzbina: Porudzbina | null;
  greska: string | null;
  ucitava: boolean;
}

const POCETNO: DetaljVM = { porudzbina: null, greska: null, ucitava: true };

/** Naredni status u ciklusu dostave; null kad ciklus nema nastavak. */
const SLEDECI_STATUS: Readonly<Record<string, PorudzbinaStatus | null>> = {
  [PorudzbinaStatus.KREIRANA]: PorudzbinaStatus.UPRIPREMI,
  [PorudzbinaStatus.UPRIPREMI]: PorudzbinaStatus.U_DOSTAVI,
  [PorudzbinaStatus.U_DOSTAVI]: PorudzbinaStatus.DOSTAVLJENA,
  [PorudzbinaStatus.DOSTAVLJENA]: null,
  [PorudzbinaStatus.OTKAZANA]: null,
};

/**
 * Detalj jedne porudzbine. Ruta je 'porudzbine/:id'.
 *
 * Prikazani su i pozivi koji menjaju stanje na serveru:
 *   PUT /api/orders/{id}/status
 *   PUT /api/orders/{id}/assign-delivery
 */
@Component({
  selector: 'app-order-detail',
  imports: [AsyncPipe, Card, CurrencyPipe, DatePipe, Loading, RouterLink, StatusLabelPipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly restaurantService = inject(RestaurantService);

  /** Lista restorana se cita jednom da se ID restorana pretvori u naziv. */
  private readonly restorani = toSignal(this.restaurantService.getAll(), { initialValue: [] });

  protected readonly vm$: Observable<DetaljVM> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) =>
      this.orderService.getById(id).pipe(
        map((porudzbina): DetaljVM => ({ porudzbina, greska: null, ucitava: false })),
        startWith(POCETNO),
        catchError((error: unknown) =>
          of({ ...POCETNO, ucitava: false, greska: UserService.messageFrom(error) }),
        ),
      ),
    ),
  );

  protected readonly poruka = signal<string | null>(null);
  protected readonly greska = signal<string | null>(null);
  protected readonly dostava = signal<Dostava | null>(null);
  protected readonly izmena = signal(false);

  /**
   * Stavke porudzbine nose samo ID jela, pa se naziv uzima iz menija
   * restorana kojem porudzbina pripada.
   */
  private readonly meni$ = this.vm$.pipe(
    map((vm) => vm.porudzbina?.restoranId),
    switchMap((restoranId) =>
      restoranId === undefined ? of<Jelo[]>([]) : this.restaurantService.getMenu(restoranId),
    ),
    catchError(() => of<Jelo[]>([])),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly ucitaniMeni = toSignal(this.meni$, { initialValue: [] });

  protected jeloNaziv(id: number): string {
    return this.ucitaniMeni().find((j) => j.id === id)?.naziv ?? 'Jelo';
  }

  /**
   * Endpoint za promenu statusa vraca azuriranu porudzbinu, pa novu vrednost
   * cuvamo ovde umesto da je ponovo vadimo sa servera.
   */
  protected readonly azurirana = signal<Porudzbina | null>(null);

  protected restoranNaziv(id: number): string {
    return this.restorani().find((r) => r.id === id)?.naziv ?? 'Restoran';
  }

  protected sledeciStatus(trenutni: PorudzbinaStatus): PorudzbinaStatus | null {
    return SLEDECI_STATUS[trenutni] ?? null;
  }

  protected setStatus(id: number, novi: PorudzbinaStatus): void {
    this.poruka.set(null);
    this.greska.set(null);
    this.izmena.set(true);

    this.orderService.updateStatus(id, novi).subscribe({
      next: (porudzbina) => {
        this.izmena.set(false);
        this.azurirana.set(porudzbina);
        this.poruka.set(`Status narudžbine je sada "${PORUDZBINA_STATUS_LABELS[porudzbina.status]}".`);
      },
      error: (error: unknown) => {
        this.izmena.set(false);
        this.greska.set(UserService.messageFrom(error));
      },
    });
  }

  protected dodeliDostavljaca(id: number, dostavljacId: number): void {
    this.poruka.set(null);
    this.greska.set(null);
    this.izmena.set(true);

    // Jedini endpoint koji backendu vraca objekat Dostava.
    this.orderService.assignDelivery(id, dostavljacId).subscribe({
      next: (dostava) => {
        this.izmena.set(false);
        this.dostava.set(dostava);
        this.poruka.set('Dostavljač je dodeljen i uskoro stiže po vašu porudžbinu.');
      },
      error: (error: unknown) => {
        this.izmena.set(false);
        this.greska.set(UserService.messageFrom(error));
      },
    });
  }
}
