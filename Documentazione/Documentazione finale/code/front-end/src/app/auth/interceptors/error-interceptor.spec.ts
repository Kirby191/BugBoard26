// -----------------------------------------------------
// APP / AUTH / INTERCEPTORS / ERROR INTERCEPTOR
// -----------------------------------------------------

import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { errorInterceptor } from './error-interceptor';
import { AuthService } from '../services/auth.service';
import { throwError } from 'rxjs';

describe('ErrorInterceptor', () => {
  /* Solo gli errori di autorizzazione chiudono la sessione; gli altri restano propagati. */
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
    
    
    const nextFn = vi.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(request, nextFn).subscribe({
        error: (err) => {
          expect(err).toBe(errorResponse);
          
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
          
          expect(authServiceMock.logout).not.toHaveBeenCalled();
        }
      });
    });
  });
});
