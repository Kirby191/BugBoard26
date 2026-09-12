import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false); // Signal per il loading state

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  login() {
    this.errorMessage.set(null);

    // Se l'utente prova a inviare con campi vuoti, attiviamo i messaggi sotto gli input
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Inizia la fase di caricamento
    this.isSubmitting.set(true);
    
    // Rimuoviamo gli stati "touched" dai campi. 
    // Questo farà sparire i bordi rossi e i messaggi locali, pulendo l'interfaccia.
    this.loginForm.markAsUntouched();

    const request: LoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password! 
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        console.log('Login avvenuto con successo', response);
      },
      error: () => {
        this.isSubmitting.set(false);
        // Messaggio globale opaco, senza specificare cosa è sbagliato
        this.errorMessage.set('Credenziali errate, riprova.');
      }
    });
  }
}