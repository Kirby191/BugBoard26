// --------------------------------------------------------------------
// APP / ISSUE / COMPONENTS / ISSUE LIST / ISSUE LIST.COMPONENT
// --------------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueListComponent } from './issue-list.component';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { IssueService } from '../../services/issue.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IssueSummary } from '../../../dashboard-query/models/query-dtos';

describe('IssueListComponent', () => {
  let component: IssueListComponent;
  let fixture: ComponentFixture<IssueListComponent>;
  
  let dashboardServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;
  let projectQueryServiceMock: any;
  let issueServiceMock: any;

  const mockIssues: IssueSummary[] = [
    {
      id: 1, title: 'Bug Critico UI', projectName: 'Progetto Alpha', 
      type: 'BUG', status: 'TODO', priority: 'CRITICAL', assigneeEmail: 'admin@bugboard.com', reporterId: 42, assigneeId: 42
    }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    
    dashboardServiceMock = {
      searchIssues: vi.fn().mockReturnValue(of(mockIssues)),
      getUsersReference: vi.fn().mockReturnValue(of([])) 
    };

    projectQueryServiceMock = {
      getProjects: vi.fn().mockReturnValue(of([{ id: 1, name: 'Progetto Alpha', description: '', lastModified: '' }]))
    };

    issueServiceMock = {
      deleteIssue: vi.fn().mockReturnValue(of({}))
    };
    
    routerMock = { navigate: vi.fn() };

    
    activatedRouteMock = {
      queryParams: of({}),
      snapshot: { queryParams: {} } 
    };

    await TestBed.configureTestingModule({
      imports: [IssueListComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: ProjectQueryService, useValue: projectQueryServiceMock },
        { provide: IssueService, useValue: issueServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IssueListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and load all issues if no query params are present', () => {
    fixture.detectChanges(); 
    
    expect(dashboardServiceMock.searchIssues).toHaveBeenCalledWith({});
    
    expect(dashboardServiceMock.getUsersReference).toHaveBeenCalled(); 
    
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Bug Critico UI');
  });

  it('should parse URL query parameters and build a valid IssueFilter for the backend', () => {
    activatedRouteMock.queryParams = of({ status: 'TODO', priority: 'CRITICAL', projectId: '5' });
    
    fixture = TestBed.createComponent(IssueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); 

    expect(dashboardServiceMock.searchIssues).toHaveBeenCalledWith({
      status: 'TODO',
      priority: 'CRITICAL',
      projectId: 5 
    });
  });

  it('should display the server error state if searchIssues fails', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(throwError(() => new Error('API down')));
    fixture.detectChanges();

    const errorState = fixture.nativeElement.querySelector('app-server-error-state');
    expect(errorState).toBeTruthy();
    expect(errorState.textContent).toContain('Impossibile caricare le segnalazioni');
  });

  describe('Navigation Actions', () => {
    it('should navigate to create issue form when "+ Nuova Segnalazione" is clicked', () => {
      fixture.detectChanges();
      component.navigateToCreate();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/new']);
    });

    it('should navigate to detail view when "Dettagli" is clicked', () => {
      fixture.detectChanges();
      const detailBtn = fixture.nativeElement.querySelectorAll('.btn-info')[0];
      detailBtn.click();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues', 1]);
    });

    it('should navigate to edit view when "Modifica" is clicked', () => {
      component.navigateToEdit(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/edit', 1]);
    });
  });
});