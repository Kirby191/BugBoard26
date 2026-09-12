import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRegistration } from '../../models/auth-dtos';
import { UserRole } from '../../../shared/models/enums';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly isPasswordFocused = signal<boolean>(false);
  
  protected readonly roles: UserRole[] = ['UTENTE', 'ADMIN'];

  registerForm = new FormGroup({
    // Regex per forzare il formato "testo@testo.testo"
    email: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ]),
    // Regex globale che assicura che il form sia valido solo se tutte le regole sono rispettate
    password: new FormControl('', [
      Validators.required, 
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    ]),
    username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    role: new FormControl<UserRole | null>(null, [Validators.required])
  });

  // --- GETTERS PER LA CHECKLIST DINAMICA NELL'HTML ---
  get pwdValue(): string {
    return this.registerForm.get('password')?.value || '';
  }

  get hasMinLength(): boolean { return this.pwdValue.length >= 8; }
  get hasUpper(): boolean { return /[A-Z]/.test(this.pwdValue); }
  get hasNumber(): boolean { return /[0-9]/.test(this.pwdValue); }
  get hasSpecial(): boolean { return /[\W_]/.test(this.pwdValue); }

  register() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

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
        this.successMessage.set(`Utente ${response.username} creato con successo.`);
        this.registerForm.reset();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Errore durante la creazione utenza.');
        this.isSubmitting.set(false);
      }
    });
  }
}
