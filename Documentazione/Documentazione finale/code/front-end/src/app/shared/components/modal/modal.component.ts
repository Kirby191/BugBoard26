// -------------------------------------------------
// APP / SHARED / COMPONENTS / MODAL / MODAL
// -------------------------------------------------

import { Component, input, output, model } from '@angular/core'; 
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
  // ----------------------------------------------------------------
  // API del modal: stato, contenuto e azioni
  // ----------------------------------------------------------------
  isOpen = model<boolean>(false);
  
  title = input.required<string>();
  message = input<string>('');

  confirmText = input<string>('Ho capito'); 
  cancelText = input<string>(''); 
  
  type = input<ModalType>('info');

  // Se true, il modal si chiude automaticamente quando l'utente conferma l'azione.
  autoCloseOnConfirm = input<boolean>(true);

  confirm = output<void>();
  cancel = output<void>();

  /*
   * Il componente chiude subito la propria UI e delega al padre l'effetto
   * dell'azione. In questo modo il modal resta riutilizzabile in contesti diversi.
   */
  onConfirm(): void {
    if (this.autoCloseOnConfirm()) {
      this.isOpen.set(false);
    }
    this.confirm.emit();
  }

  onCancel(): void {
    // Anche l'annullamento aggiorna il model prima di notificare il componente padre.
    this.isOpen.set(false); 
    this.cancel.emit();     
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}