import { TestBed } from '@angular/core/testing';
import { IssueService } from './issue.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateIssue, UpdateIssue, AssignBug } from '../models/issue-dtos';

describe('IssueService', () => {
  let service: IssueService;
  let httpMock: HttpTestingController;

  // L'endpoint punta al Core API (porta 8080) in base all'architettura per il command layer
  const API_ISSUES = 'http://localhost:8080/api/issues';
  const API_PROJECTS = 'http://localhost:8080/api/projects';

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        IssueService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(IssueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Previene richieste "appese" a fine test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Issue Commands', () => {
    it('should POST FormData containing only the DTO Blob when createIssue is called without a file', () => {
      const requestDto: CreateIssue = { projectId: 1, title: 'Bug', description: 'Desc', type: 'BUG' };
      const mockResponse = { id: 1, title: 'Bug', status: 'TODO', projectId: 1, type: 'BUG' };

      service.createIssue(requestDto).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(API_ISSUES);
      expect(req.request.method).toBe('POST');
      
      // Verifica l'uso di FormData per il Multipart richiesto dal back-end[cite: 4, 13]
      expect(req.request.body instanceof FormData).toBe(true);
      const formData = req.request.body as FormData;
      expect(formData.has('issue')).toBe(true);
      expect(formData.has('file')).toBe(false); // Nessun file allegato

      req.flush(mockResponse);
    });

    it('should POST FormData containing both DTO Blob and File when createIssue is called with a file', () => {
      const requestDto: CreateIssue = { projectId: 1, title: 'Bug', description: 'Desc', type: 'BUG' };
      const dummyFile = new File([''], 'test.png', { type: 'image/png' });

      service.createIssue(requestDto, dummyFile).subscribe();

      const req = httpMock.expectOne(API_ISSUES);
      
      const formData = req.request.body as FormData;
      expect(formData.has('issue')).toBe(true);
      expect(formData.has('file')).toBe(true); // Il file è stato agganciato[cite: 4]
      expect(formData.get('file')).toBe(dummyFile);

      req.flush({});
    });

    it('should PUT JSON to updateIssue', () => {
      const updateDto: UpdateIssue = { title: 'Nuovo', description: 'Desc', status: 'IN_PROGRESS' };
      
      service.updateIssue(10, updateDto).subscribe();

      const req = httpMock.expectOne(`${API_ISSUES}/10`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto); // Invio Standard JSON[cite: 4, 13]
      
      req.flush({});
    });

    it('should PUT JSON to assignBug', () => {
      const assignDto: AssignBug = { assigneeId: 99 };
      
      service.assignBug(5, assignDto).subscribe();

      const req = httpMock.expectOne(`${API_ISSUES}/5/assign`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(assignDto);
      
      req.flush({});
    });

    it('should PUT with HttpParams when setDueDate is called', () => {
      service.setDueDate(10, '2026-12-31').subscribe();

      const req = httpMock.expectOne(request => request.url === `${API_ISSUES}/10/due-date`);
      expect(req.request.method).toBe('PUT');
      
      // Il backend Spring si aspetta la data come @RequestParam[cite: 4, 13]
      expect(req.request.params.get('dueDate')).toBe('2026-12-31');
      expect(req.request.body).toBeNull(); 
      
      req.flush({});
    });
  });
});
