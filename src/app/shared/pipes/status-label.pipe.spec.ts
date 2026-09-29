import { TestBed } from '@angular/core/testing';
import { PorudzbinaStatus, DostavaStatus } from '../../core/models/porudzbina.model';
import { KorisnikTip } from '../../core/models/korisnik.model';

import { StatusLabelPipe } from './status-label.pipe';

describe('StatusLabelPipe', () => {
  let pipe: StatusLabelPipe;

  beforeEach(() => {
    pipe = new StatusLabelPipe();
  });

  it('creates', () => {
    expect(pipe).toBeTruthy();
  });

  it('translates order status', () => {
    expect(pipe.transform(PorudzbinaStatus.U_DOSTAVI)).toBe('U dostavi');
  });

  it('translates delivery status', () => {
    expect(pipe.transform(DostavaStatus.DODELJENA)).toBe('Dodeljena dostavljacu');
  });

  it('translates user role', () => {
    expect(pipe.transform(KorisnikTip.VLASNIK)).toBe('Vlasnik restorana');
  });

  it('returns empty string for null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('falls back to the raw value for unknown input', () => {
    expect(pipe.transform('NEPOZNATO' as never)).toBe('NEPOZNATO');
  });
});
