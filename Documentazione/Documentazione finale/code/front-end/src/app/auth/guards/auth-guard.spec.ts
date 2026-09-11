import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
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
  });

  it('should return true if user is logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    
    expect(result).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('should return an UrlTree to /login if user is NOT logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});