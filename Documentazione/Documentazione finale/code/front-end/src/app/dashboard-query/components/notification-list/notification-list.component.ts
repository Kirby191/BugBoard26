import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { NotificationDTO } from '../../models/query-dtos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  // Iniezione dei servizi (Smart Component)
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // Gestione dello stato reattivo tramite Signals
  protected readonly notifications = signal<NotificationDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  
  // Derivazione automatica del contatore per il badge (campanellina)
  protected readonly unreadCount = computed(() => this.notifications().length);

  ngOnInit(): void {
    this.loadNotifications();
  }

  /**
   * Richiede al Query Layer l'elenco delle notifiche non lette dell'utente loggato.
   */
  private loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getUnreadNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Impossibile caricare le notifiche', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Contrassegna la notifica come letta e la rimuove reattivamente dall'interfaccia.
   */
  markAsRead(notificationId: number, event: Event): void {
    // Evita che il click si propaghi se la notifica è cliccabile interamente
    event.stopPropagation(); 

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        // Aggiornamento ottimistico: rimuove la notifica dall'array locale
        // senza dover rifare una chiamata GET al server.
        const updatedList = this.notifications().filter(n => n.id !== notificationId);
        this.notifications.set(updatedList);
      },
      error: (err) => {
        console.error('Errore durante la marcatura della notifica', err);
      }
    });
  }

  /**
   * Naviga verso la vista di dettaglio del bug associato alla notifica.
   * Esempio: se il messaggio contiene "Bug #42", naviga verso /issues/42.
   * 
   * @param message Il messaggio della notifica contenente l'ID del bug
   */
  goToIssue(message: string): void {
    const match = message.match(/#(\d+)/);
    if (match && match[1]) {
      this.router.navigate(['/issues', match[1]]);
    }
  }
}
