import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  // Input definiti tramite Signals
  value = input.required<string>();
  category = input<'type' | 'status' | 'priority'>('status'); // Default a 'status'

  /**
   * Genera dinamicamente la classe CSS combinando categoria e valore.
   * Es: category='status', value='IN_PROGRESS' -> 'status-in_progress'
   */
  protected readonly badgeClass = computed(() => {
    const cat = this.category().toLowerCase();
    const val = this.value().toLowerCase();
    return `${cat}-${val}`;
  });

  /**
   * Formatta il testo per l'interfaccia utente, sostituendo gli underscore con spazi.
   * Es: 'IN_PROGRESS' -> 'IN PROGRESS'
   */
  protected readonly displayText = computed(() => {
    return this.value().replace(/_/g, ' ');
  });
}
