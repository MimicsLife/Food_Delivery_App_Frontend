import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PorudzbinaDTO } from '../../core/models/porudzbina.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { ForbiddenValueDirective } from '../../shared/directives/forbidden-value.directive';

/**
 * Forma za slanje porudzbine - reactive pristup.
 *
 * PorudzbinaDTO sa servera ima samo cetiri polja, ali forma je podeljena
 * na ugnjezdene FormGroup grupe (kupac / adresa) sto je prikazano u
 * prezentaciji i omogucava veci broj polja bez razvijanja plosnatog modela.
 */
@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, ForbiddenValueDirective],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly items = this.cart.items;
  protected readonly prazna = this.cart.isEmpty;
  protected readonly ukupno = this.cart.total;
  protected readonly restoranId = this.cart.restoranId;
  protected readonly potvrda = signal<string | null>(null);
  protected readonly greska = signal<string | null>(null);
  protected readonly slanje = signal(false);

  /**
   * FormBuilder servis se ubacuje kroz Dependency Injection u konstruktoru
   * i njime se prave kontroleri; ekvivalent ručnom pisanju je:
   *   new FormGroup({ ime: new FormControl('', Validators.required) })
   */
  protected readonly forma = this.fb.group({
    kupac: this.fb.group({
      ime: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      // Korisnicki validator (appForbiddenValue) se dodje u templateu.
      telefon: ['', [Validators.pattern(/^[0-9+\s-]{6,20}$/)]],
    }),
    adresa: this.fb.group({
      // Ugnjezdena grupa - backend DTO nema ove detalje, ali ih ima model Adresa.
      ulica: ['', [Validators.required, Validators.minLength(3)]],
      broj: ['', [Validators.required, Validators.pattern(/^[0-9]+[a-zA-Z]?$/)]],
      grad: ['', [Validators.required]],
      napomena: [''],
    }),
  });

  protected get kupac(): FormGroup {
    return this.forma.get('kupac') as FormGroup;
  }

  protected get adresa(): FormGroup {
    return this.forma.get('adresa') as FormGroup;
  }

  /**
   * patchValue azurira samo navedena polja, ostala ostaju nepromenjena.
   * Podaci se uzimaju iz sesije, pa se forma popunjava bez ponovnog unosa.
   */
  protected preuzmiAdresu(korisnikId: number): void {
    this.userService.getById(korisnikId).subscribe({
      next: (k) => {
        this.forma.patchValue({
          kupac: { ime: k.ime, email: k.email },
          adresa: {
            ulica: k.adrese?.[0]?.ulica ?? '',
            broj: k.adrese?.[0]?.broj ?? '',
            grad: k.adrese?.[0]?.grad ?? '',
          },
        });
      },
      error: () => this.greska.set('Korisnik nije pronadjen.'),
    });
  }

  /** Uloga se popunjava iz sesije da korisnik ne mora da unosi podatke ponovo. */
  ngOnInit(): void {
    const kupacId = this.auth.currentUserId();
    if (kupacId !== null) {
      this.preuzmiAdresu(kupacId);
    }
  }

  protected onSubmit(): void {
    this.greska.set(null);
    this.potvrda.set(null);

    if (this.forma.invalid) {
      this.oznaciSve();
      this.greska.set('Forma nije ispravna - proverite označena polja.');
      return;
    }

    const idRestorana = this.restoranId();
    if (idRestorana === null) {
      this.greska.set('Korpa je prazna.');
      return;
    }

    // Porudzbina se salje u ime ulogovanog kupca, ne u ime fiksnog "kupac 1".
    const kupacId = this.auth.currentUserId();
    if (kupacId === null) {
      this.greska.set('Prijavite se da biste naručili.');
      return;
    }

    // Backend ocebuje samo cetiri polja; ostatak forme je za nas.
    const vrednosti = this.forma.getRawValue();
    const dto: PorudzbinaDTO = {
      kupacId,
      restoranId: idRestorana,
      adresaDostave: `${vrednosti.adresa.ulica}, ${vrednosti.adresa.broj}, ${vrednosti.adresa.grad}`,
      stavke: this.cart.itemsForOrder(),
    };

    this.slanje.set(true);
    this.orderService.create(dto).subscribe({
      next: (porudzbina) => {
        this.slanje.set(false);
        this.cart.clear();
        this.potvrda.set(`Porudzbina #${porudzbina.id} je primljena.`);
        this.router.navigate(['/porudzbine', porudzbina.id]);
      },
      error: (error: unknown) => {
        this.slanje.set(false);
        this.greska.set(UserService.messageFrom(error));
      },
    });
  }

  /** Ime korisnika koje je uneo u zaglavlju (preko AuthService-a). */
  protected prijavljeniKorisnik(): string {
    return this.auth.currentUser() ?? 'nepoznato';
  }

  private oznaciSve(): void {
    this.forma.markAllAsTouched();
  }
}
