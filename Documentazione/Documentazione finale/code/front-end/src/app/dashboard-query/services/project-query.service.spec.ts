// ----------------------------------------------------------------
// APP / DASHBOARD QUERY / SERVICES / PROJECT QUERY.SERVICE
// ----------------------------------------------------------------

import { TestBed } from '@angular/core/testing';
import { ProjectQueryService } from './project-query.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectState } from '../../shared/models/shared-dtos';

describe('ProjectQueryService', () => {
  /* Le query di progetto devono restare pure letture GET, usate da più schermate. */
  let service: ProjectQueryService;
  let httpMock: HttpTestingController;

  const API_PROJECTS = '/api/projects';

  beforeEach(() => {
    TestBed.resetTestingModule(); 
    TestBed.configureTestingModule({
      providers: [
        ProjectQueryService,
        provideHttpClient(),
        provideHttpClientTesting() 
      ]
    });
    service = TestBed.inject(ProjectQueryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
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
    req.flush(mockProjects); 
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
