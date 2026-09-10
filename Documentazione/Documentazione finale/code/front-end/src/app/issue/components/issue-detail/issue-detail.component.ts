import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueDetailed, BugHistory } from '../../../dashboard-query/models/query-dtos';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.scss'
})
export class IssueDetailComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location); // Per il tasto "Indietro"

  // Signals per gestire lo stato della UI in modo reattivo
  protected readonly issue = signal<IssueDetailed | null>(null);
  protected readonly history = signal<BugHistory[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Estrae l'ID dalla barra degli indirizzi (es. /issues/1)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadIssueDetail(Number(idParam));
    } else {
      this.errorMessage.set('ID segnalazione non valido.');
      this.isLoading.set(false);
    }
  }

  private loadIssueDetail(id: number): void {
    this.isLoading.set(true);
    
    this.dashboardService.getIssueDetailed(id).subscribe({
      next: (data) => {
        this.issue.set(data);
        
        // REQUISITO 12: Se è un BUG, scarica anche la cronologia storica
        if (data.type === 'BUG') {
          this.loadHistory(id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.errorMessage.set('Impossibile caricare i dettagli della segnalazione.');
        this.isLoading.set(false);
      }
    });
  }

  private loadHistory(bugId: number): void {
    this.dashboardService.getBugHistory(bugId).subscribe({
      next: (histData) => {
        this.history.set(histData);
        this.isLoading.set(false);
      },
      error: () => {
        console.warn('Impossibile caricare lo storico del bug');
        this.isLoading.set(false); // Non blocchiamo la UI se la history fallisce
      }
    });
  }

  // ==========================================================================
  // AZIONI DI NAVIGAZIONE
  // ==========================================================================

  goBack(): void {
    this.location.back();
  }

  goToEdit(): void {
    const currentIssue = this.issue();
    if (currentIssue) {
      this.router.navigate(['/issues/edit', currentIssue.id]);
    }
  }
}