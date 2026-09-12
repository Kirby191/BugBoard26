import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Servizi del Query Layer (Lettura)
import { ProjectQueryService } from '../../../dashboard-query/services/project-query.service';
import { DashboardService } from '../../../dashboard-query/services/dashboard.service';

// DTOs
import { IssueSummary } from '../../../dashboard-query/models/query-dtos';
import { ProjectState } from '../../../shared/models/shared-dtos';

import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  private readonly projectQueryService = inject(ProjectQueryService);
  private readonly dashboardService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Signals per gestire lo stato in modo reattivo
  protected readonly project = signal<ProjectState | null>(null);
  protected readonly projectIssues = signal<IssueSummary[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadData(Number(idParam));
    } else {
      this.errorMessage.set('ID progetto non valido.');
      this.isLoading.set(false);
    }
  }

  /**
   * Carica i dettagli del progetto e, in parallelo/successione, le sue issue.
   */
  private loadData(projectId: number): void {
    this.isLoading.set(true);

    // 1. Recupera i dettagli del progetto
    this.projectQueryService.getProjectById(projectId).subscribe({
      next: (projectData) => {
        this.project.set(projectData);
        
        // 2. Recupera le issue filtrate per questo progetto
        this.loadProjectIssues(projectId);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare i dettagli del progetto.');
        this.isLoading.set(false);
      }
    });
  }

  private loadProjectIssues(projectId: number): void {
    // Sfruttiamo il filtro dinamico
    this.dashboardService.searchIssues({ projectId: projectId }).subscribe({
      next: (issues) => {
        this.projectIssues.set(issues);
        this.isLoading.set(false);
      },
      error: () => {
        console.warn('Impossibile caricare le issue associate al progetto.');
        // Non blocchiamo la pagina, mostriamo il progetto anche se le issue falliscono
        this.isLoading.set(false); 
      }
    });
  }

  // --- Navigazione ---

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
}
