import { Component, computed, input, output } from '@angular/core';

/**
 * Zvezdice za ocenu restorana.
 * `input()` prima vrednost od roditelja, `output()` javlja novu vrednost.
 * computed() daje tekstualni prikaz bez ponovnog racunanja logike u templateu.
 */
@Component({
  selector: 'app-rating',
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class Rating {
  readonly ocena = input(0);
  readonly ocenjivo = input(false);
  readonly ocenaPromenjena = output<number>();

  protected readonly zvezdice = [1, 2, 3, 4, 5];

  protected readonly prikaz = computed(() => this.ocena().toFixed(1).replace('.', ','));

  protected set(value: number): void {
    if (this.ocenjivo()) {
      this.ocenaPromenjena.emit(value);
    }
  }
}
