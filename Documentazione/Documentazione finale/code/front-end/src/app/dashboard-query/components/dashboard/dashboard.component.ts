import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Iniezione del Query Service e dei DTO
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

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStatistics();
  }

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

  // ==========================================================================
  // COMMAND ACTIONS (Navigazione dinamica e Filtraggio - Funzionalità 3)
  // ==========================================================================

  /**
   * Naviga verso la lista passando parametri di query dinamici.
   * Es: /issues?status=TODO oppure /issues?priority=CRITICAL
   */
  goToFilteredList(queryParams: any = {}): void {
    this.router.navigate(['/issues'], { queryParams });
  }

  /**
   * Azione specifica: Filtra per "Assegnate a me".
   * Legge in modo sicuro l'ID utente salvato in sessione durante il login.
   */
  goToMyIssues(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.goToFilteredList({ assigneeId: userId });
    } else {
      this.goToFilteredList(); // Fallback se la sessione non è completa
    }
  }
}
