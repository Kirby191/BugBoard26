// ------------------------------------------------------------------
// APP / DASHBOARD QUERY / COMPONENTS / DASHBOARD / DASHBOARD
// ------------------------------------------------------------------

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/query-dtos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
        this.errorMessage.set('Impossibile caricare le metriche. Il server potrebbe essere irraggiungibile.');
        this.isLoading.set(false);
      }
    });
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
