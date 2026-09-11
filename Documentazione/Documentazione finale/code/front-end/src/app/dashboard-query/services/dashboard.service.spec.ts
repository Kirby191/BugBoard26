import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { IssueFilter, IssueDetailed, DashboardStats, BugHistory } from '../models/query-dtos';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const API_ISSUES = 'http://localhost:8080/api/issues';
  const API_DASHBOARD = 'http://localhost:8080/api/dashboard';

  beforeEach(() => {
    TestBed.resetTestingModule(); // Previene l'errore "Test module already instantiated"
    
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Assicura che non ci siano chiamate HTTP pendenti
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format HttpParams correctly and unbox pagination in searchIssues()', () => {
    const mockFilter: IssueFilter = {
      projectId: 1,
      status: 'TODO',
      type: 'BUG'
    };

    const mockResponse = {
      content: [{ id: 1, title: 'Test Bug', status: 'TODO', type: 'BUG', projectName: 'Proj A' }]
    };

    service.searchIssues(mockFilter).subscribe(issues => {
      expect(issues.length).toBe(1);
      expect(issues[0].title).toBe('Test Bug');
    });

    // CORREZIONE: Il service vero chiama API_ISSUES (senza /summary)
    const req = httpMock.expectOne(request => request.url === API_ISSUES);
    expect(req.request.method).toBe('GET');
    
    expect(req.request.params.get('projectId')).toBe('1');
    expect(req.request.params.get('status')).toBe('TODO');
    expect(req.request.params.get('type')).toBe('BUG');
    expect(req.request.params.get('size')).toBe('50');
    
    req.flush(mockResponse);
  });

  it('should retrieve detailed issue correctly in getIssueDetailed()', () => {
    const mockIssue: IssueDetailed = {
      id: 10, projectId: 1, projectName: 'Test', title: 'Titolo', description: 'Desc',
      status: 'TODO', type: 'FEATURE', creatorEmail: 'a@a.com', createdAt: '2026-09-10'
    };

    service.getIssueDetailed(10).subscribe(issue => {
      expect(issue).toEqual(mockIssue);
    });

    const req = httpMock.expectOne(`${API_ISSUES}/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockIssue);
  });

  it('should retrieve stats correctly in getDashboardStats()', () => {
    const mockStats: DashboardStats = {
      totalIssues: 10, todoCount: 5, inProgressCount: 3, doneCount: 2,
      assignedToMeCount: 1, criticalCount: 0, overdueCount: 0, unassignedBugCount: 2
    };

    service.getDashboardStats().subscribe(stats => {
      expect(stats).toEqual(mockStats);
    });

    const req = httpMock.expectOne(`${API_DASHBOARD}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
  });

  it('should retrieve bug history correctly in getBugHistory()', () => {
    const mockHistory: BugHistory[] = [
      { id: 1, bugId: 10, timestamp: '2026-09-10', action: 'CREATED', authorEmail: 'test@test.com', details: 'Creato' }
    ];

    service.getBugHistory(10).subscribe(history => {
      expect(history).toEqual(mockHistory);
    });

    const req = httpMock.expectOne(`${API_ISSUES}/10/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });
});