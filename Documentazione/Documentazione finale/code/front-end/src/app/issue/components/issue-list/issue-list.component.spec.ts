import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueListComponent } from './issue-list.component';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IssueSummary } from '../../../dashboard-query/models/query-dtos';

describe('IssueListComponent', () => {
  let component: IssueListComponent;
  let fixture: ComponentFixture<IssueListComponent>;
  
  let dashboardServiceMock: any;
  let routerMock: any;

  const mockIssues: IssueSummary[] = [
    {
      id: 1, title: 'Bug Critico UI', projectName: 'Progetto Alpha', 
      type: 'BUG', status: 'TODO', priority: 'CRITICAL', assigneeEmail: 'admin@bugboard.com'
    },
    {
      id: 2, title: 'Nuovo Bottone', projectName: 'Progetto Alpha', 
      type: 'FEATURE', status: 'IN_PROGRESS', priority: 'LOW', assigneeEmail: undefined
    }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    // Mock dei servizi per l'Isolation Testing
    dashboardServiceMock = {
      searchIssues: vi.fn()
    };
    
    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [IssueListComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IssueListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the component', () => {
    // Rendiamo safe il costruttore mockando un ritorno base
    dashboardServiceMock.searchIssues.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load issues and render them in the table (DOM Testing)', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(of(mockIssues));
    
    fixture.detectChanges(); // Innesca ngOnInit e carica i dati

    // Verifica che l'indicatore di caricamento sia sparito[cite: 4]
    const loadingSpinner = fixture.nativeElement.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeNull();

    // Verifica la tabella
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // Verifica i dati della prima riga (renderizzati dai DTO leggeri IssueSummary)
    const firstRowContent = rows[0].textContent;
    expect(firstRowContent).toContain('#1');
    expect(firstRowContent).toContain('Bug Critico UI');
    expect(firstRowContent).toContain('CRITICAL');
  });

  it('should display an error banner if searchIssues fails', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(throwError(() => new Error('API down')));
    
    fixture.detectChanges();

    // Verifica che il DOM mostri l'alert e nasconda il loader
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Impossibile caricare le segnalazioni');
    
    const loadingSpinner = fixture.nativeElement.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeNull();
  });

  it('should navigate to create issue form when "+ Nuova Segnalazione" is clicked', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(of([]));
    fixture.detectChanges();

    // Simula click dal DOM[cite: 4]
    const createBtn = fixture.nativeElement.querySelector('.btn-primary');
    createBtn.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/new']);
  });

  it('should navigate to detail view when "Dettagli" is clicked', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(of(mockIssues));
    fixture.detectChanges();

    const detailBtn = fixture.nativeElement.querySelectorAll('.btn-info')[0];
    detailBtn.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues', 1]);
  });

  it('should navigate to edit view when "Modifica" is clicked', () => {
    dashboardServiceMock.searchIssues.mockReturnValue(of(mockIssues));
    fixture.detectChanges();

    const editBtn = fixture.nativeElement.querySelectorAll('.btn-warning')[0];
    editBtn.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/edit', 1]);
  });
});
