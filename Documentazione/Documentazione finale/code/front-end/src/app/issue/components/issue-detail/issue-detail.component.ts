// --------------------------------------------------------------
// APP / ISSUE / COMPONENTS / ISSUE DETAIL / ISSUE DETAIL
// --------------------------------------------------------------

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { IssueService } from '../../services/issue.service'; 

import { IssueDetailed, BugHistory, UserReference } from '../../../dashboard-query/models/query-dtos';
import { IssuePriority } from '../../../shared/models/enums';

import { ModalComponent, ModalType } from '../../../shared/components/modal/modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

import { ServerErrorStateComponent } from '../../../shared/components/server-error-state/server-error-state.component';
import { getServerErrorDetails, ServerErrorDetails } from '../../../shared/components/server-error-state/server-error-details';
@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, StatusBadgeComponent, ServerErrorStateComponent], 
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.scss'
})
export class IssueDetailComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);
  private readonly issueService = inject(IssueService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // ----------------------------------------------------------------
  // Stato della pagina e stato dei modali
  // ----------------------------------------------------------------
  protected readonly issue = signal<IssueDetailed | null>(null);
  protected readonly history = signal<BugHistory[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  // ----------------------------------------------------------------
  // Stato di errore diversificato per tipo di errore (404, 500, ecc.)
  // ----------------------------------------------------------------
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorData = signal<ServerErrorDetails | null>(null);
  protected readonly historyErrorData = signal<ServerErrorDetails | null>(null);


  protected readonly currentUserId = signal<number | null>(null);

  
  protected readonly isAdmin = signal<boolean>(false);
  protected readonly isAssignModalOpen = signal<boolean>(false);
  protected readonly usersList = signal<UserReference[]>([]);
  protected readonly selectedUserId = signal<number | null>(null);

  
  protected readonly isWarningAssignModalOpen = signal<boolean>(false);
  protected readonly isResultModalOpen = signal<boolean>(false);
  protected readonly isDeleteModalOpen = signal<boolean>(false);
  protected readonly resultModalTitle = signal<string>('');
  protected readonly resultModalMessage = signal<string>('');
  protected readonly resultModalType = signal<ModalType>('info');

  
  protected readonly isNotFound = signal<boolean>(false);
  protected readonly requestedId = signal<number | null>(null);

  // ----------------------------------------------------------------
  // Valori derivati usati dal template
  // ----------------------------------------------------------------
  protected readonly availableDevelopers = computed(() => {
    const currentAssignee = this.issue()?.assigneeId;
    return this.usersList().filter(user => user.id !== currentAssignee);
  });

  
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

  // ----------------------------------------------------------------
  // Lifecycle e caricamento dati
  // ----------------------------------------------------------------
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
      this.errorMessage.set('ID della segnalazione mancante nell\'URL.');
      this.isLoading.set(false);
    }
  }





  // ----------------------------------------------------------------
  // Permessi dell'utente corrente
  // ----------------------------------------------------------------
canModify(): boolean {
    const i = this.issue();
    if (!i) return false;
    if (this.isAdmin()) return true;
    const userId = this.currentUserId();

    // I bug seguono l'assegnatario; gli altri tipi restano modificabili dal loro autore.
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




  // ----------------------------------------------------------------
  // Dettaglio e storico della segnalazione
  // ----------------------------------------------------------------
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
      error: (err) => {
        if (err.status === 404 || err.error?.message?.toLowerCase().includes('non trovat')) {
          this.isNotFound.set(true);
        } else {
            const details = getServerErrorDetails(err, 'Errore imprevisto di rete.');
            this.errorData.set(details);
        }
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
      error: (err) => {
        this.historyErrorData.set(getServerErrorDetails(err, 'Impossibile caricare lo storico della segnalazione.'));
        this.isLoading.set(false); 
      }
    });
  }

  retryIssue(): void {
    const issueId = this.requestedId();
    if (issueId !== null) {
      this.errorData.set(null);
      this.historyErrorData.set(null);
      this.loadIssueDetail(issueId);
    }
  }

  retryHistory(): void {
    const issueId = this.requestedId();
    if (issueId !== null) {
      this.historyErrorData.set(null);
      this.loadHistory(issueId);
    }
  }

  
  
  

  


  // ----------------------------------------------------------------
  // Assegnazione dei bug
  // ----------------------------------------------------------------
  openAssignModal(): void {
    const currentIssue = this.issue();
    if (currentIssue && currentIssue.assigneeId) {
      
      this.isWarningAssignModalOpen.set(true);
    } else {
      
      this.proceedToAssign();
    }
  }

  


  proceedToAssign(): void {
    this.isWarningAssignModalOpen.set(false); 
    this.isAssignModalOpen.set(true);
    
    if (this.usersList().length === 0) {
      this.dashboardService.getUsersReference().subscribe({
        next: (users) => this.usersList.set(users),
        error: () => this.errorMessage.set('Impossibile scaricare la lista sviluppatori.')
      });
    }
  }

  


executeAssignment(): void {
    const selectedVal = this.selectedUserId();
    const currentIssue = this.issue();
    
    if (selectedVal !== null && currentIssue) {
      
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

  
  
  
  // ----------------------------------------------------------------
  // Eliminazione e aggiornamento della priorità
  // ----------------------------------------------------------------
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

  
  
  
  raisePriority(): void {
    const currentIssue = this.issue();
    if (!currentIssue) return;

    
    const priorityHierarchy: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    let nextPriority: IssuePriority = 'LOW'; 
    
    if (currentIssue.priority) {
      const currentIndex = priorityHierarchy.indexOf(currentIssue.priority);
      
      if (currentIndex >= priorityHierarchy.length - 1) return; 
      nextPriority = priorityHierarchy[currentIndex + 1];
    }

    
    const updatePayload = {
      title: currentIssue.title,
      description: currentIssue.description,
      status: currentIssue.status,
      priority: nextPriority
    };

    this.issueService.updateIssue(currentIssue.id, updatePayload).subscribe({
      next: () => {
        
        this.resultModalTitle.set('Priorità Aggiornata');
        this.resultModalMessage.set(`La priorità è stata innalzata con successo a ${nextPriority}.`);
        this.resultModalType.set('info');
        this.isResultModalOpen.set(true);
        
        
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