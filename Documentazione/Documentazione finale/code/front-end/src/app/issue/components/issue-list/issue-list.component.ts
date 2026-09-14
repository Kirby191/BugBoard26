import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service'; // <-- Aggiunto
import { IssueService } from '../../services/issue.service';

import { IssueSummary, IssueFilter, UserReference } from '../../../dashboard-query/models/query-dtos'; 
import { ProjectState } from '../../../shared/models/shared-dtos';
import { IssueStatus, IssueType, IssuePriority } from '../../../shared/models/enums'; 
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent, ModalComponent],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly projectQueryService = inject(ProjectQueryService); // Inietto il servizio progetti
  private readonly issueService = inject(IssueService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); 

  // --- STATO DEL MODALE DI ELIMINAZIONE ---
  protected readonly isDeleteModalOpen = signal<boolean>(false);
  protected readonly issueToDelete = signal<number | null>(null);

  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly currentUserId = signal<number | null>(null);

  // --- STATO PER I FILTRI ---
  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly usersList = signal<UserReference[]>([]);
  protected readonly issueStatuses: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  protected readonly issueTypes: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];
  protected readonly issuePriorities: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']; // <-- Aggiunto

  // Signal per la tendina della ricerca avanzata
  protected readonly isAdvancedSearchOpen = signal<boolean>(false);

  // Form espanso con TUTTI i parametri previsti dalla Funzionalità 3
  filterForm = new FormGroup({
    titleQuery: new FormControl<string | null>(null),
    projectId: new FormControl<number | null>(null),
    status: new FormControl<IssueStatus | null>(null),
    type: new FormControl<IssueType | null>(null),
    priority: new FormControl<IssuePriority | null>(null),
    assigneeId: new FormControl<number | null>(null)
  });

  ngOnInit(): void {
    const userIdStr = localStorage.getItem('user_id');
    if (userIdStr) {
      this.currentUserId.set(Number(userIdStr));
    }

    this.loadFilterOptions();

    this.route.queryParams.subscribe(params => {
      const filter: IssueFilter = {};
      
      if (params['projectId']) filter.projectId = Number(params['projectId']);
      if (params['status']) filter.status = params['status'] as IssueStatus;
      if (params['type']) filter.type = params['type'] as IssueType;
      if (params['priority']) filter.priority = params['priority'] as IssuePriority;
      if (params['assigneeId']) filter.assigneeId = Number(params['assigneeId']);
      if (params['titleQuery']) filter.titleQuery = params['titleQuery'];

      this.filterForm.patchValue({
        titleQuery: filter.titleQuery || null,
        projectId: filter.projectId || null,
        status: filter.status || null,
        type: filter.type || null,
        priority: filter.priority || null,
        assigneeId: filter.assigneeId || null
      }, { emitEvent: false }); 

      // UX: Se l'utente arriva tramite un link con filtri avanzati attivi (es. dalla Dashboard), 
      // apriamo automaticamente il pannello per mostrare cosa sta filtrando.
      if (filter.projectId || filter.status || filter.type || filter.priority || filter.assigneeId) {
        this.isAdvancedSearchOpen.set(true);
      }

      this.loadIssues(filter);
    });
  }

  private loadFilterOptions(): void {
    this.dashboardService.getUsersReference().subscribe(u => this.usersList.set(u));
    // Popoliamo dinamicamente i progetti per la ricerca avanzata
    this.projectQueryService.getProjects().subscribe(p => this.projects.set(p));
  }

  private loadIssues(filter: IssueFilter): void {
    this.isLoading.set(true);
    this.errorMessage.set(null); 
    
    this.dashboardService.searchIssues(filter).subscribe({
      next: (data) => {
        this.issues.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossibile caricare le segnalazioni.');
        this.isLoading.set(false);
      }
    });
  }

  // Alterna l'apertura/chiusura della ricerca avanzata
  toggleAdvancedSearch(): void {
    this.isAdvancedSearchOpen.update(v => !v);
  }

  applyFilters(): void {
    const formValues = this.filterForm.getRawValue();
    const currentParams = { ...this.route.snapshot.queryParams };
    
    currentParams['titleQuery'] = formValues.titleQuery || null;
    currentParams['projectId'] = formValues.projectId || null;
    currentParams['status'] = formValues.status || null;
    currentParams['type'] = formValues.type || null;
    currentParams['priority'] = formValues.priority || null;
    currentParams['assigneeId'] = formValues.assigneeId || null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      queryParamsHandling: 'merge'
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.isAdvancedSearchOpen.set(false);
    this.router.navigate(['/issues']); 
  }

  // ==========================================================================
  // GESTIONE DEI PERMESSI E AZIONI SULLA TABELLA (Invariati)
  // ==========================================================================

  canModify(issue: IssueSummary): boolean {
    const role = localStorage.getItem('user_role');
    const userId = this.currentUserId();
    if (role === 'ADMIN') return true;
    if (issue.type === 'BUG') {
      return issue.assigneeId === userId;
    }
    return issue.reporterId === userId;
  }

  canDelete(issue: IssueSummary): boolean {
    const role = localStorage.getItem('user_role');
    const userId = this.currentUserId();
    if (role === 'ADMIN') return true;
    return issue.reporterId === userId;
  }
  
  // ==========================================================================
  // GESTIONE DEL MODALE DI ELIMINAZIONE
  // ==========================================================================

  openDeleteModal(id: number): void {
    this.issueToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.isDeleteModalOpen.set(false);
    this.issueToDelete.set(null);
  }

  confirmDelete(): void {
    const id = this.issueToDelete();
    if (id !== null) {
      this.issueService.deleteIssue(id).subscribe({
        next: () => {
          this.isDeleteModalOpen.set(false);
          this.issueToDelete.set(null);
          const currentFilter = this.filterForm.getRawValue() as any;
          this.loadIssues(currentFilter);
        },
        error: (err) => {
          this.isDeleteModalOpen.set(false);
          this.issueToDelete.set(null);
          this.errorMessage.set(err.error?.message || 'Errore durante l\'eliminazione della segnalazione.');
        }
      });
    }
  }

  

  navigateToCreate(): void { this.router.navigate(['/issues/new']); }
  navigateToDetail(id: number): void { this.router.navigate(['/issues', id]); }
  navigateToEdit(id: number): void { this.router.navigate(['/issues/edit', id]); }
}