import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectFormComponent } from './project-form.component';
import { ProjectService } from '../../services/project.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { ProjectState } from '../../../shared/models/shared-dtos';

describe('ProjectFormComponent', () => {
  let component: ProjectFormComponent;
  let fixture: ComponentFixture<ProjectFormComponent>;

  let projectCommandMock: any;
  let projectQueryMock: any;
  let routerMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  const mockProject: ProjectState = {
    id: 10, name: 'Progetto Esistente', description: 'Vecchia descrizione', lastModified: '2026-09-10'
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    // Mocks di default sicuri per prevenire TypeError
    projectCommandMock = {
      createProject: vi.fn().mockReturnValue(of({})),
      updateProject: vi.fn().mockReturnValue(of({}))
    };

    projectQueryMock = {
      getProjectById: vi.fn().mockReturnValue(of(mockProject))
    };

    routerMock = { navigate: vi.fn() };
    locationMock = { back: vi.fn() };

    // Di default, simuliamo la Creazione (nessun parametro 'id' nella rotta)
    activatedRouteMock = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } }
    };

    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
      providers: [
        { provide: ProjectService, useValue: projectCommandMock },
        { provide: ProjectQueryService, useValue: projectQueryMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Create Mode', () => {
    it('should initialize empty and invalidate form if name is missing', () => {
      fixture.detectChanges();

      expect(component.projectForm.valid).toBe(false); // Nome è obbligatorio
      
      // DOM Testing: verifichiamo che il titolo della pagina rispecchi la modalità "Nuovo"
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toContain('Nuovo Progetto');
      
      expect(projectQueryMock.getProjectById).not.toHaveBeenCalled();
    });

    it('should enforce max length constraint on name', () => {
      fixture.detectChanges();
      
      component.projectForm.patchValue({
        name: 'a'.repeat(151) // Supera il limite
      });

      expect(component.projectForm.valid).toBe(false);
      expect(component.projectForm.get('name')?.hasError('maxlength')).toBe(true);
    });

    it('should call createProject and navigate on valid submit', () => {
      fixture.detectChanges();

      component.projectForm.patchValue({ name: 'Nuovo Prog', description: 'Test' });
      component.onSubmit();

      expect(projectCommandMock.createProject).toHaveBeenCalledWith({
        name: 'Nuovo Prog', description: 'Test'
      });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      // Modifica il mock della rotta per simulare Edit Mode
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('10');
    });

    it('should load project data via query service and patch form (DOM Testing)', () => {
      fixture.detectChanges(); // Innesca ngOnInit

      // DOM Testing: verifichiamo che il titolo della pagina rispecchi la modalità "Modifica"
      const title = fixture.nativeElement.querySelector('h2');
      expect(title.textContent).toContain('Modifica Progetto');

      expect(projectQueryMock.getProjectById).toHaveBeenCalledWith(10);
      
      // Verifica che il form sia stato riempito
      expect(component.projectForm.get('name')?.value).toBe('Progetto Esistente');
      expect(component.projectForm.get('description')?.value).toBe('Vecchia descrizione');
    });

    it('should call updateProject and navigate on valid submit', () => {
      fixture.detectChanges();

      // Simuliamo la modifica del nome
      component.projectForm.patchValue({ name: 'Nome Aggiornato' });
      component.onSubmit();

      expect(projectCommandMock.updateProject).toHaveBeenCalledWith(10, {
        name: 'Nome Aggiornato', description: 'Vecchia descrizione'
      });
      expect(routerMock.navigate).toHaveBeenCalledWith(['/projects']);
    });
  });

  describe('Error Handling', () => {
    it('should display error banner on backend failure (DOM Testing)', () => {
      fixture.detectChanges();
      
      projectCommandMock.createProject.mockReturnValue(throwError(() => ({
        error: { message: 'Errore dal backend' }
      })));

      component.projectForm.patchValue({ name: 'Valid Name' });
      component.onSubmit();
      fixture.detectChanges();

      // DOM Testing: elusione di errorMessage()
      const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
      expect(errorAlert).toBeTruthy();
      expect(errorAlert.textContent).toContain('Errore dal backend');
    });
  });
});