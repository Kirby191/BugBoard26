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
  imports: [CommonModule, ReactiveFormsModule, ModalComponent], 
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

  // --- STATO DRAG & DROP E VALIDAZIONE FILE ---
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isDragging = signal<boolean>(false); // Per l'effetto hover quando il file è sopra l'area
  
  protected readonly isFileErrorModalOpen = signal<boolean>(false);
  protected readonly fileErrorMessage = signal<string>('');

  
  // STATO DEL MODALE DI AVVISO
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly isAdmin = signal<boolean>(false);

  // --- STATO DEL LIMITE CARATTERI ISSUE (RD-07: MAX 500) ---
  protected readonly MAX_DESC_LENGTH = 500;
  protected readonly DESC_THRESHOLD = 450; // 90% di 500

  // Signals per il Modale di Validazione Aggregata
  protected readonly isValidationModalOpen = signal<boolean>(false);
  protected readonly validationModalTitle = signal<string>('Attenzione');
  protected readonly validationModalMessage = signal<string>('');

  // --- SIGNALS PER CUSTOM DATE PICKER ---
  protected readonly dateDay = signal<string>('');
  protected readonly dateMonth = signal<string>('');
  protected readonly dateYear = signal<string>('');

  issueForm = new FormGroup({
    projectId: new FormControl<number | null>(null, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.maxLength(32)]),
    description: new FormControl('', [Validators.required]),
    type: new FormControl<IssueType | null>(null, [Validators.required]),
    status: new FormControl<IssueStatus | null>(null),
    priority: new FormControl<IssuePriority | null>(null),
    dueDate: new FormControl<string | null>(null)
  });

  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

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

  // --- GETTERS PER L'INTERFACCIA ---
  get descriptionLength(): number {
    return this.issueForm.get('description')?.value?.length || 0;
  }

  get remainingChars(): number {
    return this.MAX_DESC_LENGTH - this.descriptionLength;
  }

  get showCharCounter(): boolean {
    return this.descriptionLength >= this.DESC_THRESHOLD;
  }

  // --- METODI PRIVATI ---

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
      // Popoliamo i campi visivi se c'è una data dal server
        if (data.dueDate) {
          this.syncToCustomDateInputs(data.dueDate);
        }
      },
      error: () => this.errorMessage.set('Impossibile caricare i dati della segnalazione.')
    });
  }

  /**
   * Valida semanticamente la data inserita a mano.
   * Controlla completezza, validità di calendario (es. no 30 Febbraio) e che non sia nel passato.
   */
  private validateCustomDate(): string | null {
    const d = this.dateDay();
    const m = this.dateMonth();
    const y = this.dateYear();

    // Se è tutto vuoto, va bene (la scadenza è opzionale)
    if (!d && !m && !y) return null;

    // Se è compilata a metà
    if (!d || !m || y.length !== 4) {
      return "La data è incompleta. Usa il formato 'gg / mm / aaaa' oppure selezionala comodamente dall'icona del calendario a destra.";
    }

    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);

    // Verifica logica del calendario (es. 31/02/2026 diventa automaticamente Marzo per JS. Se il mese cambia, la data era finta)
    const dateObj = new Date(year, month - 1, day);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
      return "La data inserita non esiste sul calendario. Verifica i valori o utilizza l'icona del calendario.";
    }

    // Verifica invariante di dominio: non può essere nel passato
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return "La data di scadenza non può essere impostata nel passato.";
    }

    return null; // Nessun errore
  }
  
  /**
   * Gestisce l'invio del form.
   */
  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }

    const errors: string[] = [];
    const formValues = this.issueForm.getRawValue();

    // 1. Controllo Limite Descrizione (RD-07)
    if (formValues.description && formValues.description.length > 500) {
      errors.push("• La descrizione supera il limite massimo di 500 caratteri. Sintetizza il testo.");
    }

    // 2. Controllo Data (Solo per Admin)
    if (this.isAdmin()) {
      const dateError = this.validateCustomDate();
      if (dateError) {
        errors.push("• " + dateError);
      }
    }

    // 3. UX CONCORRENZA: Se ci sono uno o più errori, mostriamo UN SOLO modale aggregato
    if (errors.length > 0) {
      this.validationModalTitle.set(errors.length > 1 ? 'Multipli Errori Rilevati' : 'Attenzione');
      // Unisce l'array in una stringa formattata con ritorni a capo
      this.validationModalMessage.set("Per procedere con il salvataggio, risolvi i seguenti problemi:\n\n" + errors.join('\n\n'));
      this.isValidationModalOpen.set(true);
      return; // Blocca l'invio HTTP!
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

  /**
   * Gestisce l'aggiornamento di una issue.
   */
  private handleUpdate(): void {
    const formValues = this.issueForm.getRawValue();
    const id = this.issueId()!;

    const request: UpdateIssue = {
      title: formValues.title!,
      description: formValues.description!,
      status: formValues.status as IssueStatus,
      priority: formValues.priority as IssuePriority || undefined
    };

    // Estraiamo il file selezionato (se presente)
    const file = this.selectedFile() || undefined;

    // Passiamo anche il file alla nuova firma di updateIssue
    this.issueService.updateIssue(id, request, file).subscribe({
      next: () => {
        // Se c'è una data di scadenza, la aggiorniamo con una seconda chiamata (Funzionalità 18)
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

  // ==========================================
  // GESTIONE CUSTOM DATE PICKER
  // ==========================================

  // Chiamato dall'HTML quando l'utente digita a mano nei 3 campi
  onCustomDateInput(type: 'day' | 'month' | 'year', event: Event): void {
    const value = (event.target as HTMLInputElement).value.replace(/\D/g, ''); // Solo numeri
    if (type === 'day') this.dateDay.set(value);
    if (type === 'month') this.dateMonth.set(value);
    if (type === 'year') this.dateYear.set(value);

    this.syncToFormControl();
  }

  // Chiamato quando l'utente seleziona la data dal Calendario Nativo (icona a destra)
  onNativeDateSelect(event: Event): void {
    const value = (event.target as HTMLInputElement).value; // Arriva in formato YYYY-MM-DD
    if (value) {
      this.syncToCustomDateInputs(value);
      this.issueForm.get('dueDate')?.setValue(value);
      this.issueForm.get('dueDate')?.markAsDirty();
    } else {
      // Se l'utente clicca "Cancella" nel calendario nativo
      this.dateDay.set('');
      this.dateMonth.set('');
      this.dateYear.set('');
      this.issueForm.get('dueDate')?.setValue(null);
    }
  }

  // Converte YYYY-MM-DD nei tre signal separati
  private syncToCustomDateInputs(isoDate: string): void {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      this.dateYear.set(parts[0]);
      this.dateMonth.set(parts[1]);
      this.dateDay.set(parts[2]);
    }
  }

  // Prende i tre signal e aggiorna il form in formato YYYY-MM-DD
  private syncToFormControl(): void {
    const d = this.dateDay();
    const m = this.dateMonth();
    const y = this.dateYear();

    if (d.length >= 1 && m.length >= 1 && y.length === 4) {
      // Formatta con zero-padding (es: 5 -> 05)
      const dayStr = d.padStart(2, '0');
      const monthStr = m.padStart(2, '0');
      const isoDate = `${y}-${monthStr}-${dayStr}`;
      this.issueForm.get('dueDate')?.setValue(isoDate);
      this.issueForm.get('dueDate')?.markAsDirty();
    } else {
      this.issueForm.get('dueDate')?.setValue(null);
    }
  }

  // ==========================================
  // GESTIONE DRAG & DROP E FILE
  // ==========================================

// Chiamato quando si clicca "Browse" 
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
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

    this.selectedFile.set(file);
    this.isDragging.set(false);
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  // ==========================================
  // NAVIGAZIONE INDIETRO CON AVVISO
  // ==========================================

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