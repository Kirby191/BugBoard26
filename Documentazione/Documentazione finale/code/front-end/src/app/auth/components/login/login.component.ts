import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // <-- AGGIUNGI L'IMPORT
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth-dtos';

@Component({
  imports: [ReactiveFormsModule],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html'
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  login() {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginForm.markAsUntouched();

    const request: LoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password! 
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Credenziali errate, riprova.');
      }
    });
  }
}