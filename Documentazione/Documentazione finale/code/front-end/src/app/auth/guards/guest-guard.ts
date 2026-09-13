import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia inversa all'AuthGuard.
 * Impedisce agli utenti GIA' loggati di visitare la pagina di Login o Register.
 */
export const guestGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se l'utente HA il token, non ha senso che veda il login: lo rimandiamo alla dashboard
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  // Se NON è loggato, lo lasciamo passare per fare il login
  return true;
};