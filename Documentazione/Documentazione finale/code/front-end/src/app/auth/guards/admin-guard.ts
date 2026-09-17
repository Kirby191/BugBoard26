// ------------------------------------------------
// APP / AUTH / GUARDS / ADMIN GUARD
// ------------------------------------------------

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';





export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  /*
   * Il ruolo viene verificato insieme al token: avere un ruolo ADMIN
   * memorizzato senza una sessione valida non concede accesso.
   */
  const authService = inject(AuthService);
  const router = inject(Router);

  
  const userRole = localStorage.getItem('user_role');

  
  if (authService.isLoggedIn() && userRole === 'ADMIN') {
    return true;
  }

  
  return router.createUrlTree(['/login']); 
};
