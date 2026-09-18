import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-server-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-error-state.component.html',
  styleUrl: './server-error-state.component.scss'
})
export class ServerErrorStateComponent {
  private readonly authService = inject(AuthService, { optional: true });
  // Contesto dinamico (es. 'il progetto', 'le segnalazioni')
  context = input<string>('i dati richiesti');
  
  // Dati tecnici dell'errore provenienti dal Back-End
  errorCode = input<number>(500);
  errorType = input<string>('INTERNAL_SERVER_ERROR');
  errorDetails = input<string>('Errore sconosciuto dal server.');

  readonly retry = output<void>();
  protected readonly isAdmin = computed(() => this.authService?.userRole() === 'ADMIN');
  protected readonly userMessage = computed(() => this.errorCode() === 0
    ? 'Il server non è raggiungibile in questo momento. Controlla la connessione e riprova.'
    : 'Si è verificato un problema temporaneo di comunicazione con il server. Riprova tra poco.');

  retryRequest(): void {
    this.retry.emit();
  }
}
