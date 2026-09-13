import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO esclusivi del Command Layer (Modulo Issue)
import { 
  CreateIssue, 
  UpdateIssue, 
  AssignBug, 
  IssueResponse
} from '../models/issue-dtos';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  private readonly http = inject(HttpClient);
  
  // Endpoint base del Core Service
  private readonly API_ISSUES = '/api/issues';
  private readonly API_PROJECTS = '/api/projects';

  // ==========================================================================
  // ISSUE COMMANDS (Scrittura e Mutazione Stato)
  // ==========================================================================

  /**
   * Crea una nuova issue.
   * Mappato su POST /api/issues con consumi MULTIPART_FORM_DATA_VALUE.
   */
  createIssue(request: CreateIssue, file?: File): Observable<IssueResponse> {
    const formData = new FormData();
    
    // Il backend si aspetta una RequestPart "issue" contenente il DTO validato.
    formData.append('issue', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));

    if (file) {
      // Il backend si aspetta opzionalmente una RequestPart "file" 12].
      formData.append('file', file);
    }

    return this.http.post<IssueResponse>(this.API_ISSUES, formData);
  }

  /**
   * Aggiorna titolo, descrizione, stato e priorità di una issue.
   * Mappato su PUT /api/issues/{id}.
   */
  updateIssue(id: number, request: UpdateIssue): Observable<IssueResponse> {
    return this.http.put<IssueResponse>(`${this.API_ISSUES}/${id}`, request);
  }

  /**
   * Assegna una issue a un utente.
   * Mappato su PUT /api/issues/{id}/assign.
   */
  assignBug(id: number, request: AssignBug): Observable<IssueResponse> {
    return this.http.put<IssueResponse>(`${this.API_ISSUES}/${id}/assign`, request);
  }

  /**
   * Imposta o rimuove la data di scadenza (Funzionalità 18).
   * Mappato su PUT /api/issues/{id}/due-date, dove la data viaggia come @RequestParam.
   */
  setDueDate(id: number, dueDate?: string | null): Observable<IssueResponse> {
    let params = new HttpParams();
    if (dueDate) {
      params = params.set('dueDate', dueDate);
    }
    
    // Essendo una PUT che usa parametri in query string, il body può essere null
    return this.http.put<IssueResponse>(`${this.API_ISSUES}/${id}/due-date`, null, { params });
  }
}
