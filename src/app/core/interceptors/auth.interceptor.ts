import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPublicPath } from '../api.config';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor u klasi (HttpInterceptor). Dodaje HTTP Basic zaglavlje svakom
 * zahtevu koji to zahteva, tako da komponente ne moraju da misle na to.
 *
 * Zaglavlje nosi kredencijal APLIKACIJE (api.config.ts), a ne kredencijale
 * ulogovanog korisnika: gateway prihvata samo staticki admin/admin, pa bi
 * slanje korisnickog para dalo 401 svakom ko nije admin.
 *
 * Instanca zahteva je immutable, pa se izmenjena kopija pravi sa clone().
 * Da bi se koristio, u app.config.ts mora biti:
 *   provideHttpClient(withInterceptorsFromDi())
 *   { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const header = this.auth.authorizationHeader;

    if (!header || isPublicPath(req.method, req.url)) {
      return next.handle(req);
    }

    const authReq = req.clone({
      headers: req.headers.set('Authorization', header),
    });

    return next.handle(authReq);
  }
}
