import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

/**
 * Prijava - reactive pristup sa FormBuilder servisom.
 *
 * Nalog se proverava preko user-service (`GET /api/users?email=...`): ako
 * korisnik sa tim emailom postoji i lozinka se poklapa, zapocinje se sesija u
 * AuthService-u. Time prijava radi za BILO KOG registrovanog korisnika -
 * ranije se slala kredencijala iz forme kao Basic zaglavlje, a gateway
 * prihvata samo staticki admin/admin, pa je prijava mogla da prodre samo
 * kao admin (i to uz probu nad tuđim nalogom, `GET /api/users/1/exists`).
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly forma = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    lozinka: ['', [Validators.required, Validators.minLength(2)]],
  });

  protected readonly greska = signal<string | null>(null);
  protected readonly proveravanje = signal(false);

  protected onSubmit(): void {
    this.greska.set(null);

    if (this.forma.invalid) {
      this.forma.markAllAsTouched();
      return;
    }

    const { email, lozinka } = this.forma.getRawValue();
    this.proveravanje.set(true);

    this.userService.findByEmail(email).subscribe({
      next: (korisnici) => {
        this.proveravanje.set(false);

        const korisnik = korisnici[0];
        if (!korisnik) {
          this.greska.set('Ne postoji nalog sa tom email adresom.');
          return;
        }
        if (!AuthService.passwordMatches(korisnik, lozinka)) {
          this.greska.set('Pogrešna lozinka.');
          return;
        }
        if (!this.auth.login(korisnik)) {
          this.greska.set('Nalog nema ID - prijava nije mogla da se završi.');
          return;
        }

        // Povratna ruta koju je guard poslao kao query parametar.
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl ?? '/restorani');
      },
      error: () => {
        this.proveravanje.set(false);
        this.greska.set('Nalog nije mogao da se proveri - server nije dostupan.');
      },
    });
  }
}
