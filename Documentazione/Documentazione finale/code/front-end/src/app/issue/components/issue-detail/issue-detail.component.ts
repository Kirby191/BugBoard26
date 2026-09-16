import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueService } from '../../services/issue.service'; 

import { IssueDetailed, BugHistory, UserReference } from '../../../dashboard-query/models/query-dtos';
import { IssuePriority } from '../../../shared/models/enums';
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

  // SIGNAL PER 404 (NOT FOUND) E PER STAMPA ID RICHIESTO
  protected readonly isNotFound = signal<boolean>(false);
  protected readonly requestedId = signal<number | null>(null);

  // Computed signal che esclude dalla tendina lo sviluppatore a cui il bug è già assegnato
  protected readonly availableDevelopers = computed(() => {
    const currentAssignee = this.issue()?.assigneeId;
    return this.usersList().filter(user => user.id !== currentAssignee);
  });

  // Computed signal per capire se il bug è in scadenza (overdue)
  protected readonly isOverdue = computed(() => {
    const i = this.issue();
    if (!i || !i.dueDate || i.status === 'DONE') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 7);
    
    const dueDate = new Date(i.dueDate);
    return dueDate <= targetDate;
  });

  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

    const userIdStr = localStorage.getItem('user_id');
    if (userIdStr) {
      this.currentUserId.set(Number(userIdStr));
    }
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.requestedId.set(Number(idParam));
      this.loadIssueDetail(Number(idParam));
    } else {
      this.errorMessage.set('ID segnalazione non valido.');
      this.isLoading.set(false);
    }
  }

// ==========================================================================
// CONTROLLI DI PERMESSO (RBAC) PER MODIFICARE/ELIMINARE
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
// CARICAMENTO DEI DETTAGLI DELLA SEGNALAZIONE E DELLO STORICO (BUG)
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
      error: (err) => {
        if (err.status === 404 || err.error?.message?.toLowerCase().includes('non trovat')) {
          this.isNotFound.set(true);
        } else {
          this.errorMessage.set('Impossibile caricare i dettagli della segnalazione.');
        }
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
    const selectedVal = this.selectedUserId();
    const currentIssue = this.issue();
    
    if (selectedVal !== null && currentIssue) {
      // Se il valore è -1, lo trasformiamo in null per comunicare al back-end di rimuovere l'assegnazione
      const assigneeIdToSubmit = Number(selectedVal) === -1 ? null : Number(selectedVal);

      this.issueService.assignBug(currentIssue.id, { assigneeId: assigneeIdToSubmit }).subscribe({
        next: () => {
          this.isAssignModalOpen.set(false);
          this.selectedUserId.set(null); 
          
          let successMessage = "";
          if (assigneeIdToSubmit === null) {
             successMessage = "Assegnazione rimossa con successo!";
          } else {
             const assignedUser = this.usersList().find(u => u.id === assigneeIdToSubmit);
             const userEmail = assignedUser ? assignedUser.email : "lo sviluppatore";
             successMessage = `Bug assegnato a ${userEmail} con successo!`;
          }

          this.resultModalTitle.set('Operazione Completata');
          this.resultModalMessage.set(successMessage);
          this.resultModalType.set('info');
          this.isResultModalOpen.set(true);
          this.loadIssueDetail(currentIssue.id); 
        },
        error: (err) => {
          this.isAssignModalOpen.set(false);
          this.resultModalTitle.set('Errore di Assegnazione');
          this.resultModalMessage.set(`C'è stato un problema durante l'assegnazione: ${err.error?.message || 'Errore imprevisto dal server.'}`);
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
  // INNALZAMENTO PRIORITÀ (Admin UX)
  // ==========================================================================
  raisePriority(): void {
    const currentIssue = this.issue();
    if (!currentIssue) return;

    // Definiamo la gerarchia dell'Enum
    const priorityHierarchy: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    let nextPriority: IssuePriority = 'LOW'; // Se era null/Non assegnata, parte da LOW
    
    if (currentIssue.priority) {
      const currentIndex = priorityHierarchy.indexOf(currentIssue.priority);
      // Evitiamo errori se è già CRITICAL
      if (currentIndex >= priorityHierarchy.length - 1) return; 
      nextPriority = priorityHierarchy[currentIndex + 1];
    }

    // Costruiamo il DTO di aggiornamento mantenendo i vecchi valori, ma alterando la priorità
    const updatePayload = {
      title: currentIssue.title,
      description: currentIssue.description,
      status: currentIssue.status,
      priority: nextPriority
    };

    this.issueService.updateIssue(currentIssue.id, updatePayload).subscribe({
      next: () => {
        // Feedback visivo di Successo usando i modali già pronti
        this.resultModalTitle.set('Priorità Aggiornata');
        this.resultModalMessage.set(`La priorità è stata innalzata con successo a ${nextPriority}.`);
        this.resultModalType.set('info');
        this.isResultModalOpen.set(true);
        
        // Ricarichiamo i dettagli per far aggiornare l'UI (storico incluso)
        this.loadIssueDetail(currentIssue.id);
      },
      error: (err: any) => {
        this.resultModalTitle.set('Errore di Aggiornamento');
        this.resultModalMessage.set(err.error?.message || 'Si è verificato un errore durante l\'innalzamento della priorità.');
        this.resultModalType.set('danger');
        this.isResultModalOpen.set(true);
      }
    });
  }


  // ==========================================================================
  // NAVIGAZIONE
  // ==========================================================================

  // Lasciamo il metodo goBack() per compatibilità, ma aggiungiamo navigateToList() per sicurezza
  goBack(): void {
   this.location.back();
  }

  goToEdit(): void {
   const currentIssue = this.issue();
  
   if (currentIssue) {
     this.router.navigate(['/issues/edit', currentIssue.id]);
     }
  }

  navigateToCreate(): void {
    this.router.navigate(['/issues/new']);
  }

  navigateToList(): void {
    this.router.navigate(['/issues']);
  }
}