// -------------------------------------------------------
// APP / DASHBOARD QUERY / SERVICES / NOTIFICATION
// -------------------------------------------------------

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationDTO } from '../models/query-dtos';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
/** Unifica lettura persistente e ricezione live delle notifiche via SSE. */
export class NotificationService {
  /*
   * Espone due modalità di lettura: una richiesta HTTP per le notifiche
   * già presenti e uno stream SSE per quelle ricevute durante la sessione.
   */
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

    // Endpoint condiviso dalle operazioni di lettura e di marcatura.
  private readonly API_NOTIFICATIONS = '/api/notifications';

    /* ============================================================
      NOTIFICHE PERSISTENTI
      ============================================================ */
  getUnreadNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(`${this.API_NOTIFICATIONS}/unread`);
  }

  

  // La lista locale viene aggiornata dal componente solo dopo la risposta positiva.
  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_NOTIFICATIONS}/${id}/read`, null);
  }

    /* ============================================================
      STREAM LIVE SSE
      ============================================================
      Il protocollo invia righe `data:` che contengono JSON serializzato.
      ============================================================ */
  listenToLiveNotifications(): Observable<NotificationDTO> {
    return new Observable<NotificationDTO>(subscriber => {
      const token = this.authService.getToken();
      if (!token) {
        // Senza token non apriamo una connessione anonima allo stream protetto.
        subscriber.error('Nessun token disponibile');
        return;
      }

      fetch(`${this.API_NOTIFICATIONS}/stream`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(async response => {
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();

        // Un chunk può contenere più eventi: leggiamo fino alla chiusura dello stream.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value);
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.replace('data:', '').trim();
              if (jsonStr) {
                const liveNotification: NotificationDTO = JSON.parse(jsonStr);
                subscriber.next(liveNotification); 
              }
            }
          }
        }
      }).catch(err => subscriber.error(err));
    });
  }
}
