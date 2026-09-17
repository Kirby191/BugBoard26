// ------------------------------------------------
// APP / AUTH / GUARDS / GUEST GUARD
// ------------------------------------------------

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';





export const guestGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  /*
   * Le pagine pubbliche non devono essere raggiungibili da una sessione già
   * autenticata: riportiamo l'utente al punto di ingresso operativo.
   */
  const authService = inject(AuthService);
  const router = inject(Router);

  
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  
  return true;
};