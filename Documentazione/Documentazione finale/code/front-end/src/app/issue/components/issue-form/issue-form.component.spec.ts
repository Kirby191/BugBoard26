import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueFormComponent } from './issue-form.component';
import { IssueService } from '../../services/issue.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ProjectState, IssueDetailed } from '../../../dashboard-query/models/query-dtos';

describe('IssueFormComponent', () => {
  let component: IssueFormComponent;
  let fixture: ComponentFixture<IssueFormComponent>;

  // Mock dei servizi per l'Isolation Testing
  let issueServiceMock: any;
  let dashboardServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  const mockProjects: ProjectState[] = [
    { id: 1, name: 'Progetto Alpha', description: 'Desc', lastModified: '2026-09-10' }
  ];

  const mockIssueDetailed: IssueDetailed = {
    id: 10, projectId: 1, projectName: 'Progetto Alpha', title: 'Bug Login',
    description: 'Il login fallisce', status: 'TODO', type: 'BUG', priority: 'HIGH',
    dueDate: '2026-12-31', creatorEmail: 'test@test.com', createdAt: '2026-09-10'
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    // Inizializzazione Mock
    issueServiceMock = {
      createIssue: vi.fn().mockReturnValue(of({})),
      updateIssue: vi.fn().mockReturnValue(of({})),
      setDueDate: vi.fn().mockReturnValue(of({}))
    };

    dashboardServiceMock = {
      getProjects: vi.fn().mockReturnValue(of(mockProjects)),
      getIssueDetailed: vi.fn().mockReturnValue(of(mockIssueDetailed))
    };

    routerMock = { navigate: vi.fn() };
    locationMock = { back: vi.fn() };

    // Di default, simuliamo la Creazione (nessun parametro 'id' nella rotta)
    activatedRouteMock = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } }
    };

    await TestBed.configureTestingModule({
      imports: [IssueFormComponent],
      providers: [
        { provide: IssueService, useValue: issueServiceMock },
        { provide: DashboardService, useValue: dashboardServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IssueFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization (Create Mode)', () => {
    it('should initialize with an empty form and load projects', () => {
      fixture.detectChanges(); // Innesca ngOnInit

      // Il form deve essere invalido all'avvio a causa dei Validators.required
      expect(component.issueForm.valid).toBe(false);
      expect(dashboardServiceMock.getProjects).toHaveBeenCalled();
      
      // Lo status non serve in creazione, quindi deve essere disabilitato[cite: 8]
      expect(component.issueForm.get('status')?.disabled).toBe(true);
    });

    it('should enforce domain constraints (Title max 32, Desc max 500)', () => {
      fixture.detectChanges();

      // Test validazione superamento limiti (Equivalence Classes: Invalid)[cite: 6, 8]
      component.issueForm.patchValue({
        projectId: 1,
        title: 'a'.repeat(33), // Troppo lungo
        description: 'b'.repeat(501), // Troppo lunga
        type: 'BUG'
      });

      expect(component.issueForm.valid).toBe(false);
      expect(component.issueForm.get('title')?.hasError('maxlength')).toBe(true);
      expect(component.issueForm.get('description')?.hasError('maxlength')).toBe(true);
    });
  });

  describe('Submit Logic (Create Mode)', () => {
    it('should show an error banner if submitted with invalid form (DOM Testing)', () => {
      fixture.detectChanges();
      
      // Eseguiamo il submit con form vuoto
      component.onSubmit();
      fixture.detectChanges();

      // Black-Box Testing: verifichiamo la comparsa dell'errore nell'HTML
      const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
      expect(errorAlert).toBeTruthy();
      expect(errorAlert.textContent).toContain('Compila correttamente i campi');
      
      // Il servizio di back-end non deve essere mai chiamato
      expect(issueServiceMock.createIssue).not.toHaveBeenCalled();
    });

    it('should call createIssue and navigate on success', () => {
      fixture.detectChanges();

      issueServiceMock.createIssue.mockReturnValue(of({})); // Simuliamo successo

      component.issueForm.patchValue({
        projectId: 1, title: 'Titolo valido', description: 'Descrizione valida',
        type: 'BUG', priority: 'LOW'
      });

      component.onSubmit();

      expect(issueServiceMock.createIssue).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/issues']);
    });
  });

  describe('Initialization and Submit (Edit Mode)', () => {
    beforeEach(() => {
      // Modifichiamo la rotta per simulare Edit Mode (es. /issues/edit/10)
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('10');
    });

    it('should load issue details, patch the form and disable projectId/type', () => {
      fixture.detectChanges(); // Innesca ngOnInit in modalità Edit

      expect(dashboardServiceMock.getIssueDetailed).toHaveBeenCalledWith(10);
      
      // I campi chiave non possono essere modificati in Edit
      expect(component.issueForm.get('projectId')?.disabled).toBe(true);
      expect(component.issueForm.get('type')?.disabled).toBe(true);
      
      // I dati pregressi devono essere stati caricati nel form
      expect(component.issueForm.get('title')?.value).toBe('Bug Login');
      expect(component.issueForm.get('status')?.disabled).toBe(false); // Status diviene modificabile
    });

    it('should call updateIssue and setDueDate, then navigate back on success (Branch Coverage)', () => {
      fixture.detectChanges(); // Patch dei valori tramite mock

      issueServiceMock.updateIssue.mockReturnValue(of({}));
      issueServiceMock.setDueDate.mockReturnValue(of({})); // Simuliamo successo per Funzionalità 18

      // Modifichiamo solo lo status e lasciamo la dueDate valorizzata
      component.issueForm.patchValue({ status: 'IN_PROGRESS' });
      
      component.onSubmit();

      // Verifica Branch: poiché dueDate esiste, deve chiamare entrambi i metodi[cite: 6, 9]
      expect(issueServiceMock.updateIssue).toHaveBeenCalled();
      expect(issueServiceMock.setDueDate).toHaveBeenCalledWith(10, '2026-12-31');
      
      expect(locationMock.back).toHaveBeenCalled();
    });

    it('should ONLY call updateIssue if dueDate is not provided', () => {
      fixture.detectChanges(); // Patch dei valori tramite mock

      issueServiceMock.updateIssue.mockReturnValue(of({}));

      // Rimuoviamo la data di scadenza
      component.issueForm.patchValue({ dueDate: null });
      
      component.onSubmit();

      expect(issueServiceMock.updateIssue).toHaveBeenCalled();
      expect(issueServiceMock.setDueDate).not.toHaveBeenCalled(); // Non deve aggiornare la scadenza
    });
  });

  describe('Error Handling', () => {
    it('should display server error messages on API failure (DOM Testing)', () => {
      fixture.detectChanges();
      
      // Mockiamo un errore 500 o 400 dal backend
      issueServiceMock.createIssue.mockReturnValue(throwError(() => ({
        error: { message: 'Errore generico dal server' }
      })));

      component.issueForm.patchValue({
        projectId: 1, title: 'Valid Title', description: 'Valid Desc', type: 'BUG'
      });

      component.onSubmit();
      fixture.detectChanges();

      const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
      expect(errorAlert).toBeTruthy();
      expect(errorAlert.textContent).toContain('Errore generico dal server');
    });
  });
});
