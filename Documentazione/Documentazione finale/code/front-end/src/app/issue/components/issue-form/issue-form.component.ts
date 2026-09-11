import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Servizi per il Command (Scrittura) e Query (Lettura)[cite: 2, 4]
import { IssueService } from '../../services/issue.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';

// DTO e Types
import { CreateIssue, UpdateIssue } from '../../models/issue-dtos';
import { IssueType, IssuePriority, IssueStatus } from '../../../shared/models/enums';
import { ProjectState } from '../../../dashboard-query/models/query-dtos';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './issue-form.component.html',
  styleUrl: './issue-form.component.scss'
})
export class IssueFormComponent implements OnInit {

  // Iniezione delle dipendenze native e dei servizi
  private readonly issueService = inject(IssueService);
  private readonly dashboardService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Enum esposte al template HTML per i menu a tendina
  protected readonly issueTypes: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];
  protected readonly issuePriorities: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  protected readonly issueStatuses: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  // State Signals per la UI
  protected readonly isEditMode = signal<boolean>(false);
  protected readonly issueId = signal<number | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly selectedFile = signal<File | null>(null);

  // Definizione del Form Reattivo con applicazione stringente dei vincoli di Dominio
  issueForm = new FormGroup({
    projectId: new FormControl<number | null>(null, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.maxLength(32)]), // Max 32 char
    description: new FormControl('', [Validators.required, Validators.maxLength(500)]), // Max 500 char
    type: new FormControl<IssueType | null>(null, [Validators.required]),
    status: new FormControl<IssueStatus | null>(null), // Usato solo in Edit Mode
    priority: new FormControl<IssuePriority | null>(null), // Opzionale
    dueDate: new FormControl<string | null>(null) // Opzionale
  });

  ngOnInit(): void {
    // 1. Carica i progetti disponibili per la select
    this.loadProjects();

    // 2. Determina se siamo in Creazione o Modifica analizzando la rotta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.issueId.set(Number(idParam));
      this.prepareEditMode(this.issueId()!);
    } else {
      // In creazione lo status non serve, è TODO di default nel back-end[cite: 10]
      this.issueForm.controls.status.disable();
    }
  }

  /**
   * Carica la lista dei progetti interrogando il Query Layer.
   */
  private loadProjects(): void {
    this.dashboardService.getProjects().subscribe({
      next: (projs) => this.projects.set(projs),
      error: () => this.errorMessage.set('Impossibile caricare la lista dei progetti.')
    });
  }

  /**
   * Prepara il form per la modifica, bloccando i campi non modificabili.
   */
  private prepareEditMode(id: number): void {
    // In edit mode disabilitiamo progetto e tipo, in quanto immodificabili[cite: 9]
    this.issueForm.controls.projectId.disable();
    this.issueForm.controls.type.disable();
    this.issueForm.controls.status.setValidators([Validators.required]); // Lo stato diviene obbligatorio
    
    // Leggiamo dal Query Layer i dati attuali della Issue
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

  /**
   * Gestisce la selezione di un file multimediale dal form HTML.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  /**
   * Esegue l'invio del form smistando verso creazione o modifica nel Command Layer.
   */
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
      priority: formValues.priority as IssuePriority || undefined
    };

    const file = this.selectedFile() || undefined;

    // Delegazione all'IssueService passando DTO e opzionalmente l'allegato
    this.issueService.createIssue(request, file).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/issues']); // Ritorna alla lista
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Errore durante la creazione della segnalazione.');
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

    // Chiama l'aggiornamento generale
    this.issueService.updateIssue(id, request).subscribe({
      next: () => {
        // Se c'è una data di scadenza, la aggiorniamo con una seconda chiamata
        if (formValues.dueDate) {
           this.issueService.setDueDate(id, formValues.dueDate).subscribe({
             next: () => this.navigateBack(),
             error: () => this.errorMessage.set('Errore durante l\'aggiornamento della data di scadenza.')
           });
        } else {
           this.navigateBack();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Errore durante l\'aggiornamento della segnalazione.');
      }
    });
  }

  navigateBack(): void {
    this.location.back();
  }
}
