import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CartItem, cartItemSubtotal } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';

/**
 * Korpa. Kolicine se cuvaju u FormArray - nizu kontrolera ciji broj
 * kontrolera menja se u toku rada (dinamicka forma).
 *
 * Kontroleri se prave iz zajednickog stanja korpe, pa izmena u korpi
 * automatski menja i formu, i obrnuto (dvosmerni tok bez ngModel-a).
 */
@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);

  protected readonly items = this.cartService.items;
  protected readonly prazna = this.cartService.isEmpty;
  protected readonly ukupno = this.cartService.total;
  protected readonly restoranNaziv = this.cartService.restoranNaziv;

  /** FormArray kontrolera: po jedan za kolicinu svake stavke. */
  protected readonly stavke: FormArray<FormControl<number>> = new FormArray<FormControl<number>>(
    this.cartService.items().map((item) => this.kontroler(item)),
  );

  private kontroler(item: CartItem): FormControl<number> {
    // Validators.min/max su funkcijske forme istih validatora koje postoje
    // kao atributi (required, min...) u template-driven pristupu.
    return this.fb.control(item.kolicina, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(20)],
    });
  }

  protected subtotal(item: CartItem): number {
    return cartItemSubtotal(item);
  }

  protected update(jeloId: number, value: number): void {
    const broj = Number.isFinite(value) ? Math.max(1, Math.min(20, value)) : 1;
    this.cartService.setQuantity(jeloId, broj);
    this.sinhronizujFormu();
  }

  protected increment(jeloId: number): void {
    this.cartService.increment(jeloId);
    this.sinhronizujFormu();
  }

  protected decrement(jeloId: number): void {
    this.cartService.decrement(jeloId);
    this.sinhronizujFormu();
  }

  protected remove(jeloId: number): void {
    this.cartService.remove(jeloId);
    this.sinhronizujFormu();
  }

  protected clear(): void {
    this.cartService.clear();
    this.sinhronizujFormu();
  }

  private sinhronizujFormu(): void {
    this.stavke.clear();
    for (const item of this.cartService.items()) {
      this.stavke.push(this.kontroler(item));
    }
  }
}
