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
  
  // Opzioni di ruolo per la Funzionalità 1
  protected readonly roles: UserRole[] = ['UTENTE', 'ADMIN'];

  // Form con validatori identici al DTO UserRegistration del backend[cite: 5]
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    role: new FormControl<UserRole | null>(null, [Validators.required])
  });

  register() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.registerForm.invalid) {
      this.errorMessage.set('Compila tutti i campi correttamente rispettando i vincoli di sicurezza.');
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
        this.successMessage.set(`Utente ${response.username} creato con successo come ${response.role}!`);
        this.registerForm.reset(); // Svuota il form dopo il successo
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Errore durante la registrazione.');
        this.isSubmitting.set(false);
      }
    });
  }
}
