import { Component, booleanAttribute, input } from '@angular/core';

/**
 * Opsta kartica koja prikazuje prosledjeni sadrzaj - content projection.
 * Vrstica naslova i podnaslov se uzimaju iz @Input-a, a sve izmedu
 * <ng-content> ostaje sadrzaj koji je kreiran izvan ove komponente.
 *
 * Upotreba:
 *   <app-card naslov="Restoran" [selektovan]="r.otvoren">
 *     <p>Ovaj <b>paragraf</b> pripada pozivacu, ne ovoj komponenti.</p>
 *   </app-card>
 */
@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  readonly naslov = input<string>('');
  readonly podnaslov = input<string>('');
  /** booleanAttribute omogucava pisanje [selektovan]="uslovo" umesto =true/false. */
  readonly selektovan = input(false, { transform: booleanAttribute });
  readonly bezOkvira = input(false, { transform: booleanAttribute });
}
