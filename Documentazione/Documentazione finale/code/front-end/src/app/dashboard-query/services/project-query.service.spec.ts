import { TestBed } from '@angular/core/testing';
import { ProjectQueryService } from './project-query.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectState } from '../../shared/models/shared-dtos';

describe('ProjectQueryService', () => {
  let service: ProjectQueryService;
  let httpMock: HttpTestingController;

  const API_PROJECTS = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    TestBed.resetTestingModule(); // Prevenzione crash Vitest
    TestBed.configureTestingModule({
      providers: [
        ProjectQueryService,
        provideHttpClient(),
        provideHttpClientTesting() // Sostituisce la rete reale
      ]
    });
    service = TestBed.inject(ProjectQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Assicura l'assenza di richieste HTTP pendenti
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute a GET request to retrieve all projects', () => {
    const mockProjects: ProjectState[] = [
      { id: 1, name: 'Progetto Alpha', description: 'Desc A', lastModified: '2026-09-10' }
    ];

    service.getProjects().subscribe(projects => {
      expect(projects).toEqual(mockProjects);
      expect(projects.length).toBe(1);
    });

    const req = httpMock.expectOne(API_PROJECTS);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects); // Simula la risposta di Spring Boot
  });

  it('should execute a GET request to retrieve a single project by ID', () => {
    const mockProject: ProjectState = {
      id: 10, name: 'Progetto Beta', description: 'Desc B', lastModified: '2026-09-11'
    };

    service.getProjectById(10).subscribe(project => {
      expect(project).toEqual(mockProject);
      expect(project.name).toBe('Progetto Beta');
    });

    const req = httpMock.expectOne(`${API_PROJECTS}/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);
  });
});
