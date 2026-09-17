// ------------------------------------------------
// APP / ISSUE / SERVICES / PROJECT.SERVICE
// ------------------------------------------------

import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateProject, UpdateProject } from '../models/project-dtos';

describe('ProjectService', () => {
  /* Il Command service espone il mapping HTTP delle tre operazioni sul progetto. */
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const API_PROJECTS = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    TestBed.resetTestingModule(); 
    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        provideHttpClient(),
        provideHttpClientTesting() 
      ]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST JSON to createProject', () => {
    const requestDto: CreateProject = { name: 'Nuovo Progetto', description: 'Descrizione test' };
    const mockResponse = { id: 1, name: 'Nuovo Progetto', description: 'Descrizione test' };

    service.createProject(requestDto).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(API_PROJECTS);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestDto); 
    
    req.flush(mockResponse);
  });

  it('should PUT JSON to updateProject', () => {
    const updateDto: UpdateProject = { name: 'Progetto Aggiornato', description: 'Nuova desc' };
    
    service.updateProject(10, updateDto).subscribe();

    const req = httpMock.expectOne(`${API_PROJECTS}/10`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    
    req.flush({});
  });

  it('should send a DELETE request to deleteProject', () => {
    service.deleteProject(5).subscribe();

    const req = httpMock.expectOne(`${API_PROJECTS}/5`);
    expect(req.request.method).toBe('DELETE');
    
    req.flush({});
  });
});
