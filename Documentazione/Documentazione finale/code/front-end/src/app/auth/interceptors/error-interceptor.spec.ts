import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { errorInterceptor } from './error-interceptor';
import { AuthService } from '../services/auth.service';
import { throwError } from 'rxjs';

describe('ErrorInterceptor', () => {
  let authServiceMock: any;

  beforeEach(() => {
    authServiceMock = { logout: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
  });

  it('should call authService.logout() when a 401 Unauthorized occurs', () => {
    const request = new HttpRequest('GET', '/api/test');
    const errorResponse = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    
    // La funzione next simula un fallimento di rete restituendo un errore RxJS[cite: 10]
    const nextFn = vi.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(request, nextFn).subscribe({
        error: (err) => {
          expect(err).toBe(errorResponse);
          // Verifica la classe di equivalenza "401" -> logout invocato[cite: 3]
          expect(authServiceMock.logout).toHaveBeenCalled();
        }
      });
    });
  });

  it('should call authService.logout() when a 403 Forbidden occurs', () => {
    const request = new HttpRequest('GET', '/api/test');
    const errorResponse = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const nextFn = vi.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(request, nextFn).subscribe({
        error: () => {
          // Verifica la classe di equivalenza "403" -> logout invocato[cite: 3]
          expect(authServiceMock.logout).toHaveBeenCalled();
        }
      });
    });
  });

  it('should NOT call authService.logout() for other errors (e.g., 500)', () => {
    const request = new HttpRequest('GET', '/api/test');
    const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const nextFn = vi.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(request, nextFn).subscribe({
        error: () => {
          // Verifica la classe di equivalenza "500" -> logout ignorato[cite: 3]
          expect(authServiceMock.logout).not.toHaveBeenCalled();
        }
      });
    });
  });
});
