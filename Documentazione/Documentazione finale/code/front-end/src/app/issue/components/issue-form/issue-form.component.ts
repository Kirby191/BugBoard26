import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Servizi
import { IssueService } from '../../services/issue.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';

// Componente Condiviso (Modale)
import { ModalComponent } from '../../../shared/components/modal/modal.component';

// DTO e Types
import { CreateIssue, UpdateIssue } from '../../models/issue-dtos';
import { IssueType, IssuePriority, IssueStatus } from '../../../shared/models/enums';
import { ProjectState } from '../../../shared/models/shared-dtos';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent], // <-- Aggiunto ModalComponent
  templateUrl: './issue-form.component.html',
  styleUrl: './issue-form.component.scss'
})
export class IssueFormComponent implements OnInit {

  private readonly issueService = inject(IssueService);
  private readonly dashboardService = inject(DashboardService);
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly issueTypes: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];
  protected readonly issuePriorities: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  protected readonly issueStatuses: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  protected readonly isEditMode = signal<boolean>(false);
  protected readonly issueId = signal<number | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly selectedFile = signal<File | null>(null);
  
  // STATO DEL MODALE DI AVVISO
  protected readonly isModalOpen = signal<boolean>(false);

  issueForm = new FormGroup({
    projectId: new FormControl<number | null>(null, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.maxLength(32)]),
    description: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    type: new FormControl<IssueType | null>(null, [Validators.required]),
    status: new FormControl<IssueStatus | null>(null),
    priority: new FormControl<IssuePriority | null>(null),
    dueDate: new FormControl<string | null>(null)
  });

  ngOnInit(): void {
    this.loadProjects();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.issueId.set(Number(idParam));
      this.prepareEditMode(this.issueId()!);
    } else {
      this.issueForm.controls.status.disable();
    }
  }

  private loadProjects(): void {
    this.projectQueryService.getProjects().subscribe({
      next: (projs) => this.projects.set(projs),
      error: () => this.errorMessage.set('Impossibile caricare la lista dei progetti.')
    });
  }

  private prepareEditMode(id: number): void {
    this.issueForm.controls.projectId.disable();
    this.issueForm.controls.type.disable();
    this.issueForm.controls.status.setValidators([Validators.required]);
    
    this.dashboardService.getIssueDetailed(id).subscribe({
      next: (data) => {
        this.issueForm.patchValue({
          projectId: data.projectId,
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          priority: data.priority || null,
          dueDate: data.dueDate || null
        });
      },
      error: () => this.errorMessage.set('Impossibile caricare i dati della segnalazione.')
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      this.errorMessage.set('Compila correttamente i campi obbligatori rispettando le lunghezze massime.');
      return;
    }
    this.isSubmitting.set(true);
    if (this.isEditMode()) {
      this.handleUpdate();
    } else {
      this.handleCreate();
    }
  }

  private handleCreate(): void {
    const formValues = this.issueForm.getRawValue();
    const request: CreateIssue = {
      projectId: Number(formValues.projectId),
      title: formValues.title!,
      description: formValues.description!,
      type: formValues.type as IssueType,
      priority: formValues.priority as IssuePriority || undefined,
      // La data di scadenza (opzionale) in creazione
    };
    if (formValues.dueDate) {
        (request as any).dueDate = formValues.dueDate; // Aggiunta per retrocompatibilità
    }

    const file = this.selectedFile() || undefined;
    this.issueService.createIssue(request, file).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/issues']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Errore durante la creazione.');
      }
    });
  }

  private handleUpdate(): void {
    const formValues = this.issueForm.getRawValue();
    const id = this.issueId()!;
    const request: UpdateIssue = {
      title: formValues.title!,
      description: formValues.description!,
      status: formValues.status as IssueStatus,
      priority: formValues.priority as IssuePriority || undefined
    };

    this.issueService.updateIssue(id, request).subscribe({
      next: () => {
        if (formValues.dueDate) {
           this.issueService.setDueDate(id, formValues.dueDate).subscribe({
             next: () => this.forceNavigateBack(),
             error: () => this.errorMessage.set('Errore durante l\'aggiornamento della data di scadenza.')
           });
        } else {
           this.forceNavigateBack();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Errore durante l\'aggiornamento.');
      }
    });
  }

  /**
   * Intercetta il tasto "Annulla". Se il form ha modifiche non salvate (dirty),
   * mostra l'avviso. Altrimenti esce subito.
   */
  navigateBack(): void {
    if (this.issueForm.dirty) {
      this.isModalOpen.set(true);
    } else {
      this.forceNavigateBack();
    }
  }

  forceNavigateBack(): void {
    this.location.back();
  }
}