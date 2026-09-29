import { Pipe, PipeTransform } from '@angular/core';

/**
 * Vraca inicijale imena i prezimena za prikaz u kružnom avataru.
 * {{ korisnik.ime + ' ' + korisnik.prezime | initials }}
 */
@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(imePrezime: string | null | undefined): string {
    if (!imePrezime) {
      return '';
    }
    return imePrezime
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((deo) => deo.charAt(0).toUpperCase())
      .join('');
  }
}
