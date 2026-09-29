import { Component, input } from '@angular/core';

/** Indikator ucitavanja. Koristi se u @if grani dok se ceka odgovor servera. */
@Component({
  selector: 'app-loading',
  template: `
    <div class="loading" role="status" aria-live="polite">
      <span class="loading__spinner" aria-hidden="true"></span>
      <span class="loading__text">{{ tekst() }}</span>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1.2rem;
      color: #64748b;
    }
    .loading__spinner {
      width: 1.1rem;
      height: 1.1rem;
      border: 2px solid #e2e8f0;
      border-top-color: #f97316;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .loading__text {
      font-size: 0.9rem;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class Loading {
  readonly tekst = input('Ucitavanje...');
}
