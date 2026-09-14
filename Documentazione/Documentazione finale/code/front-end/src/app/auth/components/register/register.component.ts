import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRegistration } from '../../models/auth-dtos';
import { UserRole } from '../../../shared/models/enums';
// Aggiunta importazione del Modale
import { ModalComponent, ModalType } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isPasswordFocused = signal<boolean>(false);
  protected readonly roles: UserRole[] = ['UTENTE', 'ADMIN'];

  // --- STATO DEL MODALE DI FEEDBACK ---
  protected readonly isResultModalOpen = signal<boolean>(false);
  protected readonly resultModalTitle = signal<string>('');
  protected readonly resultModalMessage = signal<string>('');
  protected readonly resultModalType = signal<ModalType>('info');

  registerForm = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ]),
    password: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    ]),
    username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    role: new FormControl<UserRole | null>(null, [Validators.required])
  });

  // ... (Getters per la checklist dinamica rimangono invariati) ...
  get pwdValue(): string { return this.registerForm.get('password')?.value || ''; }
  get hasMinLength(): boolean { return this.pwdValue.length >= 8; }
  get hasUpper(): boolean { return /[A-Z]/.test(this.pwdValue); }
  get hasNumber(): boolean { return /[0-9]/.test(this.pwdValue); }
  get hasSpecial(): boolean { return /[\W_]/.test(this.pwdValue); }

  register() {
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      this.errorMessage.set('Compila correttamente tutti i campi richiesti.');
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const request: UserRegistration = {
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      username: this.registerForm.value.username!,
      role: this.registerForm.value.role!
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        // Feedback Positivo tramite Modale
        this.resultModalTitle.set('Operazione Completata');
        this.resultModalMessage.set(`✅ L'utente ${response.username} è stato creato con successo nel sistema.`);
        this.resultModalType.set('info');
        this.isResultModalOpen.set(true);
        
        this.registerForm.reset();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        // Feedback Negativo tramite Modale
        this.resultModalTitle.set('Errore di Creazione');
        this.resultModalMessage.set(`❌ C'è stato un problema: ${err.error?.message || 'Errore imprevisto dal server.'}`);
        this.resultModalType.set('danger');
        this.isResultModalOpen.set(true);
        
        this.isSubmitting.set(false);
      }
    });
  }
}
