// ----------------------------------------------------------------------------
// APP / ISSUE / COMPONENTS / PROJECT DETAIL / PROJECT DETAIL.COMPONENT
// ----------------------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectService } from '../../services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ProjectState } from '../../../shared/models/shared-dtos';
import { IssueSummary } from '../../../dashboard-query/models/query-dtos';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;

  let projectQueryMock: any;
  let dashboardServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let projectServiceMock: any;
  let activatedRouteMock: any;

  const mockProject: ProjectState = {
    id: 10, name: 'Progetto Alpha', description: 'Test Desc', lastModified: '2026-09-11T10:00:00'
  };

  const mockProjectIssues: IssueSummary[] = [
    { id: 100, title: 'Bug Login', projectName: 'Progetto Alpha', type: 'BUG', status: 'TODO', priority: 'HIGH' }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    
    projectQueryMock = {
      getProjectById: vi.fn().mockReturnValue(of(mockProject))
    };

    dashboardServiceMock = {
      searchIssues: vi.fn().mockReturnValue(of(mockProjectIssues))
    };

    routerMock = { navigate: vi.fn() };
    locationMock = { back: vi.fn() };
    projectServiceMock = { deleteProject: vi.fn().mockReturnValue(of({})) };

    
    activatedRouteMock = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('10') } }
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDetailComponent],
      providers: [
        { provide: ProjectQueryService, useValue: projectQueryMock },
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display an error banner and hide loading if no ID is provided in route', () => {
    
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
    
    fixture.detectChanges(); 

    
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('ID progetto non valido');

    
    const loadingSpinner = fixture.nativeElement.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeNull();
  });

  it('should load project details and its associated issues (Double Query)', () => {
    fixture.detectChanges(); 

    
    expect(projectQueryMock.getProjectById).toHaveBeenCalledWith(10);
    expect(dashboardServiceMock.searchIssues).toHaveBeenCalledWith({ projectId: 10 });

    
    const projectHeader = fixture.nativeElement.querySelector('.main-info-card h2');
    expect(projectHeader.textContent).toContain('#10 - Progetto Alpha');

    
    const issueRow = fixture.nativeElement.querySelector('.issues-card tbody tr');
    expect(issueRow.textContent).toContain('#100');
    expect(issueRow.textContent).toContain('Bug Login');
  });

  it('should show the server error state if getProjectById fails', () => {
    projectQueryMock.getProjectById.mockReturnValue(throwError(() => new Error('API down')));
    
    fixture.detectChanges();

    const errorState = fixture.nativeElement.querySelector('app-server-error-state');
    expect(errorState).toBeTruthy();
    expect(errorState.textContent).toContain('Impossibile caricare i dettagli del progetto');
  });

  it('should navigate back when "Torna all\'elenco" is clicked', () => {
    fixture.detectChanges();
    
    const backBtn = fixture.nativeElement.querySelector('.btn-secondary');
    backBtn.click();
    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should navigate to edit view when "Modifica Progetto" is clicked', () => {
    fixture.detectChanges();
    
    localStorage.setItem('user_role', 'ADMIN');
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const editBtn = fixture.nativeElement.querySelector('.btn-warning');
    editBtn.click();
    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects/edit', 10]);
  });

  it('should navigate to issue detail when "Vedi Issue" is clicked on a row', () => {
    fixture.detectChanges();
    
    
    const viewIssueBtn = fixture.nativeElement.querySelector('.issues-card .btn-info');
    viewIssueBtn.click();
    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues', 100]);
  });
});
