import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardStats } from '../../models/query-dtos';

describe('DashboardComponent', () => {
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

    // Mock sicuro di default
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
    
    // Predisponiamo lo spionaggio sul localStorage per testare goToMyIssues() 2]
    vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and load stats on init (DOM Testing)', () => {
    fixture.detectChanges(); // Innesca ngOnInit

    expect(dashboardServiceMock.getDashboardStats).toHaveBeenCalled();

    const values = fixture.nativeElement.querySelectorAll('.stat-value');
    const textValues = Array.from(values).map((node: any) => node.textContent.trim());

    expect(textValues).toContain('5');  // assignedToMeCount
    expect(textValues).toContain('2');  // criticalCount
  });

  it('should display an error banner if getDashboardStats fails (DOM Testing)', () => {
    dashboardServiceMock.getDashboardStats.mockReturnValue(throwError(() => new Error('API down')));
    fixture.detectChanges();

    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Impossibile caricare le metriche');
  });

  describe('Navigation & Filtering (Command Actions)', () => {
    
    it('should navigate to issues list without filters when clicking standard button', () => {
      fixture.detectChanges();
      
      const listBtn = fixture.nativeElement.querySelector('.btn-primary');
      listBtn.click();
      
      // Verifica l'assenza di parametri di filtro 2]
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: {} });
    });

    it('should navigate passing CRITICAL priority filter when clicking the danger card', () => {
      fixture.detectChanges();
      
      const criticalCard = fixture.nativeElement.querySelector('.danger-border');
      criticalCard.click();
      
      // Verifica la corretta applicazione del parametro di filtro per la Funzionalità 3 2]
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: { priority: 'CRITICAL' } });
    });

    it('should navigate passing TODO status filter when clicking the workflow card', () => {
      fixture.detectChanges();
      
      // Troviamo la card del TODO
      const todoCard = fixture.nativeElement.querySelectorAll('.workflow-card')[0];
      todoCard.click();
      
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: { status: 'TODO' } });
    });

    it('should read localStorage and pass assigneeId when clicking "Assegnate a me"', () => {
      fixture.detectChanges();
      
      // Simuliamo la presenza dell'utente loggato nel localStorage
      vi.mocked(localStorage.getItem).mockReturnValue('42');
      
      const myIssuesCard = fixture.nativeElement.querySelector('.primary-border');
      myIssuesCard.click();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('user_id');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: { assigneeId: '42' } });
    });

    it('should fallback to unfiltered list if localStorage has no user_id', () => {
      fixture.detectChanges();
      
      // Simuliamo assenza dell'utente loggato
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const myIssuesCard = fixture.nativeElement.querySelector('.primary-border');
      myIssuesCard.click();
      
      // Se non c'è ID, non applica il filtro
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues'], { queryParams: {} });
    });
  });
});
