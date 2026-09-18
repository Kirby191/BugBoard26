// ------------------------------------------------------------------
// APP / DASHBOARD QUERY / COMPONENTS / DASHBOARD / DASHBOARD
// ------------------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/query-dtos';
import { ServerErrorStateComponent } from '../../../shared/components/server-error-state/server-error-state.component';
import { getServerErrorDetails, ServerErrorDetails } from '../../../shared/components/server-error-state/server-error-details';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ServerErrorStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  // ----------------------------------------------------------------
  // Stato delle metriche
  // ----------------------------------------------------------------
  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly errorData = signal<ServerErrorDetails | null>(null);

  ngOnInit(): void {
    this.loadStatistics();
  }

  // Il template distingue caricamento, errore e metriche disponibili attraverso questi signal.
  private loadStatistics(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore durante il caricamento della dashboard', err);
        this.errorData.set(getServerErrorDetails(err, 'Impossibile caricare le metriche.'));
        this.isLoading.set(false);
      }
    });
  }

  retryStatistics(): void {
    this.errorData.set(null);
    this.loadStatistics();
  }


  // ----------------------------------------------------------------
  // Navigazione verso la lista dei bug filtrata
  // ----------------------------------------------------------------
  goToFilteredList(queryParams: any = {}): void {
    this.router.navigate(['/issues'], { queryParams });
  }

  // ----------------------------------------------------------------
  // Navigazione verso la lista dei bug assegnati all'utente
  // ----------------------------------------------------------------
  goToMyIssues(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.goToFilteredList({ assigneeId: userId });
    } else {
      this.goToFilteredList(); 
    }
  }
}
