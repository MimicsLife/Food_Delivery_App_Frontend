/**
 * Konfiguracija API adrese.
 *
 * Aplikacija se razvija preko Angular dev servera sa proxy.conf.json, pa su sve
 * putanje relativne ("/api/..."). Browser tako nikad ne vidi poziv kao
 * cross-origin, cime se zaobilazi sto backend uopste nema CORS konfiguraciju.
 *
 * Ako se aplikacija build-uje i sluzi sa drugog porta, promeniti API_BASE_URL
 * u "http://localhost:8765" i na backendu dodati CORS konfiguraciju.
 */
export const API_BASE_URL = '';

/**
 * rute koje api-gateway propustava bez autentifikacije.
 * Izvor: api-gateway/src/main/java/com/fooddelivery/apigateway/config/SecurityConfig.java
 *   1. /api/users/register  -> permitAll
 *   2. GET /api/restaurants -> permitAll   (tacno, bez "/**")
 *   3. GET /api/dishes/**   -> permitAll
 * Sve ostalo (ukljucujuci detalj restorana i meni) trazi autentifikaciju.
 */
export function isPublicPath(method: string, url: string): boolean {
  if (url.startsWith('/api/users/register')) {
    return true;
  }
  if (method.toUpperCase() === 'GET' && url === '/api/restaurants') {
    return true;
  }
  if (method.toUpperCase() === 'GET' && url.startsWith('/api/dishes/')) {
    return true;
  }
  return false;
}

export interface BasicCredential {
  username: string;
  password: string;
}

/**
 * Kredencijal koji api-gateway prihvata - i jedini koji postoji.
 *
 * Gateway nema login endpoint ni JWT: `MapReactiveUserDetailsService` u
 * SecurityConfig-u je popunjen statickim parom admin/admin, pa se na nivou
 * gatewaya NE MOZE razlikovati ulogovani kupac od admina. Zato je ovo
 * kredencijal aplikacije (servisa), a ne korisnika: interceptor ga dodaje
 * svakom zasticenom zahtevu, dok ko je prijavljen u aplikaciji cuva
 * AuthService (sopstvena sesija u localStorage-u).
 *
 * Pravi nacin da ovo nestane je da gateway verifikuje korisnike preko
 * user-service (JWT), sto zahteva promene na backendu.
 */
export const GATEWAY_CREDENTIAL: BasicCredential = { username: 'admin', password: 'admin' };

/** HTTP Basic zaglavlje: base64("korisnik:lozinka"). */
export function basicAuthHeader(credential: BasicCredential): string {
  return `Basic ${btoa(`${credential.username}:${credential.password}`)}`;
}
