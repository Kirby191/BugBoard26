// ---------------------------------------------------
// APP / AUTH / INTERCEPTORS / JWT INTERCEPTOR
// ---------------------------------------------------

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  /*
   * Le richieste restano anonime quando non esiste una sessione; in caso
   * contrario il token viene aggiunto senza mutare l'istanza originale.
   */
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    // Le richieste vengono clonate perché gli HttpRequest di Angular sono immutabili.
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
