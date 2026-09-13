import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Importiamo i DTO di "Read/Query" dal modulo corrente
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
  
  private readonly http = inject(HttpClient);
  
  // Endpoint base verso il Core API 
  private readonly API_ISSUES = '/api/issues';
  private readonly API_DASHBOARD = '/api/dashboard';
  private readonly API_USERS = '/api/users';

  // ==========================================================================
  // QUERY DELLE ISSUE E DASHBOARD
  // ==========================================================================

  /**
   * Effettua una ricerca dinamica sfruttando il pattern Specification sul backend.
   * Il backend restituisce una pagina (Page<IssueSummary>), noi estraiamo l'array 'content'.
   */
  searchIssues(filter: IssueFilter): Observable<IssueSummary[]> {
    let params = new HttpParams();
    
    if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
    if (filter.status) params = params.set('status', filter.status);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.priority) params = params.set('priority', filter.priority);
    if (filter.assigneeId) params = params.set('assigneeId', filter.assigneeId.toString());
    if (filter.titleQuery) params = params.set('titleQuery', filter.titleQuery);
    
    // Default page size a 50 per evitare problemi visivi
    params = params.set('size', '50');

    // Chiamata GET verso /api/issues
    return this.http.get<any>(this.API_ISSUES, { params }).pipe(
      map(response => response.content || []) // Estrae l'array dalla paginazione di Spring
    );
  }

  /**
   * Recupera i dati completi per la vista di dettaglio.
   */
  getIssueDetailed(id: number): Observable<IssueDetailed> {
    return this.http.get<IssueDetailed>(`${this.API_ISSUES}/${id}`);
  }

  /**
   * Recupera le statistiche aggregate per la Dashboard.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_DASHBOARD}/stats`);
  }

  // ==========================================================================
  // QUERY PER MENU A TENDINA (Dropdowns)
  // ==========================================================================

  /**
   * Recupera la lista degli utenti per popolare le tendine dei filtri e assegnazioni.
   */
  getUsersReference(): Observable<UserReference[]> {
    return this.http.get<UserReference[]>(this.API_USERS);
  }

  /**
   * Recupera lo storico delle modifiche per un bug specifico.
   */
  getBugHistory(issueId: number): Observable<BugHistory[]> {
    return this.http.get<BugHistory[]>(`${this.API_ISSUES}/${issueId}/history`);
  }
}