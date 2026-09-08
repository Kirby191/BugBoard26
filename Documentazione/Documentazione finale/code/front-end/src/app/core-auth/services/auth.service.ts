import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, JwtResponse } from '../models/auth-dtos';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  // L'endpoint punta alla porta 8081
  private readonly AUTH_URL = 'http://localhost:8081/api/auth';

  /**
   * Effettua il login e salva il token nel localStorage
   */
  login(request: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.AUTH_URL}/login`, request).pipe(
      tap(response => {
        // Salvataggio sessione in localStorage
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('user_id', response.id.toString());
      })
    );
  }

  /**
   * Effettua il logout rimuovendo i dati dal localStorage
   */
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
