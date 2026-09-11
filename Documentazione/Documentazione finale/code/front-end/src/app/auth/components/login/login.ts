import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth-dtos';

@Component({
  imports: [ReactiveFormsModule],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html'
})
export class Login {
  private readonly authService = inject(AuthService);
  protected readonly errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  login() {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.errorMessage.set('Per favore, inserisci un\'email valida e una password di almeno 6 caratteri.');
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        console.log('Login avvenuto con successo', response);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Credenziali errate, riprova.');
      }
    });
  }
}