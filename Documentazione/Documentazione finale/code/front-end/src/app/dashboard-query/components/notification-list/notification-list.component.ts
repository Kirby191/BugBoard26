import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NotificationService } from '../../services/notification.service';
import { NotificationDTO } from '../../models/query-dtos';
import { ModalComponent } from '../../../shared/components/modal/modal.component'; 

type ToastNotification = NotificationDTO & { typeClass?: string };

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

  // ----------------------------------------------------------------
  // Stato del pannello, del modal e del toast
  // ----------------------------------------------------------------
  protected readonly notifications = signal<NotificationDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isPanelOpen = signal<boolean>(false);
  protected readonly unreadCount = computed(() => this.notifications().length);

  
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly selectedNotification = signal<NotificationDTO | null>(null);

  
  protected readonly activeToast = signal<ToastNotification | null>(null);
  private toastTimeout: any;

  // ----------------------------------------------------------------
  // Caricamento iniziale e aggiornamenti live
  // ----------------------------------------------------------------
  ngOnInit(): void {
    this.loadNotifications();

    // Sottoscrizione al canale Live (SSE)
    this.notificationService.listenToLiveNotifications().subscribe({
      next: (newNotif: NotificationDTO) => {
        
        /*
         * Una revoca sostituisce semanticamente la precedente notifica di
         * assegnazione dello stesso bug: la rimuoviamo prima dell'inserimento.
         */
        const isRevocation = newNotif.message.includes("è stata annullata");
        
        this.notifications.update(currentList => {
          let updatedList = [...currentList];
          
          if (isRevocation) {
            // Il messaggio è l'unico riferimento disponibile all'id del bug.
            const match = newNotif.message.match(/Bug #(\d+)/);
            if (match && match[1]) {
              const bugId = match[1];
              // Manteniamo una sola notifica attiva per lo stesso bug.
              updatedList = updatedList.filter(n => !n.message.includes(`Bug #${bugId}`));
            }
          }
          
          // Aggiungiamo la nuova notifica in cima alla lista
          return [newNotif, ...updatedList];
        });
        
        // La revoca usa un colore diverso per distinguersi dal normale arrivo di una notifica.
        this.showToast(newNotif, isRevocation ? 'toast-warning' : 'toast-info');
      },
      error: (err) => console.warn('Connessione Live interrotta o fallita', err)
    });
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

  // ----------------------------------------------------------------
  // Interazioni del pannello
  // ----------------------------------------------------------------
  togglePanel(): void {
    
    this.isPanelOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    
    const bellContainer = this.elementRef.nativeElement.querySelector('.notification-wrapper');
    if (bellContainer && !bellContainer.contains(event.target as Node)) {
      this.isPanelOpen.set(false);
    }
  }

  
  markAsReadQuick(notificationId: number, event: Event): void {
    event.stopPropagation(); 
    this.executeMarkAsRead(notificationId);
  }

  
  openNotificationModal(notif: NotificationDTO): void {
    this.selectedNotification.set(notif);
    this.isModalOpen.set(true);
    this.isPanelOpen.set(false); 
  }

  
  handleModalChoice(action: 'detail' | 'readOnly'): void {
    const notif = this.selectedNotification();
    if (!notif) return;

    // La notifica viene rimossa solo dopo la conferma del backend, così non perdiamo stato in caso di errore.
    this.notificationService.markAsRead(notif.id).subscribe({
      next: () => {
        const updatedList = this.notifications().filter(n => n.id !== notif.id);
        this.notifications.set(updatedList);
        this.isModalOpen.set(false);

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

  // ----------------------------------------------------------------
  // Toast temporaneo per le notifiche in arrivo
  // ----------------------------------------------------------------
  private showToast(notif: NotificationDTO, cssClass: string = 'toast-info'): void {
    
   clearTimeout(this.toastTimeout);
    
    this.activeToast.set({ ...notif, typeClass: cssClass });

    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 5000);
  }


  closeToast(): void {
    this.activeToast.set(null);
    clearTimeout(this.toastTimeout);
  }
}