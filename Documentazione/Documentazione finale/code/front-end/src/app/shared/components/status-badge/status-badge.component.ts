// ---------------------------------------------------------------
// APP / SHARED / COMPONENTS / STATUS BADGE / STATUS BADGE
// ---------------------------------------------------------------

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
  // Il valore resta nel formato del dominio; la categoria determina il prefisso CSS.
  value = input.required<string>();
  category = input<'type' | 'status' | 'priority'>('status'); 
  /*
   * La classe viene calcolata dai due input per mantenere il componente
   * riutilizzabile con tipo, stato e priorità senza duplicare template.
   */
  protected readonly badgeClass = computed(() => {
    const cat = this.category().toLowerCase();
    const val = this.value().toLowerCase();
    return `${cat}-${val}`;
  });
  // Il testo è solo una trasformazione di presentazione: il valore originale resta invariato.
  protected readonly displayText = computed(() => {
    return this.value().replace(/_/g, ' ');
  });
}
