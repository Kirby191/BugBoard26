import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueListComponent } from './issue-list.component';
import { provideRouter } from '@angular/router';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { of } from 'rxjs'; // Serve per creare un Observable fittizio

describe('IssueListComponent', () => {
  let component: IssueListComponent;
  let fixture: ComponentFixture<IssueListComponent>;

  beforeEach(async () => {
    const dashboardServiceMock = {
      searchIssues: () => of([]) // Ritorna un array vuoto istantaneamente senza rete
    };

    await TestBed.configureTestingModule({
      imports: [IssueListComponent],
      providers: [
        provideRouter([]), // Risolve il routing
        // 2. Dependency Injection per il Test: quando viene richiesto DashboardService, usa il Mock
        { provide: DashboardService, useValue: dashboardServiceMock }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IssueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
