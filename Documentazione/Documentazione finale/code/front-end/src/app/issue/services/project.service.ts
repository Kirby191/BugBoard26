import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProject, UpdateProject } from '../models/project-dtos';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly API_PROJECTS = '/api/projects';

  createProject(request: CreateProject): Observable<any> {
    return this.http.post(this.API_PROJECTS, request);
  }

  updateProject(id: number, request: UpdateProject): Observable<any> {
    return this.http.put(`${this.API_PROJECTS}/${id}`, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_PROJECTS}/${id}`);
  }
}
