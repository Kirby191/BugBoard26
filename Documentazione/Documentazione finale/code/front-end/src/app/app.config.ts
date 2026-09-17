// ------------------------------------------------
// APP / APP.CONFIG
// ------------------------------------------------

import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './auth/interceptors/jwt-interceptor';
import { errorInterceptor } from './auth/interceptors/error-interceptor';


import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

/*
 * La configurazione centrale compone routing, HTTP e localizzazione.
 * Gli interceptor vengono registrati qui per applicare le stesse regole
 * a tutte le chiamate effettuate dai servizi dell'applicazione.
 */
registerLocaleData(localeIt, 'it-IT');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),

    { provide: LOCALE_ID, useValue: 'it-IT' }
  ]
};
