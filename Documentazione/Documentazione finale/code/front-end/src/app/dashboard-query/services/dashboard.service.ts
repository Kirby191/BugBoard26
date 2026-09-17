// ----------------------------------------------------
// APP / DASHBOARD QUERY / SERVICES / DASHBOARD
// ----------------------------------------------------

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';


import { 
  IssueSummary, 
  IssueDetailed, 
  IssueFilter, 
  DashboardStats, 
  UserReference,
  BugHistory
} from '../models/query-dtos';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  /*
   * Servizio di sola lettura per dashboard, liste e dettaglio delle issue.
   * Le trasformazioni qui presenti adattano le risposte del Query layer
   * al formato più semplice da consumare nei componenti Angular.
   */
  private readonly http = inject(HttpClient);

  // Endpoint del Query layer: non contiene operazioni di modifica dello stato.
  private readonly API_ISSUES = '/api/issues';
  private readonly API_DASHBOARD = '/api/dashboard';
  private readonly API_USERS = '/api/users';

  /* ============================================================
     RICERCA E DETTAGLIO ISSUE
     ============================================================ */
  searchIssues(filter: IssueFilter): Observable<IssueSummary[]> {
    let params = new HttpParams();

    // Aggiungiamo solo i filtri valorizzati per non inviare query param vuoti.
    if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
    if (filter.status) params = params.set('status', filter.status);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.assigneeId) params = params.set('assigneeId', filter.assigneeId.toString());
    if (filter.titleQuery) params = params.set('titleQuery', filter.titleQuery);
    
    
    params = params.set('size', '50');

    /*
     * Il backend risponde con una pagina paginata, mentre i componenti della
     * dashboard lavorano direttamente sull'array contenuto nella risposta.
     */
    return this.http.get<any>(this.API_ISSUES, { params }).pipe(
      map(response => response.content || []) 
    );
  }

  /*
   * Le date arrivano dal backend senza sempre esplicitare la zona oraria.
   * Il suffisso UTC evita che il browser le interpreti come date locali.
   */
  getIssueDetailed(id: number): Observable<IssueDetailed> {
    return this.http.get<IssueDetailed>(`${this.API_ISSUES}/${id}`).pipe(
      map(issue => {
        // Le date senza zona vengono interpretate diversamente dal browser: il backend le esprime in UTC.
        if (issue.createdAt && !issue.createdAt.endsWith('Z')) {
          issue.createdAt += 'Z';
        }
        return issue;
      })
    );
  } 
  /* ============================================================
    METRICHE E RIFERIMENTI DI SUPPORTO
    ============================================================ */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_DASHBOARD}/stats`);
  }

  
  
  // Elenco leggero usato nei menu di assegnazione e nei filtri.
  getUsersReference(): Observable<UserReference[]> {
    return this.http.get<UserReference[]>(this.API_USERS);
  }

  /*
   * Lo storico esiste solo per i bug. La normalizzazione delle timestamp
   * resta vicino alla chiamata così il componente riceve dati già coerenti.
   */
  getBugHistory(issueId: number): Observable<BugHistory[]> {
    return this.http.get<BugHistory[]>(`${this.API_ISSUES}/${issueId}/history`).pipe(
      map(historyArray => {
        return historyArray.map(event => {
          if (event.timestamp && !event.timestamp.endsWith('Z')) {
            event.timestamp += 'Z';
          }
          return event;
        });
      })
    );
  }
}