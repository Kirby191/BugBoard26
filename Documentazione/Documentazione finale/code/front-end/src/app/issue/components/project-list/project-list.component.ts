import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Servizi
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ProjectService } from '../../services/project.service';
import { ProjectState } from '../../../shared/models/shared-dtos';

// Modale Condiviso
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

  // --- STATO DEL RUOLO (RBAC) ---
  protected readonly isAdmin = signal<boolean>(false);

  // --- STATO DEL MODALE DI ELIMINAZIONE ---
  protected readonly isModalOpen = signal<boolean>(false);
  protected readonly projectToDelete = signal<number | null>(null);

  ngOnInit(): void {
    // 1. Legge il ruolo dell'utente loggato
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

    // 2. Carica i progetti
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
          this.loadProjects(); 
        },
        error: (err) => {
          this.projectToDelete.set(null);
          this.errorMessage.set(err.error?.message || 'Errore durante l\'eliminazione.');
        }
      });
    }
  }
}