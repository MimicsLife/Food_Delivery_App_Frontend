import { Pipe, PipeTransform } from '@angular/core';

import {
  DOSTAVA_STATUS_LABELS,
  DostavaStatus,
  PORUDZBINA_STATUS_LABELS,
  PorudzbinaStatus,
} from '../../core/models/porudzbina.model';
import { KORISNIK_TIP_LABELS, KorisnikTip } from '../../core/models/korisnik.model';

/**
 * Korisnicki definisan pipe: prevodi vrednost enuma u coveku razumljivu
 * oznaku. Poziva se u templateu kao {{ vrednost | statusLabel }} i
 * automatski se preracunava kad se promeni ulazna vrednost.
 *
 * Pipe je cist - nema pristupa servisima ni globalnom stanju.
 */
@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(value: PorudzbinaStatus | DostavaStatus | KorisnikTip | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    const labels: Record<string, string> = {
      ...PORUDZBINA_STATUS_LABELS,
      ...DOSTAVA_STATUS_LABELS,
      ...KORISNIK_TIP_LABELS,
    };
    return labels[value] ?? String(value);
  }
}
