import { Routes } from '@angular/router';
import { Login } from './core-auth/components/login/login';
import { authGuard } from './core-auth/guards/auth-guard';
// L'AdminGuard ci servirà per le rotte esclusive (es. creazione utenti o progetti)
// import { adminGuard } from './core-auth/guards/admin-guard';

export const routes: Routes = [
  // Redirect di default: se l'utente naviga su "localhost:4200/", lo mandiamo al login
  { path: '', redirectTo: 'Login', pathMatch: 'full' },
  
  // Rotta pubblica per l'autenticazione
  { path: 'login', title: 'Login', component: Login },

  // Rotta Protetta per il modulo Issue (Lazy Loaded)
  { 
    path: 'issues', 
    title: 'Elenco Segnalazioni',
    // Il Lazy Loading scarica il codice del componente solo quando l'utente visita questa rotta
    loadComponent: () => import('./issue/components/issue-list/issue-list.component')
                            .then(c => c.IssueListComponent),
    // canActivate: [authGuard] // Protezione: accessibile solo se autenticati, in fase di testing è lasciata commentata.
  },

  {
    path: 'issues/:id', 
    title: 'Dettaglio Segnalazione',
    loadComponent: () => import('./issue/components/issue-detail/issue-detail.component').then(c => c.IssueDetailComponent),
    // canActivate: [authGuard]
  },

  // Fallback se la rotta digitata non esiste
  { path: '**', redirectTo: 'login' }
];
