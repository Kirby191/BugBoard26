// ------------------------------------------------
// APP / AUTH / COMPONENTS / LOGIN / LOGIN
// ------------------------------------------------

import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth-dtos';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, ModalComponent, CommonModule],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html'
})
export class Login implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // ----------------------------------------------------------------
  // Stato della form e visibilità della password
  // ----------------------------------------------------------------
  protected readonly isPasswordVisible = signal<boolean>(false);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  // ----------------------------------------------------------------
  // Lockdown della form per tentativi errati
  // ----------------------------------------------------------------
  readonly MAX_ATTEMPTS = 7;
  readonly PENALTY_TIERS_MINUTES = [5, 30, 60, 120]; // 5m, 30m, 1h, 2h

  // Array del perdono: minuti necessari senza sbagliare per azzerare i tentativi.
  readonly FORGIVENESS_TIERS_MINUTES = [3, 10, 30, 90];

  failedAttempts = signal<number>(0);
  lockoutUntil = signal<number | null>(null);
  lockoutTier = signal<number>(0);
  lastFailedTime = signal<number | null>(null);

  remainingLockoutMinutes = signal<number>(0);

  isLockdownModalOpen = signal<boolean>(false);
  private timerInterval: any;
  private errorTimeout: any;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    this.loadLockdownState();
    this.checkForgiveness();
    this.checkLockdown();
    
    // Aggiorna visivamente i minuti rimanenti del lockdown ogni 10 secondi
    this.timerInterval = setInterval(() => {
      this.checkForgiveness();
      this.checkLockdown();
    }, 10000); 
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearTimeout(this.errorTimeout);
  }

  // ----------------------------------------------------------------
  // Lockdown della form per tentativi errati & perdono dei tentativi
  // ----------------------------------------------------------------
  private loadLockdownState() {
    const attempts = localStorage.getItem('login_failed_attempts');
    const lockout = localStorage.getItem('login_lockout_until');
    const tier = localStorage.getItem('login_lockout_tier');
    const lastFailed = localStorage.getItem('login_last_failed_time');

    if (attempts) this.failedAttempts.set(parseInt(attempts, 10));
    if (lockout) this.lockoutUntil.set(parseInt(lockout, 10));
    if (tier) this.lockoutTier.set(parseInt(tier, 10));
    if (lastFailed) this.lastFailedTime.set(parseInt(lastFailed, 10));
  }

  private saveLockdownState() {
    localStorage.setItem('login_failed_attempts', this.failedAttempts().toString());
    localStorage.setItem('login_lockout_tier', this.lockoutTier().toString());
    
    if (this.lockoutUntil()) localStorage.setItem('login_lockout_until', this.lockoutUntil()!.toString());
    else localStorage.removeItem('login_lockout_until');
    
    if (this.lastFailedTime()) localStorage.setItem('login_last_failed_time', this.lastFailedTime()!.toString());
    else localStorage.removeItem('login_last_failed_time');
  }

  private checkLockdown() {
    const lockoutTime = this.lockoutUntil();
    if (lockoutTime) {
      const now = new Date().getTime();
      if (now >= lockoutTime) {
        this.lockoutUntil.set(null);
        this.failedAttempts.set(0); 
        this.lastFailedTime.set(null);
        this.saveLockdownState();
        this.loginForm.enable();
      } else {
        const diffMs = lockoutTime - now;
        this.remainingLockoutMinutes.set(Math.ceil(diffMs / 60000));
        this.loginForm.disable(); 
      }
    } else {
      this.loginForm.enable();
    }
  }

  /**
   * Logica di "Perdono" (Forgiveness).
   * Se è passato abbastanza tempo dall'ultimo errore, azzera i tentativi.
   */
  private checkForgiveness() {
    if (!this.lastFailedTime() || this.lockoutUntil() || this.failedAttempts() === 0) return;
    
    const tier = this.lockoutTier();
    const requiredWaitMinutes = this.FORGIVENESS_TIERS_MINUTES[Math.min(tier, this.FORGIVENESS_TIERS_MINUTES.length - 1)];
    const requiredWaitMs = requiredWaitMinutes * 60000;
    
    const now = new Date().getTime();
    if (now - this.lastFailedTime()! >= requiredWaitMs) {
      // È stato "bravo" per il tempo necessario: azzeriamo i tentativi
      this.failedAttempts.set(0);
      this.lastFailedTime.set(null);
      this.saveLockdownState();
    }
  }

  // ----------------------------------------------------------------
  // Invio delle credenziali
  // ----------------------------------------------------------------
  login() {
    this.errorMessage.set(null);
    clearTimeout(this.errorTimeout);

    this.checkForgiveness(); // Ricontrolla il perdono istantaneamente prima di procedere
    this.checkLockdown();

    if (this.lockoutUntil()) {
      this.isLockdownModalOpen.set(true);
      return;
    }

    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();

    if (this.loginForm.invalid) {
      this.showError('Inserisci email e password per accedere.');
      return;
    }

    this.isSubmitting.set(true);

    const request: LoginRequest = {
      email: this.loginForm.getRawValue().email!,
      password: this.loginForm.getRawValue().password! 
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Login riuscito: Pulizia totale dello stato di Lockdown
        this.failedAttempts.set(0);
        this.lockoutTier.set(0);
        this.lockoutUntil.set(null);
        this.lastFailedTime.set(null);
        this.saveLockdownState();
        
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.handleFailedAttempt();
      }
    });
  }


  // ----------------------------------------------------------------
  // Gestione degli errori e della visibilità della password
  // ----------------------------------------------------------------
  private handleFailedAttempt() {
    const attempts = this.failedAttempts() + 1;
    this.failedAttempts.set(attempts);
    this.lastFailedTime.set(new Date().getTime()); // Aggiorna l'ora dell'ultimo errore

    if (attempts >= this.MAX_ATTEMPTS) {
      // Innesca il Lockdown
      const tier = this.lockoutTier();
      const penaltyMinutes = this.PENALTY_TIERS_MINUTES[Math.min(tier, this.PENALTY_TIERS_MINUTES.length - 1)];
      
      const lockoutTime = new Date().getTime() + penaltyMinutes * 60000;
      this.lockoutUntil.set(lockoutTime);
      this.lockoutTier.set(tier + 1);
      
      this.saveLockdownState();
      this.checkLockdown();
      this.isLockdownModalOpen.set(true);
    } else {
      this.saveLockdownState();
      this.showError('Credenziali errate. Riprova.');
    }
  }

  private showError(msg: string) {
    this.errorMessage.set(msg);
    // Nasconde il Toast dopo 4 secondi
    this.errorTimeout = setTimeout(() => {
      this.errorMessage.set(null);
    }, 4000);
  }
  // Stato esclusivamente visuale: il valore della password resta nella form.
  togglePasswordVisibility(): void {
      this.isPasswordVisible.update(v => !v);
    }
}