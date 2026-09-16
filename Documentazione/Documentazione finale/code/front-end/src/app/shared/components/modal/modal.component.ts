import { Component, input, output, model } from '@angular/core'; // <-- Aggiunto 'model'
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
  
  isOpen = model<boolean>(false);
  
  title = input.required<string>();
  message = input<string>('');

  confirmText = input<string>('Ho capito'); 
  cancelText = input<string>(''); 
  
  type = input<ModalType>('info');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.isOpen.set(false); // Il modale si chiude autonomamente
    this.confirm.emit();    // Avvisa il padre SOLO se al padre interessa
  }

  onCancel(): void {
    this.isOpen.set(false); // Il modale si chiude autonomamente
    this.cancel.emit();     // Avvisa il padre SOLO se al padre interessa
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}