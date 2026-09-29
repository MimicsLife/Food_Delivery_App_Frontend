import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * canActivate guard (CanActivateFn). Ruta se aktivira samo ako je korisnik
 * prijavljen; inace se vraca preusmerenje na /login, uz povratnu rutu
 * (returnUrl) da korisnik posle logovanja nastavi gde je stao.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
