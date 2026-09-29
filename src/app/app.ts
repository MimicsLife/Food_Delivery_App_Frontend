import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

/**
 * Korenska komponenta: navigacija + <router-outlet> na kom se ucitavaju
 * komponente iz definisanih ruta.
 */
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);

  protected readonly brojUKorpi = this.cart.count;

  protected odjaviSe(): void {
    this.auth.logout();
  }
}
