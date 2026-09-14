import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NotificationService } from '../../services/notification.service';
import { NotificationDTO } from '../../models/query-dtos';
import { ModalComponent } from '../../../shared/components/modal/modal.component'; // <-- Import Modale aggiunto

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected readonly notifications = signal<NotificationDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isPanelOpen = signal<boolean>(false);
  protected readonly unreadCount = computed(() => this.notifications().length);

  // --- STATO DEL MODALE NOTIFICA ---
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly selectedNotification = signal<NotificationDTO | null>(null);

  ngOnInit(): void {
    this.loadNotifications();
  }

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

  togglePanel(): void {
    // RIMOSSO event.stopPropagation() per risolvere il conflitto visivo con le Azioni Admin
    this.isPanelOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Controlliamo in modo granulare l'area del click
    const bellContainer = this.elementRef.nativeElement.querySelector('.notification-wrapper');
    if (bellContainer && !bellContainer.contains(event.target as Node)) {
      this.isPanelOpen.set(false);
    }
  }

  // Azione rapida: Click sulla spunta (V)
  markAsReadQuick(notificationId: number, event: Event): void {
    event.stopPropagation(); // Qui serve per non far scattare il click sulla riga intera
    this.executeMarkAsRead(notificationId);
  }

  // Apre il modale di interazione cliccando in un punto qualsiasi della notifica
  openNotificationModal(notif: NotificationDTO): void {
    this.selectedNotification.set(notif);
    this.isModalOpen.set(true);
    this.isPanelOpen.set(false); // Chiude la tendina per pulizia visiva
  }

  // Gestisce la scelta dal modale
  handleModalChoice(action: 'detail' | 'readOnly'): void {
    const notif = this.selectedNotification();
    if (!notif) return;

    // In entrambi i casi segniamo la notifica come letta
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        const updatedList = this.notifications().filter(n => n.id !== notif.id);
        this.notifications.set(updatedList);
        this.isModalOpen.set(false);

        // Se l'utente ha scelto "Vai al dettaglio", effettuiamo il routing
        if (action === 'detail') {
          const match = notif.message.match(/#(\d+)/);
          if (match && match[1]) {
            this.router.navigate(['/issues', match[1]]);
          }
        }
      },
      error: (err) => console.error('Errore durante la marcatura della notifica', err)
    });
  }

  // Metodo DRY per marcare come letta
  private executeMarkAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const updatedList = this.notifications().filter(n => n.id !== notificationId);
        this.notifications.set(updatedList);
        if (updatedList.length === 0) {
          this.isPanelOpen.set(false);
        }
      },
      error: (err) => console.error('Errore', err)
    });
  }
}