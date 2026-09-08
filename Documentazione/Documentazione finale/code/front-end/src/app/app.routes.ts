import { Routes } from '@angular/router';
import { Login } from './core-auth/components/login/login';
// commentate poichè l'implementazione delle routes protette è in corso...
// import { authGuard } from './core-auth/guards/auth-guard';
// import { adminGuard } from './core-auth/guards/admin-guard';

export const routes: Routes = [
  // Rotta pubblica
  { path: 'login', title: 'Login', component: Login },

  // Fallback se la rotta non esiste
  { path: '**', redirectTo: 'login' }
];
