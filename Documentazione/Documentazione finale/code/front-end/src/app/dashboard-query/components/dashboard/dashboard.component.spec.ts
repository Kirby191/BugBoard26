// ----------------------------------------------------------------------------
// APP / DASHBOARD QUERY / COMPONENTS / DASHBOARD / DASHBOARD.COMPONENT
// ----------------------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardStats } from '../../models/query-dtos';

describe('DashboardComponent', () => {
  /*
   * La suite controlla sia il rendering delle metriche sia la navigazione
   * prodotta dalle card, che è il comportamento principale della dashboard.
   */
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let dashboardServiceMock: any;
  let routerMock: any;

  const mockStats: DashboardStats = {
    totalIssues: 100, todoCount: 50, inProgressCount: 30, doneCount: 20,
    assignedToMeCount: 5, criticalCount: 2, overdueCount: 1, unassignedBugCount: 10
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    
    dashboardServiceMock = {
      getDashboardStats: vi.fn().mockReturnValue(of(mockStats))
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    
    
    vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and load stats on init (DOM Testing)', () => {
    fixture.detectChanges(); 

    expect(dashboardServiceMock.getDashboardStats).toHaveBeenCalled();

    const values = fixture.nativeElement.querySelectorAll('.stat-value');
    const textValues = Array.from(values).map((node: any) => node.textContent.trim());

    expect(textValues).toContain('5');  
    expect(textValues).toContain('2');  
  });

  it('should display the server error state if getDashboardStats fails (DOM Testing)', () => {
    dashboardServiceMock.getDashboardStats.mockReturnValue(throwError(() => new Error('API down')));
    fixture.detectChanges();

    const errorState = fixture.nativeElement.querySelector('app-server-error-state');
    expect(errorState).toBeTruthy();
    expect(errorState.textContent).toContain('Impossibile caricare le metriche');
  });

  // Ogni card deve produrre il filtro che l'utente si aspetta nella lista issue.
  describe('Navigation & Filtering (Command Actions)', () => {
    
    it('should navigate to issues list without filters when clicking standard button', () => {
      fixture.detectChanges();
      
      const listBtn = fixture.nativeElement.querySelector('.btn-primary');
      listBtn.click();
      
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: {} });
    });

    it('should navigate passing CRITICAL priority filter when clicking the danger card', () => {
      fixture.detectChanges();
      
      const criticalCard = fixture.nativeElement.querySelector('.danger-border');
      criticalCard.click();
      
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: { priority: 'CRITICAL' } });
    });

    it('should navigate passing TODO status filter when clicking the workflow card', () => {
      fixture.detectChanges();
      
      
      const todoCard = fixture.nativeElement.querySelectorAll('.workflow-card')[0];
      todoCard.click();
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: { status: 'TODO' } });
    });

    it('should read localStorage and pass assigneeId when clicking "Assegnate a me"', () => {
      fixture.detectChanges();
      
      
      vi.mocked(localStorage.getItem).mockReturnValue('42');
      
      const myIssuesCard = fixture.nativeElement.querySelector('.primary-border');
      myIssuesCard.click();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('user_id');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: { assigneeId: '42' } });
    });

    it('should fallback to unfiltered list if localStorage has no user_id', () => {
      fixture.detectChanges();
      
      
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const myIssuesCard = fixture.nativeElement.querySelector('.primary-border');
      myIssuesCard.click();
      
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: {} });
    });
  });
});
