import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IssueDetailComponent } from './issue-detail.component';
import { provideRouter } from '@angular/router';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { of } from 'rxjs';

describe('IssueDetailComponent', () => {
  let component: IssueDetailComponent;
  let fixture: ComponentFixture<IssueDetailComponent>;

  beforeEach(async () => {
    // 1. Mock Object per il dettaglio
    const dashboardServiceMock = {
      getIssueDetailed: () => of({}),
      getBugHistory: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [IssueDetailComponent],
      providers: [
        provideRouter([]), // Risolve l'errore su ActivatedRoute
        { provide: DashboardService, useValue: dashboardServiceMock } // Sostituisce la rete
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IssueDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
