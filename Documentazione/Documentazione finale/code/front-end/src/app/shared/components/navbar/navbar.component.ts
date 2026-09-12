import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  // Input: Riceve lo stato di autenticazione dall'esterno (Smart Component)
  isLoggedIn = input<boolean>(false);
  
  // NUOVO INPUT: Riceve il ruolo di amministratore per abilitare la pagina di registrazione (Funzionalità 1 e 9)
  isAdmin = input<boolean>(false);

  // Output: Emette un evento quando l'utente clicca su "Logout"
  logoutAction = output<void>();

  /**
   * Gestisce il click sul pulsante di disconnessione delegando la logica al componente padre.
   */
  onLogout(): void {
    this.logoutAction.emit();
  }
}
