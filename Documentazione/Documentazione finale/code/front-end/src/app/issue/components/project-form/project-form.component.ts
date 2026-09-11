import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { CreateProject, UpdateProject } from '../../models/project-dtos';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  private readonly projectCommandService = inject(ProjectService);
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected readonly isEditMode = signal<boolean>(false);
  protected readonly projectId = signal<number | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  projectForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    description: new FormControl('') // Opzionale
  });

  ngOnInit(): void {
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
      error: () => this.errorMessage.set('Impossibile caricare i dati del progetto.')
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValues = this.projectForm.getRawValue();

    if (this.isEditMode()) {
      const request: UpdateProject = { name: formValues.name!, description: formValues.description! };
      this.projectCommandService.updateProject(this.projectId()!, request).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Errore durante la modifica.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      const request: CreateProject = { name: formValues.name!, description: formValues.description! };
      this.projectCommandService.createProject(request).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Errore durante la creazione.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  navigateBack(): void {
    this.location.back();
  }
}
