import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Korisnik, KorisnikTip } from '../../core/models/korisnik.model';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ForbiddenValueDirective } from '../../shared/directives/forbidden-value.directive';

/**
 * Registracija - template-driven pristup.
 *
 * Kontroleri se ne prave u TypeScript-u: NgModel ih kreira na osnovu imena
 * polja u templateu i dvosmernim vezivanjem ih sinhronizuje sa modelom.
 * Svaki element sa ngModel MORA imati `name` atribut - on identifikuje
 * FormControl objekat unutar forme.
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, ForbiddenValueDirective],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly tipovi = Object.values(KorisnikTip);

  protected readonly model: Korisnik = {
    ime: '',
    prezime: '',
    email: '',
    sifra: '',
    tip: KorisnikTip.KUPAC,
    adrese: [],
    uloge: [],
  };

  protected readonly poruka = signal<string | null>(null);
  protected readonly greska = signal<string | null>(null);
  protected readonly slanje = signal(false);

  protected onSubmit(forma: NgForm): void {
    this.poruka.set(null);
    this.greska.set(null);

    if (forma.invalid) {
      this.greska.set('Proverite označena polja.');
      return;
    }

    this.slanje.set(true);
    this.userService
      .register({
        ime: this.model.ime,
        prezime: this.model.prezime,
        email: this.model.email,
        // `sifra` je opciono polje na modelu, a registracija ga zahteva.
        sifra: this.model.sifra ?? '',
        tip: this.model.tip,
      })
      .subscribe({
        next: (k: Korisnik) => {
          this.slanje.set(false);
          this.poruka.set(`Dobrododosli, ${k.ime}! Uspesna registracija.`);

          // Nalog je upravo napravljen, pa se odmah uspostavlja i sesija:
          // korisnik ne mora ponovo da unosi email i lozinku da bi narucio.
          const zapisi = k.id !== undefined && k.id !== null ? of(k) : this.nadjiPoEmailu(k.email);

          zapisi.subscribe({
            next: (nadjeni) => {
              if (nadjeni) {
                this.auth.login(nadjeni);
                this.router.navigate(['/restorani']);
                return;
              }
              forma.resetForm({ ime: '', prezime: '', email: '', sifra: '', tip: KorisnikTip.KUPAC });
            },
            error: () =>
              forma.resetForm({ ime: '', prezime: '', email: '', sifra: '', tip: KorisnikTip.KUPAC }),
          });
        },
        error: (error: unknown) => {
          this.slanje.set(false);
          this.greska.set(UserService.messageFrom(error));
        },
      });
  }

  /** Backend ponekad vrati registrovanog korisnika bez `id`; tada ga dobija listingom. */
  private nadjiPoEmailu(email: string): Observable<Korisnik | null> {
    return this.userService.findByEmail(email).pipe(map((korisnici) => korisnici[0] ?? null));
  }

  protected nastavi(): void {
    this.router.navigate(['/restorani']);
  }
}
