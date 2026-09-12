import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // RouterLink aggiunto per consistenza
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueSummary, IssueFilter, UserReference } from '../../../dashboard-query/models/query-dtos'; 
import { ProjectState } from '../../../shared/models/shared-dtos';
import { IssueStatus, IssueType, IssuePriority } from '../../../shared/models/enums'; 

import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent], 
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); 

  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  // --- STATO PER I FILTRI ---
  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly usersList = signal<UserReference[]>([]);
  protected readonly issueStatuses: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  protected readonly issueTypes: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];

  // Form reattivo per legare i valori visivi dei filtri
  filterForm = new FormGroup({
    projectId: new FormControl<number | null>(null),
    status: new FormControl<IssueStatus | null>(null),
    type: new FormControl<IssueType | null>(null)
  });

  ngOnInit(): void {
    // Carichiamo i dati di supporto per le tendine dei filtri
    this.loadFilterOptions();

    // Ascoltiamo l'URL. Se l'utente clicca dalla Dashboard, i filtri si aggiornano
    this.route.queryParams.subscribe(params => {
      const filter: IssueFilter = {};
      
      if (params['projectId']) filter.projectId = Number(params['projectId']);
      if (params['status']) filter.status = params['status'] as IssueStatus;
      if (params['type']) filter.type = params['type'] as IssueType;
      if (params['priority']) filter.priority = params['priority'] as IssuePriority;
      if (params['assigneeId']) filter.assigneeId = Number(params['assigneeId']);
      if (params['titleQuery']) filter.titleQuery = params['titleQuery'];

      // Sincronizza il form visivo con l'URL attuale
      this.filterForm.patchValue({
        projectId: filter.projectId || null,
        status: filter.status || null,
        type: filter.type || null
      }, { emitEvent: false }); // Evita loop infiniti

      this.loadIssues(filter);
    });
  }

  private loadFilterOptions(): void {
    // Sfruttiamo i metodi già presenti nel servizio per popolare i menu a tendina
    this.dashboardService.getUsersReference().subscribe(u => this.usersList.set(u));
    // Nota: qui potresti usare ProjectQueryService se preferisci iniettarlo, 
    // ma concettualmente riempire le dropdown fa parte di questa vista.
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

  /**
   * Innescato dall'HTML quando l'utente cambia un filtro a tendina o clicca "Cerca".
   * Questo metodo non chiama il backend, ma aggiorna l'URL. L'iscrizione sopra farà il resto!
   */
  applyFilters(): void {
    const formValues = this.filterForm.getRawValue();
    
    // Manteniamo i parametri correnti (es. se c'è assigneeId) e sovrascriviamo quelli del form
    const currentParams = { ...this.route.snapshot.queryParams };
    
    // Pulizia dei parametri nulli per avere un URL pulito
    currentParams['projectId'] = formValues.projectId || null;
    currentParams['status'] = formValues.status || null;
    currentParams['type'] = formValues.type || null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      queryParamsHandling: 'merge' // Unisce i nuovi filtri con i vecchi
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.router.navigate(['/issues']); // Torna alla lista pulita
  }

  navigateToCreate(): void {
    this.router.navigate(['/issues/new']);
  }
  navigateToDetail(id: number): void {
    this.router.navigate(['/issues', id]);
  }
  navigateToEdit(id: number): void {
    this.router.navigate(['/issues/edit', id]);
  }
}