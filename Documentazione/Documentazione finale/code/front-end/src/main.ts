// ------------------------------------------------
// MAIN
// ------------------------------------------------

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Il bootstrap usa la configurazione condivisa, così router e interceptor sono attivi fin dal primo componente.
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
