import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueService } from '../../services/issue.service'; 
import { IssueDetailed, BugHistory, UserReference } from '../../../dashboard-query/models/query-dtos';

// IMPORTIAMO I COMPONENTI CONDIVISI
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, StatusBadgeComponent], 
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.scss'
})
export class IssueDetailComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly issueService = inject(IssueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly issue = signal<IssueDetailed | null>(null);
  protected readonly history = signal<BugHistory[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  // --- STATO MODALE ASSEGNAZIONE E RBAC ---
  protected readonly isAdmin = signal<boolean>(false);
  protected readonly isAssignModalOpen = signal<boolean>(false);
  protected readonly usersList = signal<UserReference[]>([]);
  protected readonly selectedUserId = signal<number | null>(null);

  ngOnInit(): void {
    // Controllo RBAC: legge il ruolo in sessione
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

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
        if (data.type === 'BUG') {
          this.loadHistory(id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
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
        console.warn('Impossibile caricare lo storico');
        this.isLoading.set(false); 
      }
    });
  }

  // ==========================================================================
  // ASSEGNAZIONE
  // ==========================================================================
  
  openAssignModal(): void {
    this.isAssignModalOpen.set(true);
    // Scarichiamo la lista utenti solo la prima volta che apre il modale (Ottimizzazione)
    if (this.usersList().length === 0) {
      this.dashboardService.getUsersReference().subscribe({
        next: (users) => this.usersList.set(users),
        error: () => this.errorMessage.set('Impossibile scaricare la lista sviluppatori.')
      });
    }
  }

  executeAssignment(): void {
    const userId = this.selectedUserId();
    const currentIssue = this.issue();

    if (userId && currentIssue) {
      this.issueService.assignBug(currentIssue.id, { assigneeId: Number(userId) }).subscribe({
        next: () => {
          this.isAssignModalOpen.set(false);
          this.loadIssueDetail(currentIssue.id); // Ricarica la vista per mostrare il nuovo assegnatario
        },
        error: (err) => {
          this.isAssignModalOpen.set(false);
          this.errorMessage.set(err.error?.message || 'Errore durante l\'assegnazione.');
        }
      });
    }
  }

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