import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor kao funkcija (HttpInterceptorFn). Presrece odgovor servera,
 * evidentira uspesne i neuspesne zahteve, i neuspehe pretvara u
 * razumljivu poruku.
 *
 * Observer se ovde NE registruje sa subscribe() (to bi pokrenulo novi
 * zahtev) nego se primenjuje operator tap() preko pipe().
 */
export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  console.log('[HTTP] ->', req.method, req.url);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log('[HTTP] <-', req.url, event.status);
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        console.warn(
          `[HTTP] !! ${req.method} ${req.url} -> ${error.status} ${error.statusText}`,
        );
      }
      return throwError(() => error);
    }),
  );
}
