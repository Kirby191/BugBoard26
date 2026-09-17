// ----------------------------------------------------------
// APP / ISSUE / COMPONENTS / ISSUE FORM / ISSUE FORM
// ----------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { IssueService } from '../../services/issue.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';


import { ModalComponent } from '../../../shared/components/modal/modal.component';


import { CreateIssue, UpdateIssue } from '../../models/issue-dtos';
import { IssueType, IssuePriority, IssueStatus } from '../../../shared/models/enums';
import { ProjectState } from '../../../shared/models/shared-dtos';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent], 
  templateUrl: './issue-form.component.html',
  styleUrl: './issue-form.component.scss'
})
export class IssueFormComponent implements OnInit {

  // ----------------------------------------------------------------
  // Iniezione dei servizi
  // ----------------------------------------------------------------

  private readonly issueService = inject(IssueService);
  private readonly dashboardService = inject(DashboardService);
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // ----------------------------------------------------------------
  // Opzioni e stato della form
  // ----------------------------------------------------------------
  protected readonly issueTypes: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];
  protected readonly issuePriorities: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  protected readonly issueStatuses: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  protected readonly isEditMode = signal<boolean>(false);
  protected readonly issueId = signal<number | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly projects = signal<ProjectState[]>([]);

  // ----------------------------------------------------------------
  // Allegato e drag and drop
  // ----------------------------------------------------------------
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isDragging = signal<boolean>(false); 
  
  protected readonly isFileErrorModalOpen = signal<boolean>(false);
  protected readonly fileErrorMessage = signal<string>('');

  
  // ----------------------------------------------------------------
  // Autorizzazione e modali di conferma
  // ----------------------------------------------------------------
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isAdmin = signal<boolean>(false);

  // ----------------------------------------------------------------
  // Contatore descrizione e validazione
  // ----------------------------------------------------------------
  protected readonly MAX_DESC_LENGTH = 500;
  protected readonly DESC_THRESHOLD = 450; 

  
  protected readonly isValidationModalOpen = signal<boolean>(false);
  protected readonly validationModalTitle = signal<string>('Attenzione');
  protected readonly validationModalMessage = signal<string>('');

  // ----------------------------------------------------------------
  // Input data e stato della issue
  // ----------------------------------------------------------------
  protected readonly dateDay = signal<string>('');
  protected readonly dateMonth = signal<string>('');
  protected readonly dateYear = signal<string>('');

  protected readonly isStatusDone = signal<boolean>(false);

  // ----------------------------------------------------------------
  // Preview dell'allegato
  // ----------------------------------------------------------------
  protected readonly isPreviewModalOpen = signal<boolean>(false);
  protected readonly previewImageUrl = signal<string | null>(null);

  issueForm = new FormGroup({
    projectId: new FormControl<number | null>(null, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.maxLength(32)]),
    description: new FormControl('', [Validators.required]),
    type: new FormControl<IssueType | null>(null, [Validators.required]),
    status: new FormControl<IssueStatus | null>(null),
    priority: new FormControl<IssuePriority | null>(null),
    dueDate: new FormControl<string | null>(null)
  });

  // ----------------------------------------------------------------
  // Inizializzazione: nuova issue o modifica di una esistente
  // ----------------------------------------------------------------
  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

    this.issueForm.get('status')?.valueChanges.subscribe(status => {
      this.isStatusDone.set(status === 'DONE');
      if (status === 'DONE') {
        this.issueForm.get('dueDate')?.disable();
      } else {
        this.issueForm.get('dueDate')?.enable();
      }
    });

    this.loadProjects();
    const idParam = this.route.snapshot.paramMap.get('id');
