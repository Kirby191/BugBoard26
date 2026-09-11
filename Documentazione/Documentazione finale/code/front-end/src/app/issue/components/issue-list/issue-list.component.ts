import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Aggiunto ActivatedRoute

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueSummary, IssueFilter } from '../../../dashboard-query/models/query-dtos'; // DTO 2]
import { IssueStatus, IssueType, IssuePriority } from '../../../shared/models/enums'; // Enums 2]

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent implements OnInit {
  
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute); // Inietta il gestore della rotta attiva

  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Ci iscriviamo ai cambiamenti dei parametri nell'URL (es. ?status=TODO)
    this.route.queryParams.subscribe(params => {
      
      // Costruiamo il DTO IssueFilter leggendo i valori dall'URL
      const filter: IssueFilter = {};
      
      if (params['projectId']) filter.projectId = Number(params['projectId']);
      if (params['status']) filter.status = params['status'] as IssueStatus;
      if (params['type']) filter.type = params['type'] as IssueType;
      if (params['priority']) filter.priority = params['priority'] as IssuePriority;
      if (params['assigneeId']) filter.assigneeId = Number(params['assigneeId']);
      if (params['titleQuery']) filter.titleQuery = params['titleQuery'];

      // Ricarichiamo le issue passando i filtri estratti
      this.loadIssues(filter);
    });
  }

  /**
   * Carica la lista delle issue interrogando il Query Layer
   */
  private loadIssues(filter: IssueFilter): void {
    this.isLoading.set(true);
    this.errorMessage.set(null); // Resetta errori precedenti
    
    this.dashboardService.searchIssues(filter).subscribe({
      next: (data) => {
        this.issues.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il recupero delle issue', err);
        this.errorMessage.set('Impossibile caricare le segnalazioni. Riprova più tardi.');
        this.isLoading.set(false);
      }
    });
  }

  // ... (i metodi navigateToCreate, navigateToDetail, navigateToEdit rimangono invariati)
  
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