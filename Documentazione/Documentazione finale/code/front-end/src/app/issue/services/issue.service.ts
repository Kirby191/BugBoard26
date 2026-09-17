// ------------------------------------------------
// APP / ISSUE / SERVICES / ISSUE
// ------------------------------------------------

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


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
  
  
  private readonly API_ISSUES = '/api/issues';

    /* ============================================================
      COMANDI ISSUE
      ============================================================
      Creazione e modifica inviano il DTO JSON e l'allegato come parti separate.
      ============================================================ */


  createIssue(request: CreateIssue, file?: File): Observable<IssueResponse> {
    const formData = new FormData();
    
    // Il DTO resta una parte JSON separata dall'eventuale allegato.
    formData.append('issue', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));

    if (file) {
      // Il file è opzionale: l'assenza della parte mantiene valido il payload.
      formData.append('file', file);
    }

    return this.http.post<IssueResponse>(this.API_ISSUES, formData);
  }

  



  updateIssue(id: number, request: UpdateIssue, file?: File): Observable<IssueResponse> {
    const formData = new FormData();
    // La PUT conserva lo stesso contratto multipart della creazione.
    
    formData.append('issue', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));

    
    if (file) {
      formData.append('file', file);
    }

    
    return this.http.put<IssueResponse>(`${this.API_ISSUES}/${id}`, formData);
  }

  



  assignBug(id: number, request: AssignBug): Observable<IssueResponse> {
    return this.http.put<IssueResponse>(`${this.API_ISSUES}/${id}/assign`, request);
  }

  



  setDueDate(id: number, dueDate?: string | null): Observable<IssueResponse> {
    // La scadenza è un comando indipendente e viene inviata come query parameter.
    let params = new HttpParams();
    if (dueDate) {
      params = params.set('dueDate', dueDate);
    }
    
    
    return this.http.put<IssueResponse>(`${this.API_ISSUES}/${id}/due-date`, null, { params });
  }

  





  deleteIssue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_ISSUES}/${id}`);
  }
}
