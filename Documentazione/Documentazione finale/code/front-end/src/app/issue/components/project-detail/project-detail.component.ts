// ------------------------------------------------------------------
// APP / ISSUE / COMPONENTS / PROJECT DETAIL / PROJECT DETAIL
// ------------------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';
import { ProjectService } from '../../services/project.service'; 

import { IssueSummary } from '../../../dashboard-query/models/query-dtos';
import { ProjectState } from '../../../shared/models/shared-dtos';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component'; 
import { ServerErrorStateComponent } from '../../../shared/components/server-error-state/server-error-state.component';
import { getServerErrorDetails, ServerErrorDetails } from '../../../shared/components/server-error-state/server-error-details';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, ModalComponent, ServerErrorStateComponent], 
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly projectCommandService = inject(ProjectService);
  private readonly dashboardService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // ----------------------------------------------------------------
  // Stato del progetto e delle issue collegate
  // ----------------------------------------------------------------
  protected readonly project = signal<ProjectState | null>(null);
  protected readonly projectIssues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorData = signal<ServerErrorDetails | null>(null);
  protected readonly projectIssuesErrorData = signal<ServerErrorDetails | null>(null);

  protected readonly isAdmin = signal<boolean>(false);
  protected readonly isDeleteModalOpen = signal<boolean>(false);

  protected readonly isNotFound = signal<boolean>(false);
  protected readonly requestedId = signal<number | null>(null);

  ngOnInit(): void {
    const role = localStorage.getItem('user_role');
    this.isAdmin.set(role === 'ADMIN');

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.requestedId.set(Number(idParam)); 
      this.loadData(Number(idParam));
    } else {
      this.errorMessage.set('ID progetto non valido.');
      this.isLoading.set(false);
    }
  }

  // ----------------------------------------------------------------
  // Caricamento coordinato del progetto e delle issue
  // ----------------------------------------------------------------


 private loadData(projectId: number): void {
    this.isLoading.set(true);
    this.projectQueryService.getProjectById(projectId).subscribe({
      next: (projectData) => {
        this.project.set(projectData);
        this.loadProjectIssues(projectId);
      },
      error: (err) => {
        
        if (err.status === 404 || err.error?.message?.toLowerCase().includes('non trovat')) {
          this.isNotFound.set(true);
        } else {
          this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare i dettagli del progetto.'));
        }
        this.isLoading.set(false);
      }
    });
  }

  private loadProjectIssues(projectId: number): void {
    this.dashboardService.searchIssues({ projectId: projectId }).subscribe({
      next: (issues) => {
        this.projectIssues.set(issues);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.projectIssuesErrorData.set(getServerErrorDetails(err, 'Impossibile caricare le segnalazioni del progetto.'));
        this.isLoading.set(false);
      }
    });
  }

  retryProject(): void {
    const projectId = this.requestedId();
    if (projectId !== null) {
      this.errorData.set(null);
      this.projectIssuesErrorData.set(null);
      this.loadData(projectId);
    }
  }

  retryProjectIssues(): void {
    const projectId = this.requestedId();
    if (projectId !== null) {
      this.projectIssuesErrorData.set(null);
      this.loadProjectIssues(projectId);
    }
  }

  
  
  

  // ----------------------------------------------------------------
  // Navigazione
  // ----------------------------------------------------------------
  goBack(): void {
    this.location.back();
  }

  goToEdit(): void {
    if (this.project()) {
      this.router.navigate(['/projects/edit', this.project()!.id]);
    }
  }

  goToIssueDetail(issueId: number): void {
    this.router.navigate(['/issues', issueId]);
  }
  

  navigateToCreateIssue(): void {
    const currentProject = this.project();
    if (currentProject) {
      
      this.router.navigate(['/issues/new'], { queryParams: { projectId: currentProject.id } });
    } else {
      this.router.navigate(['/issues/new']);
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/projects/new']);
  }

  navigateToList(): void {
    this.router.navigate(['/projects']);
  }

  
  
  
  // ----------------------------------------------------------------
  // Eliminazione del progetto
  // ----------------------------------------------------------------
  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.isDeleteModalOpen.set(false);
  }

  confirmDelete(): void {
    const p = this.project();
    if (p) {
      this.isDeleteModalOpen.set(false);
      this.projectCommandService.deleteProject(p.id).subscribe({
        next: () => this.router.navigate(['/projects']), 
        error: (err) => this.errorData.set(getServerErrorDetails(err, 'Errore durante l\'eliminazione.'))
      });
    }
  }
}
