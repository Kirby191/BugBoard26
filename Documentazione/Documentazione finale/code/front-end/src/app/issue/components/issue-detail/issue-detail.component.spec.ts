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
  
  // Mocks per isolare il componente (Isolation Testing)
  let dashboardServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  // Dati fittizi per i test
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

    // Setup dei mock con Vitest
    dashboardServiceMock = {
      getIssueDetailed: vi.fn(),
      getBugHistory: vi.fn()
    };
    routerMock = { navigate: vi.fn() };
    locationMock = { back: vi.fn() };
    
    // Simuliamo che la rotta contenga l'ID '10' di default
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
    // Modifichiamo il mock della rotta per restituire null
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
    
    fixture.detectChanges(); // Esegue ngOnInit e triggera il rendering del DOM

    // Verifica la comparsa dell'errore
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('ID segnalazione non valido');
    
    // DOM Testing: verifichiamo che l'indicatore di caricamento sia scomparso
    const loadingIndicator = fixture.nativeElement.querySelector('.loading');
    expect(loadingIndicator).toBeNull();
  });

  it('should load a FEATURE issue and NOT call getBugHistory (Branch Coverage)', () => {
    dashboardServiceMock.getIssueDetailed.mockReturnValue(of(mockFeature));
    
    fixture.detectChanges(); // Innesca ngOnInit e la chiamata al servizio
    
    expect(dashboardServiceMock.getIssueDetailed).toHaveBeenCalledWith(10);
    // Verifica diramazione: se non è BUG, non deve scaricare la cronologia
    expect(dashboardServiceMock.getBugHistory).not.toHaveBeenCalled();
    
    // Verifica DOM Testing
    const titleHeader = fixture.nativeElement.querySelector('h2');
    expect(titleHeader.textContent).toContain('#10 - Nuova UI');
    
    const typeBadge = fixture.nativeElement.querySelector('.type-feature');
    expect(typeBadge.textContent).toContain('FEATURE');
  });

  it('should load a BUG issue AND call getBugHistory to display timeline (Branch Coverage)', () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('11');
    dashboardServiceMock.getIssueDetailed.mockReturnValue(of(mockBug));
    dashboardServiceMock.getBugHistory.mockReturnValue(of(mockHistory));
    
    fixture.detectChanges(); // Innesca ngOnInit
    
    expect(dashboardServiceMock.getIssueDetailed).toHaveBeenCalledWith(11);
    // Verifica diramazione: siccome è BUG, deve aver richiesto lo storico
    expect(dashboardServiceMock.getBugHistory).toHaveBeenCalledWith(11);
    
    // Verifica DOM Testing sulla Timeline
    const historyCard = fixture.nativeElement.querySelector('.history-card');
    expect(historyCard).toBeTruthy(); // Il pannello storico deve esistere
    
    const actionText = fixture.nativeElement.querySelector('.timeline-item .action');
    expect(actionText.textContent).toContain('CREATED');
  });

  it('should handle API errors when fetching issue details and hide loading', () => {
    dashboardServiceMock.getIssueDetailed.mockReturnValue(throwError(() => new Error('Network error')));
    
    fixture.detectChanges(); // Forza il ricalcolo del DOM post-errore

    // Verifica la comparsa dell'errore
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Impossibile caricare i dettagli');
    
    // DOM Testing: verifichiamo che il div .loading non esista più nel DOM[cite: 3]
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

    // Simuliamo il click chiamando direttamente il metodo scatenato dall'HTML
    component.goToEdit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues/edit', 10]);
  });
});
