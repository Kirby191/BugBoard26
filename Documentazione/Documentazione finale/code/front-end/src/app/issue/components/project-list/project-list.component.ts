import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ProjectService } from '../../services/project.service';
import { ProjectState } from '../../../shared/models/shared-dtos';
import { ModalComponent } from '../../../shared/components/modal/modal.component'; // <-- Aggiunto

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ModalComponent], // <-- Aggiunto ModalComponent
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly projectCommandService = inject(ProjectService);
  private readonly router = inject(Router);

  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  // --- STATO DEL MODALE ---
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly projectToDelete = signal<number | null>(null);

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.isLoading.set(true);
    this.projectQueryService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare i progetti.');
        this.isLoading.set(false);
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/projects/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/projects/edit', id]);
  }

  // ==========================================
  // GESTIONE ELIMINAZIONE CON MODALE
  // ==========================================

  openDeleteModal(id: number): void {
    this.projectToDelete.set(id);
    this.isModalOpen.set(true);
  }

  cancelDelete(): void {
    this.isModalOpen.set(false);
    this.projectToDelete.set(null);
  }

  confirmDelete(): void {
    const id = this.projectToDelete();
    if (id !== null) {
      this.isModalOpen.set(false);
      this.projectCommandService.deleteProject(id).subscribe({
        next: () => {
          this.projectToDelete.set(null);
          this.loadProjects(); // Ricarica la lista
        },
        error: (err) => {
          this.projectToDelete.set(null);
          this.errorMessage.set(err.error?.message || 'Errore durante l\'eliminazione.');
        }
      });
    }
  }
}