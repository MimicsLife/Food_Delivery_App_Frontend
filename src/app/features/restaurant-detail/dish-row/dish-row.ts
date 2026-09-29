import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Jelo } from '../../../core/models/restoran.model';
import { CartService } from '../../../core/services/cart.service';

/**
 * Red u meniju restorana.
 *
 * Ovde se koriste @Input i @Output DEKORATORI (ne input()/output() signali):
 *   @Input  - roditelj prosledjuje podatke dete komponenti
 *   @Output - dete komponenta salje dogadjaj roditeljskoj komponenti
 *
 * Dvosmerno vezivanje (ngModel) ovde nije primenjeno jer kolicina pripada
 * zajednickoj korpi (CartService), a ne samo ovom redu.
 */
@Component({
  selector: 'app-dish-row',
  imports: [UpperCasePipe, CurrencyPipe],
  templateUrl: './dish-row.html',
  styleUrl: './dish-row.css',
})
export class DishRow {
  /** Podatak koji roditelj prosledjuje: [jelo]="jelo" */
  @Input({ required: true }) jelo!: Jelo;
  @Input() restoranId?: number;
  @Input() ocena = 0;

  /** Dogadjaj koji dete komponenta salje roditeljskoj: (dodato)="onAdded($event)" */
  @Output() dodato = new EventEmitter<Jelo>();

  constructor(private readonly cart: CartService) {}

  protected get uKorpi(): number {
    const id = this.jelo.id;
    if (id === undefined) {
      return 0;
    }
    return this.cart.items().find((i) => i.jeloId === id)?.kolicina ?? 0;
  }

  protected add(): void {
    if (this.jelo.id !== undefined) {
      this.dodato.emit(this.jelo);
    }
  }
}
