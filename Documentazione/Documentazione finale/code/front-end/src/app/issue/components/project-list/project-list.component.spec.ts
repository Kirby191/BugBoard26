import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectListComponent } from './project-list.component';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectState } from '../../../shared/models/shared-dtos';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  
  let projectQueryServiceMock: any;
  let projectCommandServiceMock: any;
  let routerMock: any;

  const mockProjects: ProjectState[] = [
    { id: 1, name: 'Progetto Alpha', description: 'Desc A', lastModified: '2026-09-10' },
    { id: 2, name: 'Progetto Beta', description: 'Desc B', lastModified: '2026-09-11' }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    projectQueryServiceMock = {
      getProjects: vi.fn().mockReturnValue(of(mockProjects))
    };
    
    projectCommandServiceMock = {
      deleteProject: vi.fn().mockReturnValue(of({}))
    };
    
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        { provide: ProjectQueryService, useValue: projectQueryServiceMock },
        { provide: ProjectService, useValue: projectCommandServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ... (Test base identici a prima per caricamento e routing) ...

  it('should render the project table correctly (DOM Testing)', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

describe('Modal Integration for Deletion (Black-Box Testing)', () => {
    
    it('should open modal and NOT call deleteService immediately when "Elimina" is clicked', () => {
      fixture.detectChanges(); // Init

      // 1. Verifichiamo che inizialmente il modale sia chiuso (DOM Testing indiretto di isModalOpen=false)
      expect(fixture.nativeElement.querySelector('.modal-content')).toBeNull();

      // 2. Clicchiamo il tasto rosso "Elimina" della prima riga (Progetto Alpha, ID: 1)
      const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
      deleteBtn.click();
      
      // 3. Sincronizza il DOM con il nuovo stato del Signal
      fixture.detectChanges(); 

      // 4. Verifichiamo che il contenuto del modale sia COMPARSO (DOM Testing indiretto di isModalOpen=true)
      const modalContent = fixture.nativeElement.querySelector('.modal-content');
      expect(modalContent).toBeTruthy();
      
      // Il servizio NON deve essere stato chiamato
      expect(projectCommandServiceMock.deleteProject).not.toHaveBeenCalled();
    });

    it('should call deleteProject with correct ID and close modal when confirmDelete is triggered', () => {
      fixture.detectChanges(); // Init

      // 1. Apriamo il modale cliccando fisicamente l'HTML (questo salva l'ID nel Signal projectToDelete)
      const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
      deleteBtn.click();
      fixture.detectChanges();

      // 2. Invochiamo il metodo pubblico scatenato dal modale
      component.confirmDelete();
      fixture.detectChanges(); // Aggiorna il DOM dopo la chiusura

      // 3. Verifica indiretta di `projectToDelete`: 
      // Se il mock riceve '1', significa che il Signal protetto ha salvato il dato correttamente!
      expect(projectCommandServiceMock.deleteProject).toHaveBeenCalledWith(1);
      
      // 4. Verifica indiretta di `isModalOpen`: 
      // Se il modale scompare dal DOM, significa che il Signal è tornato a false
      expect(fixture.nativeElement.querySelector('.modal-content')).toBeNull();
    });

    it('should close modal and NOT call deleteProject when cancelDelete is triggered', () => {
      fixture.detectChanges(); // Init

      // Apriamo il modale
      const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
      deleteBtn.click();
      fixture.detectChanges();

      // Annulliamo l'operazione tramite il metodo pubblico
      component.cancelDelete();
      fixture.detectChanges();

      // Il DB non deve essere stato toccato
      expect(projectCommandServiceMock.deleteProject).not.toHaveBeenCalled();
      
      // Il modale deve essere sparito dal DOM
      expect(fixture.nativeElement.querySelector('.modal-content')).toBeNull();
    });
  });
});