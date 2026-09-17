// ---------------------------------------------------
// APP / AUTH / INTERCEPTORS / JWT INTERCEPTOR
// ---------------------------------------------------

import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { jwtInterceptor } from './jwt-interceptor';
import { AuthService } from '../services/auth.service';

describe('JwtInterceptor', () => {
  /* Il contratto testato è minimale: aggiungere Bearer solo quando esiste un token. */
  let authServiceMock: any;

  beforeEach(() => {
    authServiceMock = { getToken: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
  });

  it('should add Authorization header if token exists', () => {
    authServiceMock.getToken.mockReturnValue('fake-token');
    
    
    const request = new HttpRequest('GET', 'http://localhost:8080/api/issues');
    
    
    const nextFn = vi.fn().mockImplementation((req: HttpRequest<any>) => {
      
      expect(req.headers.has('Authorization')).toBe(true);
      expect(req.headers.get('Authorization')).toBe('Bearer fake-token');
      return 'obs-mock';
    });

    
    const result = TestBed.runInInjectionContext(() => jwtInterceptor(request, nextFn));
    
    expect(nextFn).toHaveBeenCalled();
    expect(result).toBe('obs-mock');
  });

  it('should NOT add Authorization header if token does not exist', () => {
    authServiceMock.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', 'http://localhost:8080/api/issues');
    
    const nextFn = vi.fn().mockImplementation((req: HttpRequest<any>) => {
      
      expect(req.headers.has('Authorization')).toBe(false);
      return 'obs-mock';
    });

    TestBed.runInInjectionContext(() => jwtInterceptor(request, nextFn));
    
    expect(nextFn).toHaveBeenCalled();
  });
});