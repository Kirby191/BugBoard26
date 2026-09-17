// ------------------------------------------------------------------------
// APP / ISSUE / COMPONENTS / ISSUE DETAIL / ISSUE DETAIL.COMPONENT
// ------------------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueDetailComponent } from './issue-detail.component';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { IssueDetailed, BugHistory } from '../../../dashboard-query/models/query-dtos';

describe('IssueDetailComponent', () => {
  let component: IssueDetailComponent;
  let fixture: ComponentFixture<IssueDetailComponent>;
  
  
  let dashboardServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  
  const mockFeature: IssueDetailed = {
    id: 10, projectId: 1, projectName: 'Progetto Alpha', title: 'Nuova UI', 
    description: 'Descrizione test', status: 'TODO', type: 'FEATURE', 
    creatorEmail: 'admin@test.com', createdAt: '2026-09-10T10:00:00'
  };

  const mockBug: IssueDetailed = {
    ...mockFeature, id: 11, title: 'Crash login', type: 'BUG'
  };

  const mockHistory: BugHistory[] = [
    { id: 1, bugId: 11, timestamp: '2026-09-10T10:05:00', action: 'CREATED', authorEmail: 'admin@test.com', details: 'Aperto' }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    
    dashboardServiceMock = {
      getIssueDetailed: vi.fn(),
      getBugHistory: vi.fn()
    };
    routerMock = { navigate: vi.fn() };
    locationMock = { back: vi.fn() };
    
    
    activatedRouteMock = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('10') } }
    };

    await TestBed.configureTestingModule({
      imports: [IssueDetailComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IssueDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show an error banner and hide loading if no valid ID is provided in route', () => {
    
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
    
    fixture.detectChanges(); 

    
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('ID segnalazione non valido');
    
    
    const loadingIndicator = fixture.nativeElement.querySelector('.loading');
    expect(loadingIndicator).toBeNull();
  });

  it('should load a FEATURE issue and NOT call getBugHistory (Branch Coverage)', () => {
    dashboardServiceMock.getIssueDetailed.mockReturnValue(of(mockFeature));
    
    fixture.detectChanges(); 
    
    expect(dashboardServiceMock.getIssueDetailed).toHaveBeenCalledWith(10);
    
    expect(dashboardServiceMock.getBugHistory).not.toHaveBeenCalled();
    
    
    const titleHeader = fixture.nativeElement.querySelector('h2');
    expect(titleHeader.textContent).toContain('#10 - Nuova UI');
    
    const typeBadge = fixture.nativeElement.querySelector('.type-feature');
    expect(typeBadge.textContent).toContain('FEATURE');
  });

  it('should load a BUG issue AND call getBugHistory to display timeline (Branch Coverage)', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('11');
    dashboardServiceMock.getIssueDetailed.mockReturnValue(of(mockBug));
    dashboardServiceMock.getBugHistory.mockReturnValue(of(mockHistory));
    
    fixture.detectChanges(); 
    
    expect(dashboardServiceMock.getIssueDetailed).toHaveBeenCalledWith(11);
    
    expect(dashboardServiceMock.getBugHistory).toHaveBeenCalledWith(11);
    
    
    const historyCard = fixture.nativeElement.querySelector('.history-card');
    expect(historyCard).toBeTruthy(); 
    
    const actionText = fixture.nativeElement.querySelector('.timeline-item .action');
    expect(actionText.textContent).toContain('CREATED');
  });

  it('should handle API errors when fetching issue details and hide loading', () => {
    dashboardServiceMock.getIssueDetailed.mockReturnValue(throwError(() => new Error('Network error')));
    
    fixture.detectChanges(); 

    
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Impossibile caricare i dettagli');
    
    
    const loadingIndicator = fixture.nativeElement.querySelector('.loading');
    expect(loadingIndicator).toBeNull();
  });

  it('should navigate back when goBack is clicked', () => {
    dashboardServiceMock.getIssueDetailed.mockReturnValue(of(mockFeature));
    fixture.detectChanges();

    component.goBack();
    expect(locationMock.back).toHaveBeenCalled();
  });

  it('should navigate to edit view when goToEdit is clicked', () => {
    dashboardServiceMock.getIssueDetailed.mockReturnValue(of(mockFeature));
    fixture.detectChanges();

    
    component.goToEdit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/edit', 10]);
  });
});
