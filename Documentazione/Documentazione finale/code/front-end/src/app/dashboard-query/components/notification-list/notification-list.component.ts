import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
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
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  
  // Iniettiamo ElementRef per capire se l'utente clicca fuori dal componente
  private readonly elementRef = inject(ElementRef);

  protected readonly notifications = signal<NotificationDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  
  // NUOVO SIGNAL: Controlla se la tendina è aperta o chiusa
  protected readonly isPanelOpen = signal<boolean>(false);
  
  protected readonly unreadCount = computed(() => this.notifications().length);

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

  // NUOVO METODO: Apre o chiude il pannello
  togglePanel(event: Event): void {
    event.stopPropagation();
    this.isPanelOpen.update(v => !v);
  }

  // NUOVO METODO: Chiude il pannello se si clicca in un punto qualsiasi dello schermo
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isPanelOpen.set(false);
    }
  }

  markAsRead(notificationId: number, event: Event): void {
    event.stopPropagation(); 
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const updatedList = this.notifications().filter(n => n.id !== notificationId);
        this.notifications.set(updatedList);
        
        // Se non ci sono più notifiche, chiudiamo automaticamente il pannello per UX pulita
        if (updatedList.length === 0) {
          this.isPanelOpen.set(false);
        }
      },
      error: (err) => {
        console.error('Errore durante la marcatura della notifica', err);
      }
    });
  }

  goToIssue(message: string): void {
    const match = message.match(/#(\d+)/);
    if (match && match[1]) {
      this.isPanelOpen.set(false); // Chiude il pannello prima di navigare
      this.router.navigate(['/issues', match[1]]);
    }
  }
}