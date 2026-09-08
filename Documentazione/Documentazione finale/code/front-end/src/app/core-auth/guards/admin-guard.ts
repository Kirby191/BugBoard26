import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia che protegge le rotte che richiedono autenticazione e ruolo di Amministratore.
 * Permette l'accesso solo all'Amministratore.
 */
export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Nel localStorage abbiamo salvato il ruolo come "ADMIN" o "UTENTE"
  const userRole = localStorage.getItem('user_role');

  // L'utente deve essere loggato E avere il ruolo di ADMIN
  if (authService.isLoggedIn() && userRole === 'ADMIN') {
    return true;
  }

  // Se è loggato ma non è Admin, viene rimandato alla dashboard. 
  return router.createUrlTree(['/login']); 
};
