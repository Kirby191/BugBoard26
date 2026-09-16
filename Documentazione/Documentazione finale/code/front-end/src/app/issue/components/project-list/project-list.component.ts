import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { ProjectState } from '../../../shared/models/shared-dtos';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly router = inject(Router);

  protected readonly projects = signal<ProjectState[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly isAdmin = signal<boolean>(false);

  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');
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

  // Navigazione innescata dal doppio-click sulla cartella
  navigateToDetail(id: number): void {
    this.router.navigate(['/projects', id]); // Il Router inietterà project-detail
  }
}