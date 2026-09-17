// ------------------------------------------------
// APP / APP
// ------------------------------------------------

import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';


import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NotificationListComponent } from './dashboard-query/components/notification-list/notification-list.component';


import { AuthService } from './auth/services/auth.service';
import { ModalComponent } from './shared/components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationListComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // La shell condivide autenticazione, navbar, notifiche e modal di sessione.
  protected readonly authService = inject(AuthService);

  // Il template usa il ruolo solo per mostrare le azioni amministrative.
  isAdmin(): boolean {
  return localStorage.getItem('user_role') === 'ADMIN';
  }

  // L'evento della navbar viene delegato al servizio, che pulisce token e listener.
  handleLogout(): void {
    this.authService.logout();
  }
}
