import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueListComponent } from './issue-list.component';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IssueSummary } from '../../../dashboard-query/models/query-dtos';

describe('IssueListComponent', () => {
  let component: IssueListComponent;
  let fixture: ComponentFixture<IssueListComponent>;
  
  let dashboardServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  const mockIssues: IssueSummary[] = [
    {
      id: 1, title: 'Bug Critico UI', projectName: 'Progetto Alpha', 
      type: 'BUG', status: 'TODO', priority: 'CRITICAL', assigneeEmail: 'admin@bugboard.com'
    }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    // Mock aggiornato con TUTTE le chiamate usate nell'ngOnInit[cite: 4]
    dashboardServiceMock = {
      searchIssues: vi.fn().mockReturnValue(of(mockIssues)),
      getUsersReference: vi.fn().mockReturnValue(of([])) // <-- Mock mancante aggiunto!
    };
    
    routerMock = { navigate: vi.fn() };

    // Creiamo il mock di base per la rotta con query parameters vuoti
    activatedRouteMock = {
      queryParams: of({}),
      snapshot: { queryParams: {} } // Utile per il metodo applyFilters
    };

    await TestBed.configureTestingModule({
      imports: [IssueListComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
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
    fixture.detectChanges(); // Innesca ngOnInit
    
    expect(dashboardServiceMock.searchIssues).toHaveBeenCalledWith({});
    // Verifichiamo che anche il nuovo metodo venga chiamato
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

  it('should display an error banner if searchIssues fails', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(throwError(() => new Error('API down')));
    fixture.detectChanges();

    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Impossibile caricare le segnalazioni');
  });

  describe('Navigation Actions', () => {
    it('should navigate to create issue form when "+ Nuova Segnalazione" is clicked', () => {
      fixture.detectChanges();
      const createBtn = fixture.nativeElement.querySelector('.btn-primary');
      createBtn.click();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/new']);
    });

    it('should navigate to detail view when "Dettagli" is clicked', () => {
      fixture.detectChanges();
      const detailBtn = fixture.nativeElement.querySelectorAll('.btn-info')[0];
      detailBtn.click();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues', 1]);
    });

    it('should navigate to edit view when "Modifica" is clicked', () => {
      fixture.detectChanges();
      const editBtn = fixture.nativeElement.querySelectorAll('.btn-warning')[0];
      editBtn.click();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/edit', 1]);
    });
  });
});