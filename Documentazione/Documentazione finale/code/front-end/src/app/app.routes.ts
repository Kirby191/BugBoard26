import { Routes } from '@angular/router';
import { Login } from './core-auth/components/login/login';
import { authGuard } from './core-auth/guards/auth-guard';

export const routes: Routes = [
  // Redirect di default
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Rotta pubblica per l'autenticazione
  { path: 'login', title: 'Login', component: Login },

  // ==========================================================
  // MODULO PROJECT (Lazy Loaded e Protette da AuthGuard, AdminGuard)
  // ==========================================================
  {
    path: 'projects',
    title: 'Elenco Progetti',
    // Lazy loading del componente
  //  loadComponent: () => import('./issue/components/project-list/project-list.component').then(c => c.ProjectListComponent),
    //canActivate: [authGuard]
  },
  {
    path: 'projects/new',
    title: 'Nuovo Progetto',
    // Lazy loading del componente
  //  loadComponent: () => import('./issue/components/project-form/project-form.component').then(c => c.ProjectFormComponent),
    //canActivate: [authGuard, adminGuard]
  },
  {
    path: 'projects/edit/:id',
    title: 'Modifica Progetto',
    // Lazy loading del componente
  //  loadComponent: () => import('./issue/components/project-form/project-form.component').then(c => c.ProjectFormComponent),
    //canActivate: [authGuard, adminGuard]
  }
  {
    path: 'projects/:id',
    title: 'Dettaglio Progetto',
    // Lazy loading del componente
  //  loadComponent: () => import('./issue/components/project-detail/project-detail.component').then(c => c.ProjectDetailComponent),
    //canActivate: [authGuard]
  }

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
