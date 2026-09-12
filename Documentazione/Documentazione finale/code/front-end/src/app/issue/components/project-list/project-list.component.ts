import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Servizi
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ProjectService } from '../../services/project.service';
import { ProjectState } from '../../../shared/models/shared-dtos';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ModalComponent], 
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
  // GESTIONE ELIMINAZIONE
  // ==========================================

  /**
   * 1. Innescata dal click sul tasto "Elimina" nella tabella.
   * Salva l'ID e apre il modale grafico.
   */
  openDeleteModal(id: number): void {
    this.projectToDelete.set(id);
    this.isModalOpen.set(true);
  }

  /**
   * 2. Innescata dall'evento (cancel) del ModalComponent
   */
  cancelDelete(): void {
    this.isModalOpen.set(false);
    this.projectToDelete.set(null);
  }

  /**
   * 3. Innescata dall'evento (confirm) del ModalComponent.
   * Esegue la vera chiamata HTTP al Command Layer.
   */
  confirmDelete(): void {
    const id = this.projectToDelete();
    if (id !== null) {
      this.isModalOpen.set(false); // Chiudiamo sùbito il modale
      
      this.projectCommandService.deleteProject(id).subscribe({
        next: () => {
          this.projectToDelete.set(null);
          this.loadProjects(); // Ricarica la lista per riflettere l'eliminazione
        },
        error: (err) => {
          this.projectToDelete.set(null);
          this.errorMessage.set(err.error?.message || 'Errore durante l\'eliminazione.');
        }
      });
    }
  }
}