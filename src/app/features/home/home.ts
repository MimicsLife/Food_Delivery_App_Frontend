import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { Card } from '../../shared/components/card/card';
import { Zippy } from '../../shared/components/zippy/zippy';

/** Pocetna stranica: linkovi ka glavnim delovima aplikacije. */
@Component({
  selector: 'app-home',
  imports: [Card, RouterLink, Zippy],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly cart = inject(CartService);

  protected readonly uKorpi = this.cart.count;
  protected readonly ukupno = this.cart.total;
}
