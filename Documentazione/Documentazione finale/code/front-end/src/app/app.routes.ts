import { Routes } from '@angular/router';
import { Login } from './core-auth/components/login/login';
import { authGuard } from './core-auth/guards/auth-guard';

export const routes: Routes = [
  // Redirect di default
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Rotta pubblica per l'autenticazione
  { path: 'login', title: 'Login', component: Login },

  // ==========================================================
  // MODULO ISSUE (Lazy Loaded e Protette da AuthGuard)
  // ==========================================================
  
  { 
    path: 'issues', 
    title: 'Elenco Segnalazioni',
    loadComponent: () => import('./issue/components/issue-list/issue-list.component').then(c => c.IssueListComponent),
 //   canActivate: [authGuard] 
  },
  { 
    // DEVE STARE PRIMA DI :id
    path: 'issues/new', 
    title: 'Nuova Segnalazione',
    loadComponent: () => import('./issue/components/issue-form/issue-form.component').then(c => c.IssueFormComponent),
  //  canActivate: [authGuard] 
  },
  { 
    path: 'issues/edit/:id', 
    title: 'Modifica Segnalazione',
    loadComponent: () => import('./issue/components/issue-form/issue-form.component').then(c => c.IssueFormComponent),
    //   canActivate: [authGuard] 
  },
  { 
    path: 'issues/:id', 
    title: 'Dettaglio Segnalazione',
    loadComponent: () => import('./issue/components/issue-detail/issue-detail.component').then(c => c.IssueDetailComponent),
 //   canActivate: [authGuard] 
  },

  // Fallback se la rotta digitata non esiste
  { path: '**', redirectTo: 'issues' }
];
