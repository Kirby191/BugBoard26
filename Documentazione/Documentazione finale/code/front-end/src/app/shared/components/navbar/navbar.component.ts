// ---------------------------------------------------
// APP / SHARED / COMPONENTS / NAVBAR / NAVBAR
// ---------------------------------------------------

import { Component, input, output, signal, HostListener, ElementRef, inject } from '@angular/core';
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
  isLoggedIn = input<boolean>(false);
  isAdmin = input<boolean>(false);
  logoutAction = output<void>();

  private readonly elementRef = inject(ElementRef);
  isAdminMenuOpen = signal<boolean>(false);

  // ----------------------------------------------------------------
  // Menu amministratore
  // ----------------------------------------------------------------
  toggleAdminMenu(): void {
    this.isAdminMenuOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Il click globale chiude il menu solo quando avviene fuori dal suo contenitore.
    const adminDropdown = this.elementRef.nativeElement.querySelector('.dropdown-container');
    if (adminDropdown && !adminDropdown.contains(event.target as Node)) {
      this.isAdminMenuOpen.set(false);
    }
  }

  // ----------------------------------------------------------------
  // Comunicazione con il componente shell
  // ----------------------------------------------------------------
  onLogout(): void {
    this.logoutAction.emit();
  }
}