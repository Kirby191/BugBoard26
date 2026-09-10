import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

// Importiamo il servizio di LETTURA dal modulo Dashboard_Query
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueSummary, IssueFilter } from '../../../dashboard-query/models/query-dtos';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent implements OnInit {
  
  // Iniettiamo il Query Service per leggere i dati e il Router per navigare
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadIssues();
  }

  /**
   * Carica la lista delle issue in sola lettura interrogando il Query Layer.
   */
  private loadIssues(): void {
    this.isLoading.set(true);
    
    // Per ora passiamo un filtro vuoto (recupera tutte le issue)
    const emptyFilter: IssueFilter = {};

    this.dashboardService.searchIssues(emptyFilter).subscribe({
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

  // ==========================================================================
  // COMMAND ACTIONS (Navigazione verso le viste di Mutazione/Dettaglio)
  // ==========================================================================

  navigateToCreate(): void {
    // Naviga verso l'IssueFormComponent per creare una nuova issue
    this.router.navigate(['/issues/new']);
  }

  navigateToDetail(id: number): void {
    // Naviga verso l'IssueDetailComponent
    this.router.navigate(['/issues', id]);
  }

  navigateToEdit(id: number): void {
    // Naviga verso l'IssueFormComponent in modalità modifica
    this.router.navigate(['/issues/edit', id]);
  }
}