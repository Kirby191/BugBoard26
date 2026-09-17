// ------------------------------------------------------------------------
// APP / ISSUE / COMPONENTS / PROJECT LIST / PROJECT LIST.COMPONENT
// ------------------------------------------------------------------------

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

  

  it('should render the project table correctly (DOM Testing)', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

describe('Modal Integration for Deletion (Black-Box Testing)', () => {
    
    it('should open modal and NOT call deleteService immediately when "Elimina" is clicked', () => {
      fixture.detectChanges(); 

      
      expect(fixture.nativeElement.querySelector('.modal-content')).toBeNull();

      
      const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
      deleteBtn.click();
      
      
      fixture.detectChanges(); 

      
      const modalContent = fixture.nativeElement.querySelector('.modal-content');
      expect(modalContent).toBeTruthy();
      
      
      expect(projectCommandServiceMock.deleteProject).not.toHaveBeenCalled();
    });

    it('should call deleteProject with correct ID and close modal when confirmDelete is triggered', () => {
      fixture.detectChanges(); 

      
      const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
      deleteBtn.click();
      fixture.detectChanges();

      
      component.confirmDelete();
      fixture.detectChanges(); 

      
      
      expect(projectCommandServiceMock.deleteProject).toHaveBeenCalledWith(1);
      
      
      
      expect(fixture.nativeElement.querySelector('.modal-content')).toBeNull();
    });

    it('should close modal and NOT call deleteProject when cancelDelete is triggered', () => {
      fixture.detectChanges(); 

      
      const deleteBtn = fixture.nativeElement.querySelectorAll('.btn-danger')[0];
      deleteBtn.click();
      fixture.detectChanges();

      
      component.cancelDelete();
      fixture.detectChanges();

      
      expect(projectCommandServiceMock.deleteProject).not.toHaveBeenCalled();
      
      
      expect(fixture.nativeElement.querySelector('.modal-content')).toBeNull();
    });
  });
});