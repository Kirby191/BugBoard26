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

    // Mocks inizializzati in modo sicuro[cite: 3, 5]
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

  it('should render the project table correctly (DOM Testing)', () => {
    fixture.detectChanges(); // Innesca ngOnInit

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    const firstRowText = rows[0].textContent;
    expect(firstRowText).toContain('#1');
    expect(firstRowText).toContain('Progetto Alpha');
  });

  it('should show error banner if getProjects fails', () => {
    projectQueryServiceMock.getProjects.mockReturnValue(throwError(() => new Error('API down')));
    
    fixture.detectChanges();

    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Impossibile caricare i progetti');
  });

  it('should navigate to create when "+ Nuovo Progetto" is clicked', () => {
    fixture.detectChanges();
    const createBtn = fixture.nativeElement.querySelector('.btn-primary');
    createBtn.click();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects/new']);
  });

  it('should navigate to edit when "Modifica" is clicked', () => {
    fixture.detectChanges();
    const editBtn = fixture.nativeElement.querySelectorAll('.btn-warning')[0];
    editBtn.click();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects/edit', 1]);
  });

  it('should call deleteProject and reload list when delete is confirmed', () => {
    fixture.detectChanges();
    
    // Spia e simula la finestra di conferma del browser (l'utente clicca OK)
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
    deleteBtn.click();

    expect(window.confirm).toHaveBeenCalled();
    expect(projectCommandServiceMock.deleteProject).toHaveBeenCalledWith(1);
    
    // Verifica che la lista venga ricaricata dopo l'eliminazione
    expect(projectQueryServiceMock.getProjects).toHaveBeenCalledTimes(2); // 1° Init + 2° Reload
  });

  it('should NOT call deleteProject when delete is canceled', () => {
    fixture.detectChanges();
    
    // Spia e simula la finestra di conferma (l'utente clicca Annulla)
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
    deleteBtn.click();

    expect(projectCommandServiceMock.deleteProject).not.toHaveBeenCalled();
  });
});