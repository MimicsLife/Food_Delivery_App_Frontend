import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { Korisnik } from '../../core/models/korisnik.model';
import { UserService } from '../../core/services/user.service';
import { Card } from '../../shared/components/card/card';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { Zippy } from '../../shared/components/zippy/zippy';

/**
 * Admin pregled korisnika: GET /api/users.
 * Ova ruta je pod `authenticated` na gatewayu, zato je zasticena guardom.
 */
@Component({
  selector: 'app-users',
  imports: [AsyncPipe, Card, DatePipe, InitialsPipe, StatusLabelPipe, Zippy],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  private readonly userService = inject(UserService);

  protected readonly korisnici$ = this.userService.getAll();
  protected readonly izabrani = signal<Korisnik | null>(null);
  protected readonly pretraga = signal('');

  protected setIzabrani(k: Korisnik | null): void {
    this.izabrani.set(this.izabrani() === k ? null : k);
  }

  protected filtriraj(lista: Korisnik[]): Korisnik[] {
    const q = this.pretraga().trim().toLowerCase();
    if (!q) {
      return lista;
    }
    return lista.filter(
      (k) =>
        k.ime.toLowerCase().includes(q) ||
        k.prezime.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q),
    );
  }

  protected jeIzabran(k: Korisnik): boolean {
    return this.izabrani()?.id === k.id;
  }
}
