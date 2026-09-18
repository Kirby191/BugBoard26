// --------------------------------------------------------------
// APP / ISSUE / COMPONENTS / PROJECT FORM / PROJECT FORM
// --------------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { CreateProject, UpdateProject } from '../../models/project-dtos';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ServerErrorStateComponent } from '../../../shared/components/server-error-state/server-error-state.component';
import { getServerErrorDetails, ServerErrorDetails } from '../../../shared/components/server-error-state/server-error-details';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ServerErrorStateComponent],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  private readonly projectCommandService = inject(ProjectService);
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // ----------------------------------------------------------------
  // Limiti del testo e modali
  // ----------------------------------------------------------------
  protected readonly MAX_DESC_LENGTH = 800;
  protected readonly DESC_THRESHOLD = 720; 
  protected readonly isLimitModalOpen = signal<boolean>(false);

  
  // ----------------------------------------------------------------
  // Stato della form
  // ----------------------------------------------------------------
  protected readonly isEditMode = signal<boolean>(false);
  protected readonly projectId = signal<number | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorData = signal<ServerErrorDetails | null>(null);
  private retryAction: () => void = () => this.onSubmit();
  
  
  protected readonly isModalOpen = signal<boolean>(false);

  projectForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    description: new FormControl('') 
  });

  ngOnInit(): void {
    // La presenza dell'id distingue la modifica dalla creazione di un nuovo progetto.
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.projectId.set(Number(idParam));
      this.loadProjectData(this.projectId()!);
    }
  }

  private loadProjectData(id: number): void {
    this.projectQueryService.getProjectById(id).subscribe({
      next: (data) => {
        this.projectForm.patchValue({
          name: data.name,
          description: data.description
        });
      },
      error: (err) => {
        this.retryAction = () => this.loadProjectData(id);
        this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare i dati del progetto.'));
      }
    });
  }

  retryServerRequest(): void {
    this.errorData.set(null);
    this.retryAction();
  }

  onSubmit(): void {
    // Il limite della descrizione viene gestito con un modal dedicato prima della validazione API.
    if (this.descriptionLength > this.MAX_DESC_LENGTH) {
      this.isLimitModalOpen.set(true);
      return; 
    }

    if (this.projectForm.invalid) return;
    
    this.isSubmitting.set(true);
    this.errorData.set(null);

    const formValues = this.projectForm.getRawValue();

    // Le due operazioni condividono la form, ma usano DTO e endpoint diversi.
    if (this.isEditMode()) {
      const request: UpdateProject = { name: formValues.name!, description: formValues.description! };
      this.projectCommandService.updateProject(this.projectId()!, request).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (err) => {
          this.retryAction = () => this.onSubmit();
          this.errorData.set(getServerErrorDetails(err, 'Errore durante la modifica.'));
          this.isSubmitting.set(false);
        }
      });
    } else {
      const request: CreateProject = { name: formValues.name!, description: formValues.description! };
      this.projectCommandService.createProject(request).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (err) => {
          this.retryAction = () => this.onSubmit();
          this.errorData.set(getServerErrorDetails(err, 'Errore durante la creazione.'));
          this.isSubmitting.set(false);
        }
      });
    }
  }

  // ----------------------------------------------------------------
  // Contatore descrizione e navigazione protetta
  // ----------------------------------------------------------------
  get descriptionLength(): number {
    return this.projectForm.get('description')?.value?.length || 0;
  }

  get remainingChars(): number {
    return this.MAX_DESC_LENGTH - this.descriptionLength;
  }

  get showCharCounter(): boolean {
    return this.descriptionLength >= this.DESC_THRESHOLD;
  }

  

  navigateBack(): void {
    // Le modifiche non salvate richiedono una conferma esplicita prima di tornare indietro.
    if (this.projectForm.dirty) {
      this.isModalOpen.set(true);
    } else {
      this.forceNavigateBack();
    }
  }

  forceNavigateBack(): void {
    this.location.back();
  }
}