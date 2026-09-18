// --------------------------------------------------------------
// APP / ISSUE / COMPONENTS / PROJECT LIST / PROJECT LIST
// --------------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ProjectState } from '../../../shared/models/shared-dtos';
import { ServerErrorStateComponent } from '../../../shared/components/server-error-state/server-error-state.component';
import { getServerErrorDetails, ServerErrorDetails } from '../../../shared/components/server-error-state/server-error-details';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ServerErrorStateComponent], 
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly router = inject(Router);

  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorData = signal<ServerErrorDetails | null>(null);

  // Il ruolo controlla solo la possibilità di creare un nuovo progetto.
  protected readonly isAdmin = signal<boolean>(false);

  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');
    this.loadProjects();
  }

  private loadProjects(): void {
    // La lista è una lettura condivisa con form e dettaglio progetto.
    this.isLoading.set(true);
    this.projectQueryService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare i progetti.'));
        this.isLoading.set(false);
      }
    });
  }

  retryProjects(): void {
    this.errorData.set(null);
    this.loadProjects();
  }

  navigateToCreate(): void {
    this.router.navigate(['/projects/new']);
  }

  
  navigateToDetail(id: number): void {
    // L'id resta nell'URL per permettere al dettaglio di ricaricare i dati direttamente.
    this.router.navigate(['/projects', id]); 
  }
}