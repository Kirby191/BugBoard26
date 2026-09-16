import { Injectable, inject, NgZone, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, JwtResponse, UserRegistration, UserResponse } from '../models/auth-dtos'; // Importiamo i DTO[cite: 4]
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone); // Usato per non impattare le performance di Angular
  
  private readonly AUTH_URL = '/api/auth';

  // --- GESTIONE INATTIVITÀ ---
  private idleTimeoutId: any;
  private readonly IDLE_TIME_LIMIT_MS = 30 * 60 * 1000; // 30 minuti in millisecondi

  // Segnale globale ascoltato da AppComponent per aprire il modale
  readonly isSessionExpired = signal<boolean>(false);

  constructor() {
    // Se l'utente è già loggato al caricamento dell'app, avvia il monitoraggio
    if (this.isLoggedIn()) {
      this.startIdleMonitoring();
    }
  }

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.AUTH_URL}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('user_id', response.id.toString());

        this.startIdleMonitoring(); // Avvia il monitoraggio dell'inattività dopo il login
      })
    );
  }

  register(request: UserRegistration): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.AUTH_URL}/register`, request);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    
    this.stopIdleMonitoring(); // Ferma il monitoraggio dell'inattività al logout

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ==========================================================================
  // LOGICA DI MONITORAGGIO INATTIVITÀ (Idle Timeout)
  // ==========================================================================

  private startIdleMonitoring(): void {
    // Assicuriamoci che non ci siano listener duplicati
    this.stopIdleMonitoring();

    // Eseguiamo fuori dalla NgZone per evitare di scatenare continui cicli di Change Detection 
    // di Angular ad ogni minimo movimento del mouse (ottimizzazione delle performance).
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.resetIdleTimer);
      window.addEventListener('keydown', this.resetIdleTimer);
      window.addEventListener('click', this.resetIdleTimer);
      window.addEventListener('scroll', this.resetIdleTimer);
    });

    this.resetIdleTimer(); // Inizializza il timer
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
      // Quando il tempo scade, rientriamo nella NgZone per far sì che 
      // il routing (logout) venga rilevato e renderizzato correttamente da Angular.
      this.ngZone.run(() => {
        this.isSessionExpired.set(true);
      });
    }, this.IDLE_TIME_LIMIT_MS);
  }

  // Metodo richiamato dal bottone "Ho Capito" nel modale
  confirmSessionExpiration(): void {
    this.isSessionExpired.set(false);
    this.logout();
  }
}