import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Wildcard ruta '**' - otvara ovu stranicu za svaki nepostojeći URL. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <h1>404</h1>
      <p>Ova stranica ne postoji.</p>
      <a class="btn btn--primary" routerLink="/">Nazad na početnu</a>
    </section>
  `,
  styles: `
    .not-found {
      text-align: center;
      padding: 3rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .not-found h1 {
      margin: 0;
      font-size: 4rem;
      color: #f97316;
    }
    .not-found p {
      margin: 0 0 1rem;
      color: #64748b;
    }
  `,
})
export class NotFound {}
