import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO esclusivi del Command Layer (Modulo Issue)
import { 
  CreateIssue, 
  UpdateIssue, 
  AssignBug, 
  IssueResponse, 
  CreateProject, 
  UpdateProject 
} from '../models/issue-dtos';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  private readonly http = inject(HttpClient);
  
  // Endpoint base del Core Service esposto sulla porta 8082[cite: 2, 8]
  private readonly API_ISSUES = 'http://localhost:8082/api/issues';
  private readonly API_PROJECTS = 'http://localhost:8082/api/projects';

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
      // Il backend si aspetta opzionalmente una RequestPart "file"[cite: 12].
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

  // ==========================================================================
  // PROJECT COMMANDS (Scrittura e Mutazione Progetti)
  // ==========================================================================

  /**
   * Crea un nuovo progetto (Admin).
   * Mappato su POST /api/projects.
   */
  createProject(request: CreateProject): Observable<any> {
    return this.http.post(`${this.API_PROJECTS}`, request);
  }

  /**
   * Aggiorna un progetto esistente (Admin).
   * Mappato su PUT /api/projects/{id}.
   */
  updateProject(id: number, request: UpdateProject): Observable<any> {
    return this.http.put(`${this.API_PROJECTS}/${id}`, request);
  }

  /**
   * Elimina un progetto (Solo Admin).
   * Mappato su DELETE /api/projects/{id}.
   */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_PROJECTS}/${id}`);
  }
}
