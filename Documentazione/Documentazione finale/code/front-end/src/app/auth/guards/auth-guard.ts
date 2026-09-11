import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia che protegge le rotte che richiedono autenticazione.
 * Permette l'accesso solo agli utenti loggati.
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se l'utente è loggato (ha il token), lascialo passare
  if (authService.isLoggedIn()) {
    return true; 
  }

  // Se non è loggato, blocca la navigazione e reindirizza in modo sicuro
  return router.createUrlTree(['/login']);
};
