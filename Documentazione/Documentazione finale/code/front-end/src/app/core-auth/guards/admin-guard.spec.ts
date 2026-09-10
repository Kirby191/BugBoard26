import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = { isLoggedIn: vi.fn() };
    routerMock = { createUrlTree: vi.fn().mockReturnValue({} as UrlTree) };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    // Intercettiamo le chiamate al localStorage per poterle simulare nei test
    vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if user is logged in AND has ADMIN role', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    vi.mocked(localStorage.getItem).mockReturnValue('ADMIN');

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    
    expect(result).toBe(true);
  });

  it('should return UrlTree to /login if user is logged in but is UTENTE', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    vi.mocked(localStorage.getItem).mockReturnValue('UTENTE');

    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should return UrlTree to /login if user is not logged in at all', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);
    vi.mocked(localStorage.getItem).mockReturnValue('ADMIN'); // Anche se l'HTML storage è manipolato

    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
