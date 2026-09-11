import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectState } from '../../shared/models/shared-dtos';

@Injectable({
  providedIn: 'root'
})
export class ProjectQueryService {
  private readonly http = inject(HttpClient);
  private readonly API_PROJECTS = 'http://localhost:8080/api/projects';

  getProjects(): Observable<ProjectState[]> {
    return this.http.get<ProjectState[]>(this.API_PROJECTS);
  }

  getProjectById(id: number): Observable<ProjectState> {
    return this.http.get<ProjectState>(`${this.API_PROJECTS}/${id}`);
  }
}
