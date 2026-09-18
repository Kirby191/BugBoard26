// ----------------------------------------------------------
// APP / ISSUE / COMPONENTS / ISSUE LIST / ISSUE LIST
// ----------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service'; 
import { IssueService } from '../../services/issue.service';

import { IssueSummary, IssueFilter, UserReference } from '../../../dashboard-query/models/query-dtos'; 
import { ProjectState } from '../../../shared/models/shared-dtos';
import { IssueStatus, IssueType, IssuePriority } from '../../../shared/models/enums'; 
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ServerErrorStateComponent } from '../../../shared/components/server-error-state/server-error-state.component';
import { getServerErrorDetails, ServerErrorDetails } from '../../../shared/components/server-error-state/server-error-details';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent, ModalComponent, ServerErrorStateComponent],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly projectQueryService = inject(ProjectQueryService); 
  private readonly issueService = inject(IssueService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); 

  // ----------------------------------------------------------------
  // Modali e selezione della issue corrente
  // ----------------------------------------------------------------
  protected readonly isDeleteModalOpen = signal<boolean>(false);
  protected readonly issueToDelete = signal<number | null>(null);
  // ----------------------------------------------------------------
  // Risultati, caricamento e permessi
  // ----------------------------------------------------------------
  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isAdmin = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorData = signal<ServerErrorDetails | null>(null);
  protected readonly currentUserId = signal<number | null>(null);

  // ----------------------------------------------------------------
  // Opzioni dei filtri
  // ----------------------------------------------------------------
  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly usersList = signal<UserReference[]>([]);
  protected readonly issueStatuses: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  protected readonly issueTypes: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];
  protected readonly issuePriorities: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    /* ============================================================
      MODAL PROGETTO NON DISPONIBILE
      ============================================================
      Un solo modal viene riempito dinamicamente in base al caso rilevato.
      ============================================================ */
  protected readonly isMissingProjectModalOpen = signal<boolean>(false);
  protected readonly missingProjectTitle = signal<string>('');
  protected readonly missingProjectMessage = signal<string>('');
  protected readonly missingProjectType = signal<'info' | 'warning' | 'danger'>('info');
  protected readonly missingProjectConfirmText = signal<string>('');
  protected readonly missingProjectCancelText = signal<string>('');

    /* ============================================================
      RICERCA AVANZATA E FILTRI LOCALI
      ============================================================ */
  protected readonly isAdvancedSearchOpen = signal<boolean>(false);
  protected readonly activeLocalFilter = signal<'unassigned' | 'overdue' | null>(null);

  
  filterForm = new FormGroup({
    titleQuery: new FormControl<string | null>(null),
    projectId: new FormControl<number | null>(null),
    status: new FormControl<IssueStatus | null>(null),
    type: new FormControl<IssueType | null>(null),
    priority: new FormControl<IssuePriority | null>(null),
    assigneeId: new FormControl<number | null>(null)
  });

  ngOnInit(): void {
    // I query params sono la sorgente unica dei filtri: consentono di condividere e ricaricare la ricerca.
    const userIdStr = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

    if (userIdStr) {
      this.currentUserId.set(Number(userIdStr));
    }

    this.loadFilterOptions();

    // La pagina può essere aperta dalla dashboard: i filtri arrivano quindi dall'URL.
    this.route.queryParams.subscribe(params => {
      const filter: IssueFilter = {};
      
      if (params['projectId']) filter.projectId = Number(params['projectId']);
      if (params['status']) filter.status = params['status'] as IssueStatus;
      if (params['type']) filter.type = params['type'] as IssueType;
      if (params['priority']) filter.priority = params['priority'] as IssuePriority;
      if (params['assigneeId']) filter.assigneeId = Number(params['assigneeId']);
      if (params['titleQuery']) filter.titleQuery = params['titleQuery'];

      // Il filtro locale non viene inviato al backend: rifinisce i risultati ricevuti.
      const localParam = params['localFilter'];
      if (localParam === 'unassigned' || localParam === 'overdue') {
        this.activeLocalFilter.set(localParam);
      } else {
        this.activeLocalFilter.set(null);
      }

      this.filterForm.patchValue({
        titleQuery: filter.titleQuery || null,
        projectId: filter.projectId || null,
        status: filter.status || null,
        type: filter.type || null,
        priority: filter.priority || null,
        assigneeId: filter.assigneeId || null
      }, { emitEvent: false }); 

      
      
      
      if (!localParam && (filter.projectId || filter.status || filter.type || filter.priority || filter.assigneeId)) {
        this.isAdvancedSearchOpen.set(true);
      } else {
        this.isAdvancedSearchOpen.set(false);
      }

      this.loadIssues(filter);
    });
  }

  // Carica in parallelo i dati necessari ai menu della ricerca avanzata.
  private loadFilterOptions(): void {
    this.dashboardService.getUsersReference().subscribe({
      next: (users) => this.usersList.set(users),
      error: (err) => this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare gli sviluppatori.'))
    });
    
    this.projectQueryService.getProjects().subscribe({
      next: (projects) => this.projects.set(projects),
      error: (err) => this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare i progetti.'))
    });
  }

  retryIssues(): void {
    this.errorData.set(null);
    this.loadFilterOptions();
    this.loadIssues(this.filterForm.getRawValue() as IssueFilter);
  }

  // Applica prima i filtri del backend e poi quelli locali, come "non assegnate" o "in scadenza".
  private loadIssues(filter: IssueFilter): void {
    this.isLoading.set(true);
    this.errorData.set(null); 
    
    this.dashboardService.searchIssues(filter).subscribe({
      next: (data) => {
        let processedData = data;

        
        
        
        const currentLocalFilter = this.activeLocalFilter();

        if (currentLocalFilter === 'unassigned') {
          // Unassigned vale solo per le issue di tipo BUG prive di assegnatario.
          processedData = processedData.filter(issue => !issue.assigneeId && issue.type === 'BUG');
        } 
        else if (currentLocalFilter === 'overdue') {
          // La finestra operativa include scadenze superate e prossimi sette giorni.
          const today = new Date();
          today.setHours(0, 0, 0, 0); 
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + 7);

          processedData = processedData.filter(issue => {
            
            if (issue.status === 'DONE' || !issue.dueDate) return false;
            
            
            const issueDate = new Date(issue.dueDate);
            return issueDate <= targetDate;
          });
        }

        
        this.issues.set(processedData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare le segnalazioni.'));
        this.isLoading.set(false);
      }
    });
  }

  
  toggleAdvancedSearch(): void {
    this.isAdvancedSearchOpen.update(v => !v);
  }

  applyFilters(): void {
    // La navigazione aggiorna l'URL; la sottoscrizione ai query params ricarica automaticamente la lista.
    const formValues = this.filterForm.getRawValue();
    const currentParams = { ...this.route.snapshot.queryParams };
    
    currentParams['titleQuery'] = formValues.titleQuery || null;
    currentParams['projectId'] = formValues.projectId || null;
    currentParams['status'] = formValues.status || null;
    currentParams['type'] = formValues.type || null;
    currentParams['priority'] = formValues.priority || null;
    currentParams['assigneeId'] = formValues.assigneeId || null;
    delete currentParams['localFilter'];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      queryParamsHandling: 'merge'
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.toggleAdvancedSearch();
    this.router.navigate(['/issues']); 
  }

  // ----------------------------------------------------------------
  // Permessi e azioni sulle issue
  // ----------------------------------------------------------------

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
          this.errorData.set(getServerErrorDetails(err, 'Errore durante l\'eliminazione della segnalazione.'));
        }
      });
    }
  }

  
  
  
   handleMissingProjectConfirm(): void {
    this.isMissingProjectModalOpen.set(false);
    
    if (this.isAdmin() && this.projects().length === 0) {
      this.router.navigate(['/projects/new']);
    }
  }

  handleMissingProjectCancel(): void {
    this.isMissingProjectModalOpen.set(false);
  }
  

  
  
  
  navigateToCreate(): void {
    if (this.projects().length > 0) {
      
      this.router.navigate(['/issues/new']);
    } else {
      
      if (this.isAdmin()) {
        
        this.missingProjectTitle.set('Nessun Progetto Trovato');
        this.missingProjectMessage.set('Non esistono progetti al momento! Per poter creare una segnalazione, è necessario che esista almeno un progetto nel sistema. Desideri crearne uno adesso?');
        this.missingProjectType.set('warning');
        this.missingProjectConfirmText.set('Crea nuovo progetto');
        this.missingProjectCancelText.set('Non ora');
      } else {
        
        this.missingProjectTitle.set('Impossibile Creare Segnalazione');
        this.missingProjectMessage.set('Non esistono progetti al momento nel sistema a cui poter assegnare la segnalazione. Ti preghiamo di attendere che un Amministratore crei un nuovo progetto.');
        this.missingProjectType.set('info');
        this.missingProjectConfirmText.set('Ho capito');
        this.missingProjectCancelText.set('');
      }
      
      this.isMissingProjectModalOpen.set(true);
    }
  }

  navigateToDetail(id: number): void { this.router.navigate(['/issues', id]); }
  navigateToEdit(id: number): void { this.router.navigate(['/issues/edit', id]); }
}