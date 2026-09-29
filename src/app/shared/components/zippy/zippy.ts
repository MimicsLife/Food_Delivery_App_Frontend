import { Component, input, output, signal } from '@angular/core';

/**
 * Sklopivi panel. Koristi `output()` signal funkciju (umesto @Output dekoratora)
 * da javi roditeljskoj komponenti kad je panel zatvoren.
 */
@Component({
  selector: 'app-zippy',
  templateUrl: './zippy.html',
  styleUrl: './zippy.css',
})
export class Zippy {
  readonly naslov = input.required<string>();
  readonly panelClosed = output<void>();

  protected readonly otvoren = signal(true);

  protected toggle(): void {
    this.otvoren.update((v) => !v);
    if (!this.otvoren()) {
      this.panelClosed.emit();
    }
  }
}
