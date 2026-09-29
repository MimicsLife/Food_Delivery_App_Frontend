import { Directive, forwardRef, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Korisnicki definisan validator za forme (deo 3. prezentacije).
 * Direktiva implementira Validator interfejs i dodaje gresku `forbiddenValue`
 * kad se unesena vrednost poklopi sa zabranjenom.
 *
 * Upotreba u templateu (vrednost se poredi prema velikim/malim slovima):
 *   <input formControlName="email" appForbiddenValue="admin">
 */
@Directive({
  selector: '[appForbiddenValue]',
  providers: [
    {
      provide: NG_VALIDATORS,
      // forwardRef je potreban jer se Validator koristi pre nego sto je definisan.
      useExisting: forwardRef(() => ForbiddenValueDirective),
      multi: true,
    },
  ],
})
export class ForbiddenValueDirective implements Validator {
  /** signal input - vrednost se moze promeniti iz parent templatea. */
  readonly appForbiddenValue = input<string | undefined>(undefined);

  validate(control: AbstractControl): ValidationErrors | null {
    const zabranjena = this.appForbiddenValue();
    if (!zabranjena) {
      return null;
    }
    const vrednost = String(control.value ?? '').trim().toLowerCase();
    if (vrednost === zabranjena.toLowerCase()) {
      return { forbiddenValue: { ulaz: control.value, zabranjena } };
    }
    return null;
  }
}
