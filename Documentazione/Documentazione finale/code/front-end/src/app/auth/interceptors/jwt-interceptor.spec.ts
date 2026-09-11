import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { jwtInterceptor } from './jwt-interceptor';
import { AuthService } from '../services/auth.service';

describe('JwtInterceptor', () => {
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
    
    // Creiamo una richiesta mock uscente verso le API[cite: 10]
    const request = new HttpRequest('GET', '/api/issues');
    
    // Creiamo una funzione "next" fittizia per catturare l'output dell'interceptor
    const nextFn = vi.fn().mockImplementation((req: HttpRequest<any>) => {
      // Verifichiamo che la richiesta clonata abbia l'header corretto[cite: 3]
      expect(req.headers.has('Authorization')).toBe(true);
      expect(req.headers.get('Authorization')).toBe('Bearer fake-token');
      return 'obs-mock';
    });

    // Eseguiamo l'interceptor nel contesto di iniezione di Angular
    const result = TestBed.runInInjectionContext(() => jwtInterceptor(request, nextFn));
    
    expect(nextFn).toHaveBeenCalled();
    expect(result).toBe('obs-mock');
  });

  it('should NOT add Authorization header if token does not exist', () => {
    authServiceMock.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/issues');
    
    const nextFn = vi.fn().mockImplementation((req: HttpRequest<any>) => {
      // Verifichiamo che l'header non sia stato alterato[cite: 3]
      expect(req.headers.has('Authorization')).toBe(false);
      return 'obs-mock';
    });

    TestBed.runInInjectionContext(() => jwtInterceptor(request, nextFn));
    
    expect(nextFn).toHaveBeenCalled();
  });
});