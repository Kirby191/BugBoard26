// -----------------------------------------------------
// APP / AUTH / INTERCEPTORS / ERROR INTERCEPTOR
// -----------------------------------------------------

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Limite massimo di attesa per qualsiasi richiesta HTTP: 5 secondi
  // Rispetta e tutela i vincoli di performance e reattività del sistema, evitando che l'utente resti bloccato in attesa di una risposta.
  const TIMEOUT_LIMIT_MS = 5000;

  return next(req).pipe(
    // 1. Applica il timer. Se il server non risponde entro 5 secondi, lancia un TimeoutError
    timeout(TIMEOUT_LIMIT_MS),
    
    // 2. Cattura qualsiasi errore (HTTP o di Timeout)
    catchError((error: any) => {
      
      if (error instanceof TimeoutError) {
        const timeoutResponse = new HttpErrorResponse({
          error: { 
            status: 504, 
            error: 'GATEWAY_TIMEOUT', 
            message: 'Il server sta impiegando troppo tempo a rispondere. La connessione è stata interrotta.' 
          },
          status: 504,
          statusText: 'Gateway Timeout'
        });
        return throwError(() => timeoutResponse);
      }

      // B. Gestione dei normali errori HTTP (es. 401, 500)
      if (error instanceof HttpErrorResponse) {
        // Un token scaduto invalida la sessione
        if (error.status === 401 || error.status === 403) {
          authService.logout();
        }
      }
      
      return throwError(() => error);
    })
  );
};
