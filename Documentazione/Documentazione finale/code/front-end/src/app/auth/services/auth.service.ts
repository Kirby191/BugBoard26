// ------------------------------------------------
// APP / AUTH / SERVICES / AUTH
// ------------------------------------------------

import { Injectable, inject, NgZone, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, JwtResponse, UserRegistration, UserResponse } from '../models/auth-dtos'; 
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone); 
  
  private readonly AUTH_URL = '/api/auth';

  
  private idleTimeoutId: any;
  private readonly IDLE_TIME_LIMIT_MS = 30 * 60 * 1000; 

  // Il modal viene aperto prima del logout, così l'utente capisce perché la sessione è terminata.
  readonly isSessionExpired = signal<boolean>(false);
  readonly userRole = signal<string | null>(localStorage.getItem('user_role'));

  constructor() {
    
    if (this.isLoggedIn()) {
      this.startIdleMonitoring();
    }
  }

  // ----------------------------------------------------------------
  // Sessione e autenticazione
  // ----------------------------------------------------------------
  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.AUTH_URL}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('user_role', response.role);
        this.userRole.set(response.role);
        localStorage.setItem('user_id', response.id.toString());

        this.startIdleMonitoring(); 
      })
    );
  }

  register(request: UserRegistration): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.AUTH_URL}/register`, request);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    this.userRole.set(null);
    localStorage.removeItem('user_id');
    
    this.stopIdleMonitoring(); 

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ----------------------------------------------------------------
  // Monitoraggio dell'inattività
  // ----------------------------------------------------------------
  private startIdleMonitoring(): void {
    // Il metodo può essere richiamato dopo un nuovo login: prima eliminiamo eventuali listener precedenti.
    this.stopIdleMonitoring();

    // Gli eventi ad alta frequenza restano fuori da Angular; rientriamo nella zone solo alla scadenza.
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetIdleTimer);
      window.addEventListener('keydown', this.resetIdleTimer);
      window.addEventListener('click', this.resetIdleTimer);
      window.addEventListener('scroll', this.resetIdleTimer);
    });

    this.resetIdleTimer(); 
  }

  private stopIdleMonitoring(): void {
    clearTimeout(this.idleTimeoutId);
    window.removeEventListener('mousemove', this.resetIdleTimer);
    window.removeEventListener('keydown', this.resetIdleTimer);
    window.removeEventListener('click', this.resetIdleTimer);
    window.removeEventListener('scroll', this.resetIdleTimer);
  }

  
// L'uso della arrow function preserva il contesto di 'this'
  private resetIdleTimer = (): void => {
    clearTimeout(this.idleTimeoutId);
    
    this.idleTimeoutId = setTimeout(() => {
      // Quando il tempo scade, rientriamo nella NgZone per aggiornare l'UI
      this.ngZone.run(() => {
        // 1. WARNING: Distruggiamo immediatamente la sessione a livello fisico
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        this.userRole.set(null);
        localStorage.removeItem('user_id');
        // 2. Fermiamo il timer per evitare loop
        this.stopIdleMonitoring();

        // 3. Mostriamo il modale. (L'utente è già tecnicamente disconnesso)
        this.isSessionExpired.set(true);
      });
    }, this.IDLE_TIME_LIMIT_MS);
  }

  // Metodo richiamato dal bottone "Ho Capito" nel modale
  confirmSessionExpiration(): void {
    this.isSessionExpired.set(false);
    // Il localStorage è già stato pulito dal timeout. Ci limitiamo a reindirizzare.
    this.router.navigate(['/login']);
  }
}