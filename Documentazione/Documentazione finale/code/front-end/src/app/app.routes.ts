import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Login } from './auth/components/login/login.component';
import { authGuard } from './auth/guards/auth-guard';
import { adminGuard } from './auth/guards/admin-guard';
import { guestGuard } from './auth/guards/guest-guard';

export const routes: Routes = [
  // ==========================================================
  // ROTTA DI DEFAULT (Redirect dinamico in base al login)
  // ==========================================================
  { 
    path: '', 
    pathMatch: 'full',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isLoggedIn() ? '/dashboard' : '/login';
    }
  },
  
  // 2. ROTTA PUBBLICA PROTETTA
  { 
    path: 'login', 
    title: 'Login', 
    component: Login,
    canActivate: [guestGuard] 
  },
  
  { 
    path: 'admin/register', 
    title: 'Creazione Utenze',
    loadComponent: () => import('./auth/components/register/register.component').then(c => c.RegisterComponent),
    canActivate: [authGuard, adminGuard] 
  },
  // ==========================================================
  // MODULO: DASHBOARD
  // ==========================================================
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./dashboard-query/components/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },

  // ==========================================================
  // MODULO PROJECT (Lazy Loaded e Protette da Guards)
  // ==========================================================
  { 
    path: 'projects', 
    title: 'Elenco Progetti',
    loadComponent: () => import('./issue/components/project-list/project-list.component').then(c => c.ProjectListComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'projects/new', 
    title: 'Nuovo Progetto',
    loadComponent: () => import('./issue/components/project-form/project-form.component').then(c => c.ProjectFormComponent),
    canActivate: [authGuard, adminGuard] // REQUISITO: Solo gli Admin possono creare progetti
  },
  { 
    path: 'projects/edit/:id', 
    title: 'Modifica Progetto',
    loadComponent: () => import('./issue/components/project-form/project-form.component').then(c => c.ProjectFormComponent),
    canActivate: [authGuard, adminGuard] // REQUISITO: Solo gli Admin possono modificare progetti
  },
  { 
    path: 'projects/:id', 
    title: 'Dettaglio Progetto',
    loadComponent: () => import('./issue/components/project-detail/project-detail.component').then(c => c.ProjectDetailComponent),
    canActivate: [authGuard] 
  },

  // ==========================================================
  // MODULO ISSUE (Lazy Loaded e Protette da AuthGuard)
  // ==========================================================
  { 
    path: 'issues', 
    title: 'Elenco Segnalazioni',
    loadComponent: () => import('./issue/components/issue-list/issue-list.component').then(c => c.IssueListComponent),
    canActivate: [authGuard] 
  },
  { 
    // DEVE STARE PRIMA DI :id
    path: 'issues/new', 
    title: 'Nuova Segnalazione',
    loadComponent: () => import('./issue/components/issue-form/issue-form.component').then(c => c.IssueFormComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'issues/edit/:id', 
    title: 'Modifica Segnalazione',
    loadComponent: () => import('./issue/components/issue-form/issue-form.component').then(c => c.IssueFormComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'issues/:id', 
    title: 'Dettaglio Segnalazione',
    loadComponent: () => import('./issue/components/issue-detail/issue-detail.component').then(c => c.IssueDetailComponent),
    canActivate: [authGuard] 
  },

  { path: '**', redirectTo: 'dashboard' }
];