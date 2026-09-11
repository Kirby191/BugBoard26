import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationDTO } from '../models/query-dtos';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  
  // Endpoint base verso il Core API sulla porta 8080
  private readonly API_NOTIFICATIONS = 'http://localhost:8080/api/notifications';

  /**
   * Recupera le notifiche non lette per l'utente loggato.
   * Il backend inferisce l'utente dal token JWT (Prevenzione IDOR).
   */
  getUnreadNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.API_NOTIFICATIONS}/unread`);
  }

  /**
   * Contrassegna una specifica notifica come letta.
   * Il backend restituisce uno status 204 No Content.
   * 
   * @param id L'identificativo della notifica da aggiornare
   */
  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_NOTIFICATIONS}/${id}/read`, null);
  }
}
