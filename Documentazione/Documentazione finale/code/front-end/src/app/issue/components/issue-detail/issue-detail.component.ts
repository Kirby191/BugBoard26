import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueService } from '../../services/issue.service'; 

import { IssueDetailed, BugHistory, UserReference } from '../../../dashboard-query/models/query-dtos';
// IMPORTIAMO I COMPONENTI CONDIVISI (Aggiunto ModalType)
import { ModalComponent, ModalType } from '../../../shared/components/modal/modal.component';
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
  protected readonly currentUserId = signal<number | null>(null);

  // --- STATO MODALE ASSEGNAZIONE E RBAC ---
  protected readonly isAdmin = signal<boolean>(false);
  protected readonly isAssignModalOpen = signal<boolean>(false);
  protected readonly usersList = signal<UserReference[]>([]);
  protected readonly selectedUserId = signal<number | null>(null);

  // SIGNALS PER I FEEDBACK VISIVI
  protected readonly isWarningAssignModalOpen = signal<boolean>(false);
  protected readonly isResultModalOpen = signal<boolean>(false);
  protected readonly isDeleteModalOpen = signal<boolean>(false);
  protected readonly resultModalTitle = signal<string>('');
  protected readonly resultModalMessage = signal<string>('');
  protected readonly resultModalType = signal<ModalType>('info');

  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

    const userIdStr = localStorage.getItem('user_id');
    if (userIdStr) {
      this.currentUserId.set(Number(userIdStr));
    }
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadIssueDetail(Number(idParam));
    } else {
      this.errorMessage.set('ID segnalazione non valido.');
      this.isLoading.set(false);
    }
  }

// ==========================================================================
// Controlli di autorizzazione per modificare o eliminare la segnalazione
// ==========================================================================


canModify(): boolean {
    const i = this.issue();
    if (!i) return false;
    if (this.isAdmin()) return true;
    const userId = this.currentUserId();
    if (i.type === 'BUG') {
      return i.assigneeId === userId;
    }
    return i.reporterId === userId;
  }

  canDelete(): boolean {
    const i = this.issue();
    if (!i) return false;
    if (this.isAdmin()) return true;
    return i.reporterId === this.currentUserId();
  }

// ==========================================================================
// Caricamento dei dettagli della segnalazione
// ==========================================================================

  private loadIssueDetail(id: number): void {
    // Il metodo esistente rimane intatto
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
     // Il metodo esistente rimane intatto
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
  // LOGICA DI ASSEGNAZIONE (Aggiornata con i Feedback)
  // ==========================================================================

  /**
   * Scatta al click sul pulsante "Assegna/Riassegna".
   * Se il bug ha già un assegnatario, intercetta e lancia l'avviso.
   */
  openAssignModal(): void {
    const currentIssue = this.issue();
    if (currentIssue && currentIssue.assigneeId) {
      // Blocca l'apertura del modale di assegnazione e lancia il Warning
      this.isWarningAssignModalOpen.set(true);
    } else {
      // Procede normalmente se il bug è "libero"
      this.proceedToAssign();
    }
  }

  /**
   * Apre effettivamente il modale con la tendina degli utenti.
   */
  proceedToAssign(): void {
    this.isWarningAssignModalOpen.set(false); // Chiude l'avviso se era aperto
    this.isAssignModalOpen.set(true);
    
    if (this.usersList().length === 0) {
      this.dashboardService.getUsersReference().subscribe({
        next: (users) => this.usersList.set(users),
        error: () => this.errorMessage.set('Impossibile scaricare la lista sviluppatori.')
      });
    }
  }

  /**
   * Invia il comando di assegnazione al Server ed elabora il Feedback Visivo.
   */
  executeAssignment(): void {
    const userId = this.selectedUserId();
    const currentIssue = this.issue();

    if (userId && currentIssue) {
      this.issueService.assignBug(currentIssue.id, { assigneeId: Number(userId) }).subscribe({
        next: () => {
          this.isAssignModalOpen.set(false);
          this.selectedUserId.set(null); // Pulisce la selezione

          // Recupera la mail per il messaggio di successo
          const assignedUser = this.usersList().find(u => u.id === Number(userId));
          const userEmail = assignedUser ? assignedUser.email : "lo sviluppatore";

          // Prepara e mostra il feedback (V)
          this.resultModalTitle.set('Operazione Completata');
          this.resultModalMessage.set(`✅ Bug assegnato a ${userEmail} con successo!`);
          this.resultModalType.set('info');
          this.isResultModalOpen.set(true);

          this.loadIssueDetail(currentIssue.id); // Aggiorna la UI sottostante
        },
        error: (err) => {
          this.isAssignModalOpen.set(false);
          
          // Prepara e mostra il feedback (X)
          this.resultModalTitle.set('Errore di Assegnazione');
          this.resultModalMessage.set(`❌ C'è stato un problema durante l'assegnazione: ${err.error?.message || 'Errore imprevisto dal server.'}`);
          this.resultModalType.set('danger');
          this.isResultModalOpen.set(true);
        }
      });
    }
  }

  // ==========================================================================
  // ELIMINAZIONE
  // ==========================================================================

  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.isDeleteModalOpen.set(false);
  }

  confirmDelete(): void {
    const i = this.issue();
    if (i) {
      this.issueService.deleteIssue(i.id).subscribe({
        next: () => {
          this.isDeleteModalOpen.set(false);
          this.router.navigate(['/issues']);
        },
        error: (err) => {
          this.isDeleteModalOpen.set(false);
          this.errorMessage.set(err.error?.message || 'Errore durante l\'eliminazione.');
        }
      });
    }
  }

  // ==========================================================================
  // NAVIGAZIONE
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