import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componenti
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NotificationListComponent } from './dashboard-query/components/notification-list/notification-list.component';

// Servizi
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Iniezione del servizio di autenticazione
  protected readonly authService = inject(AuthService);

  /**
   * Metodo invocato quando la Navbar emette l'evento di logout.
   */
  handleLogout(): void {
    this.authService.logout();
  }
}
