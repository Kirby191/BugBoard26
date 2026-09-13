import { Injectable, inject } from '@angular/core';
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
  
  private readonly AUTH_URL = '/api/auth';

  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.AUTH_URL}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('user_id', response.id.toString());
      })
    );
  }

  // NUOVO METODO: Registrazione Utente (Funzionalità 1)
  register(request: UserRegistration): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.AUTH_URL}/register`, request);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}