// ------------------------------------------------
// APP / AUTH / GUARDS / AUTH GUARD
// ------------------------------------------------

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';





/** Consente l'accesso alle rotte protette solo con una sessione locale valida. */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; 
  }

  // Restituiamo un UrlTree invece di navigare manualmente: il Router mantiene il controllo del ciclo di routing.
  return router.createUrlTree(['/login']);
};
