import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalType = 'info' | 'warning' | 'danger';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  // ==========================================
  // INPUTS (Comunicazione Top-Down)
  // ==========================================
  
  // Controlla la visibilità del modale
  isOpen = input<boolean>(false);
  
  // Contenuti testuali
  title = input.required<string>();
  message = input<string>('');
  
  // Testi dei bottoni personalizzabili
  confirmText = input<string>('Conferma');
  cancelText = input<string>('Annulla');
  
  // Determina lo stile visivo del bottone di conferma (es. rosso per 'danger')
  type = input<ModalType>('info');

  // ==========================================
  // OUTPUTS (Comunicazione Bottom-Up
  // ==========================================
  
  confirm = output<void>();
  cancel = output<void>();

  /**
   * Azione innescata dal click sul pulsante di conferma.
   */
  onConfirm(): void {
    this.confirm.emit();
  }

  /**
   * Azione innescata dal click sul pulsante di annullamento, sulla 'X', o sull'overlay scuro.
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Previene la chiusura del modale se si clicca all'interno del riquadro bianco.
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
