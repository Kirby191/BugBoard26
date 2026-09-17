// -----------------------------------------------------
// APP / AUTH / INTERCEPTORS / ERROR INTERCEPTOR
// -----------------------------------------------------

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  /*
   * Gli errori di autorizzazione sono gestiti globalmente. I componenti
   * ricevono comunque l'errore originale per poter mostrare il proprio feedback.
   */
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Un token scaduto o non autorizzato invalida la sessione per tutta l'applicazione.
      if (error.status === 401 || error.status === 403) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