if (idParam) {
      this.isEditMode.set(true);
      this.issueId.set(Number(idParam));
      this.prepareEditMode(this.issueId()!);
    } else {
      
      this.issueForm.controls.status.disable();

      
      const preselectedProjectId = this.route.snapshot.queryParamMap.get('projectId');
      if (preselectedProjectId) {
        this.issueForm.patchValue({ projectId: Number(preselectedProjectId) });
      }
    }
  }

  
  get descriptionLength(): number {
    return this.issueForm.get('description')?.value?.length || 0;
  }

  get remainingChars(): number {
    return this.MAX_DESC_LENGTH - this.descriptionLength;
  }

  get showCharCounter(): boolean {
    return this.descriptionLength >= this.DESC_THRESHOLD;
  }

  // Il contatore è calcolato dal valore corrente, quindi non richiede un signal separato.
  // ----------------------------------------------------------------
  // Caricamento e preparazione dei dati
  // ----------------------------------------------------------------
  private loadProjects(): void {
    this.projectQueryService.getProjects().subscribe({
      next: (projs) => this.projects.set(projs),
      error: () => this.errorMessage.set('Impossibile caricare la lista dei progetti.')
    });
  }

  private prepareEditMode(id: number): void {
    // In modifica progetto e tipologia restano fissi per preservare l'identità della issue.
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

        
        if (data.status === 'DONE') {
          this.isStatusDone.set(true);
          this.issueForm.get('dueDate')?.disable();
        }

        
        if (data.dueDate) {
          this.syncToCustomDateInputs(data.dueDate);
        }
      },
      error: () => this.errorMessage.set('Impossibile caricare i dati della segnalazione.')
    });
  }

  


  // ----------------------------------------------------------------
  // Validazione e invio
  // ----------------------------------------------------------------
  private validateCustomDate(): string | null {
    // I tre input testuali vengono validati come una data reale prima di finire nel form ISO.
    const d = this.dateDay();
    const m = this.dateMonth();
    const y = this.dateYear();

    
    if (!d && !m && !y) return null;

    
    if (!d || !m || y.length !== 4) {
      return "La data è incompleta. Usa il formato 'gg / mm / aaaa' oppure selezionala comodamente dall'icona del calendario a destra.";
    }

    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);

    
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      return "La data inserita non esiste sul calendario. Verifica i valori o utilizza l'icona del calendario.";
    }

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return "La data di scadenza non può essere impostata nel passato.";
    }

    return null; 
  }
  
  


  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }

    // Accorpiamo gli errori in un solo modal per evitare una sequenza di messaggi interruttivi.
    const errors: string[] = [];
    const formValues = this.issueForm.getRawValue();

    
    if (formValues.description && formValues.description.length > 500) {
      errors.push("• La descrizione supera il limite massimo di 500 caratteri. Sintetizza il testo.");
    }

    
    if (this.isAdmin()) {
      const dateError = this.validateCustomDate();
      if (dateError) {
        errors.push("• " + dateError);
      }
    }

    
    if (errors.length > 0) {
      this.validationModalTitle.set(errors.length > 1 ? 'Multipli Errori Rilevati' : 'Attenzione');
      
      this.validationModalMessage.set("Per procedere con il salvataggio, risolvi i seguenti problemi:\n\n" + errors.join('\n\n'));
      this.isValidationModalOpen.set(true);
      return; 
    }
    
    this.isSubmitting.set(true);
    if (this.isEditMode()) {
      this.handleUpdate();
    } else {
      this.handleCreate();
    }
  }

  // ----------------------------------------------------------------
  // Creazione e aggiornamento della issue
  // ----------------------------------------------------------------

  private handleCreate(): void {
    // La creazione usa il multipart per inviare insieme dati JSON e allegato opzionale.
    const formValues = this.issueForm.getRawValue();
    const request: CreateIssue = {
      projectId: Number(formValues.projectId),
      title: formValues.title!,
      description: formValues.description!,
      type: formValues.type as IssueType,
      priority: formValues.priority as IssuePriority || undefined,
      
    };
    if (formValues.dueDate) {
        (request as any).dueDate = formValues.dueDate; 
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
    // L'aggiornamento della scadenza viene completato dopo la PUT principale.
    const formValues = this.issueForm.getRawValue();
    const id = this.issueId()!;

    const request: UpdateIssue = {
      title: formValues.title!,
      description: formValues.description!,
      status: formValues.status as IssueStatus,
      priority: formValues.priority as IssuePriority || undefined
    };

    // L'aggiornamento della scadenza è una chiamata separata rispetto al multipart della issue.
    const file = this.selectedFile() || undefined;

    
    this.issueService.updateIssue(id, request, file).subscribe({
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
        this.errorMessage.set(err.error?.message || 'Errore durante l\'aggiornamento della segnalazione.');
      }
    });
  }
  

  // ----------------------------------------------------------------
  // Data e sincronizzazione tra input testuali e form control
  // ----------------------------------------------------------------
  onCustomDateInput(type: 'day' | 'month' | 'year', event: Event): void {
    const value = (event.target as HTMLInputElement).value.replace(/\D/g, ''); 
    if (type === 'day') this.dateDay.set(value);
    if (type === 'month') this.dateMonth.set(value);
    if (type === 'year') this.dateYear.set(value);

    this.syncToFormControl();
  }

  
  onNativeDateSelect(event: Event): void {
    const value = (event.target as HTMLInputElement).value; 
    if (value) {
      this.syncToCustomDateInputs(value);
      this.issueForm.get('dueDate')?.setValue(value);
      this.issueForm.get('dueDate')?.markAsDirty();
    } else {
      
      this.dateDay.set('');
      this.dateMonth.set('');
      this.dateYear.set('');
      this.issueForm.get('dueDate')?.setValue(null);
    }
  }

  
  private syncToCustomDateInputs(isoDate: string): void {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      this.dateYear.set(parts[0]);
      this.dateMonth.set(parts[1]);
      this.dateDay.set(parts[2]);
    }
  }

  
  private syncToFormControl(): void {
    const d = this.dateDay();
    const m = this.dateMonth();
    const y = this.dateYear();

    if (d.length >= 1 && m.length >= 1 && y.length === 4) {
      
      const dayStr = d.padStart(2, '0');
      const monthStr = m.padStart(2, '0');
      const isoDate = `${y}-${monthStr}-${dayStr}`;
      this.issueForm.get('dueDate')?.setValue(isoDate);
      this.issueForm.get('dueDate')?.markAsDirty();
    } else {
      this.issueForm.get('dueDate')?.setValue(null);
    }
  }

  // ----------------------------------------------------------------
  // Gestione degli allegati
  // ----------------------------------------------------------------


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
    input.value = ''; // Reset dell'input per permettere la selezione dello stesso file in futuro
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      this.fileErrorMessage.set('Formato non supportato. Per favore carica solo file .jpg, .png o .gif.');
      this.isFileErrorModalOpen.set(true);
      return;
    }

    if (file.size > maxSize) {
      this.fileErrorMessage.set('Il file supera il limite massimo consentito di 5MB.');
      this.isFileErrorModalOpen.set(true);
      return;
    }
    
    // Se il file è valido, aggiorniamo lo stato
    this.selectedFile.set(file);
    this.isDragging.set(false);

    // Se l'utente ha sostituito l'immagine mentre il modale era già aperto
    // apriamo nuovamente il modale per mostrare l'anteprima del nuovo file.
    if (this.isPreviewModalOpen()) {
      this.openImagePreviewModal();
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  // ----------------------------------------------------------------
  // Anteprima dell'allegato
  // ----------------------------------------------------------------
  /**
   * Converte il file caricato in un URL leggibile dal browser e apre il modale
   */
  openImagePreviewModal(): void {
    const file = this.selectedFile();
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl.set(e.target?.result as string);
        this.isPreviewModalOpen.set(true);
      };
      reader.readAsDataURL(file);
    }
  }

  closeImagePreviewModal(): void {
    this.isPreviewModalOpen.set(false);
    this.previewImageUrl.set(null);
  }

  /**
   * Invocato dal bottone "Cambia immagine" del modale: 
   * Chiude il modale e riapre nativamente l'esplora risorse.
   */
    triggerFileInputFromModal(): void {
    // Attiva programmaticamente l'input file nascosto
    document.getElementById('hiddenFileInput')?.click();
  }

  // ----------------------------------------------------------------
  // Navigazione
  // ----------------------------------------------------------------

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