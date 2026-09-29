import { Jelo, Kategorija, Restoran } from '../models/restoran.model';
import { Korisnik, KorisnikTip } from '../models/korisnik.model';
import { Porudzbina, PorudzbinaStatus } from '../models/porudzbina.model';

/**
 * Probni podaci. Koriste se samo kada backend nije pokrenut (ili gateway
 * nije podignut), da interfejs ostane pregledan u toku razvoja frontenda.
 */

export const SAMPLE_RESTAURANTS: Restoran[] = [
  {
    id: 1,
    naziv: 'Kod Bate',
    adresa: 'Kralja Petra 12, Beograd',
    telefon: '+381 11 333 2211',
    otvoren: true,
    vlasnikId: 1,
  },
  {
    id: 2,
    naziv: 'Vrtic',
    adresa: 'Nevesimska 40, Beograd',
    telefon: '+381 11 355 8899',
    otvoren: true,
    vlasnikId: 2,
  },
  {
    id: 3,
    naziv: 'Pizzeria Corso',
    adresa: 'Kneza Miloša 7, Novi Sad',
    telefon: '+381 21 555 1212',
    otvoren: false,
    vlasnikId: 3,
  },
];

export const SAMPLE_MENI: Jelo[] = [
  {
    id: 1,
    naziv: 'Margherita',
    opis: 'Tomato, mocarela, bosiljak, maslinovo ulje',
    cena: 890,
    dostupno: true,
    kategorija: { id: 1, naziv: 'Pice' },
  },
  {
    id: 2,
    naziv: 'Capricciosa',
    opis: 'Šunkica, pečurke, masline, mocarela',
    cena: 1120,
    dostupno: true,
    kategorija: { id: 1, naziv: 'Pice' },
  },
  {
    id: 3,
    naziv: 'Punjene paprike',
    opis: 'Paprika punjena belmesom i risottom',
    cena: 950,
    dostupno: false,
    kategorija: { id: 2, naziv: 'Glavna jela' },
  },
  {
    id: 4,
    naziv: 'Cevapi 10 kom',
    opis: 'Lesno meso, somun, crni luk',
    cena: 780,
    dostupno: true,
    kategorija: { id: 2, naziv: 'Glavna jela' },
  },
  {
    id: 5,
    naziv: 'Sok od borovnice',
    opis: 'Svež borovnice, limun',
    cena: 320,
    dostupno: true,
    kategorija: { id: 3, naziv: 'Pića' },
  },
];

export const SAMPLE_KATEGORIJE: Kategorija[] = [
  { id: 1, naziv: 'Pice' },
  { id: 2, naziv: 'Glavna jela' },
  { id: 3, naziv: 'Pića' },
];

export const SAMPLE_USERS: Korisnik[] = [
  {
    id: 1,
    ime: 'Jovan',
    prezime: 'Petrovic',
    email: 'jovan@example.com',
    tip: KorisnikTip.KUPAC,
    datumRegistracije: '2026-01-12T09:15:00',
    adrese: [{ id: 1, grad: 'Beograd', ulica: 'Kralja Petra', broj: '12' }],
    uloge: [{ id: 1, naziv: 'ROLE_KUPAC' }],
  },
  {
    id: 2,
    ime: 'Milica',
    prezime: 'Nikolic',
    email: 'milica@example.com',
    tip: KorisnikTip.DOSTAVLJAC,
    datumRegistracije: '2026-02-03T14:40:00',
    adrese: [],
    uloge: [{ id: 2, naziv: 'ROLE_DOSTAVLJAC' }],
  },
  {
    id: 3,
    ime: 'Ana',
    prezime: 'Jovanovic',
    email: 'ana@example.com',
    tip: KorisnikTip.VLASNIK,
    datumRegistracije: '2026-03-21T18:05:00',
    adrese: [],
    uloge: [{ id: 3, naziv: 'ROLE_VLASNIK' }],
  },
];

export const SAMPLE_ORDERS: Porudzbina[] = [
  {
    id: 1,
    kupacId: 1,
    restoranId: 1,
    ukupnaCena: 1670,
    status: PorudzbinaStatus.U_DOSTAVI,
    datum: '2026-09-27T19:24:00',
    stavke: [
      { id: 1, jeloId: 1, kolicina: 1, cenaPoJedinici: 890 },
      { id: 2, jeloId: 5, kolicina: 1, cenaPoJedinici: 320 },
    ],
  },
  {
    id: 2,
    kupacId: 1,
    restoranId: 2,
    ukupnaCena: 2340,
    status: PorudzbinaStatus.DOSTAVLJENA,
    datum: '2026-09-20T12:02:00',
    stavke: [
      { id: 3, jeloId: 4, kolicina: 2, cenaPoJedinici: 780 },
      { id: 4, jeloId: 2, kolicina: 1, cenaPoJedinici: 780 },
    ],
  },
];
