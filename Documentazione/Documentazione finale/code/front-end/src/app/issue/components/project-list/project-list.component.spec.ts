// ------------------------------------------------------------------------
// APP / ISSUE / COMPONENTS / PROJECT LIST / PROJECT LIST.COMPONENT
// ------------------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectListComponent } from './project-list.component';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectState } from '../../../shared/models/shared-dtos';

describe('ProjectListComponent', () => {
  let component: ProjectListComponent;
  let fixture: ComponentFixture<ProjectListComponent>;
  
  let projectQueryServiceMock: any;
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
    
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [
        { provide: ProjectQueryService, useValue: projectQueryServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the project folders correctly', () => {
    fixture.detectChanges();
    const folders = fixture.nativeElement.querySelectorAll('.project-folder');
    expect(folders.length).toBe(2);
    expect(folders[0].textContent).toContain('Progetto Alpha');
  });

  it('should navigate to the selected project detail', () => {
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.project-folder')[1].click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', 2]);
  });

  it('should show the server error state when projects cannot be loaded', () => {
    projectQueryServiceMock.getProjects.mockReturnValue(throwError(() => new Error('API down')));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-server-error-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.empty-state-container')).toBeNull();
  });
});