# NWP Frontend - Dostava hrane

Angular 22 frontend za projekat "Food Delivery App" (Spring Boot mikroservisi).

## Pokretanje

```bash
npm install
npm start          # ng serve --proxy-config proxy.conf.json
npm start:no-proxy # ng serve bez proxy-ja (svi pozivi padaju na probne podatke)
```

Aplikacija se otvara na `http://localhost:4200`.

`npm start` prosledjuje zahteve sa `/api` na `http://localhost:8765` (api-gateway),
sto zaobilazi CORS jer backend nema `CorsConfig`.

## Backend

Preporuceni redosled iz backend projekta:

```
config-server:8888 -> eureka-server:8761 -> gateway:8765
  -> user-service:8001, restaurant-service:8002, order-service:8003
```

Pune instrukcije su u `Food_Delivery_App-main/README.md`.

Ako backend nije pokrenut, frontend ne pada - prikazuje probne podatke
i poruku o tome na vrhu liste restorana.

## Kredencijali

Backend nema login endpoint niti JWT. Gateway koristi staticki HTTP Basic
preko `MapReactiveUserDetailsService`: **`admin` / `admin`**.

| Ruta | Autenticirana? |
|------|----------------|
| `POST /api/users/register` | ne |
| `GET /api/restaurants` | ne (tacno, bez `/**`) |
| `GET /api/dishes/**` | ne |
| sve ostalo (`/api/restaurants/{id}`, `/menu`, `/api/users`, `/api/orders`) | da |

Zato `authGuard` proverava samo da li su kredencijali uneseni, a ne da li ih
server prihvata - uspeh se vidi po tome da li zahtev vraca 401.

## Struktura

```
src/app/
  core/
    api.config.ts        javne rute + base URL
    models/              TS interfejsi koji odgovaraju Java DTO-ima
    services/            Auth, User, Restaurant, Order, Cart + probni podaci
    interceptors/        AuthInterceptor (klasa), loggingInterceptor (funkcija)
    guards/              authGuard
  shared/
    components/          Card, Zippy, Rating, Loading
    pipes/               StatusLabelPipe, InitialsPipe
    directives/          ForbiddenValueDirective
  features/              home, restaurants, restaurant-detail, cart, checkout,
                         orders, order-detail, users, login, register, not-found
```

## Rute

| Putanja | Komponenta | Guard |
|---------|-----------|-------|
| `/` | Home | - |
| `/restorani` | Restaurants | - |
| `/restorani/:id` | RestaurantDetail | - |
| `/korpa` | Cart | - |
| `/porudzba` | Checkout | da |
| `/porudzbine` | Orders | da |
| `/porudzbine/:id` | OrderDetail | da |
| `/korisnici` | Users | da |
| `/login` | Login | - |
| `/registracija` | Register | - |
| `**` | NotFound | - |

## Poznata ogranicenja

- `checkout` hardkoduje `kupacId: 1` jer backend nema sesiju ni tokene.
- Backend nema polje `ocenu` restorana; ocene u listi su demo vrednosti.
- `GET /api/categories` ne prolazi kroz gateway (nema predikata za taj path),
  pa se kategorije čitaju preko `/restaurant-service/api/categories`
  (discovery locator). Putanja nije verifikovana na pokrenutom backendu.
- Lozinke se čuvaju u `localStorage` pod ključem `nwp.credentials` u plain
  tekstu, jer ih backend tako vraća. Korpa je pod `nwp.cart`.

## Testovi

```bash
npm test
```

21 test pokriva `CartService`, `AuthService`, `StatusLabelPipe` i `App` šablon.
