import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { LoginRequest, JwtResponse } from '../models/auth-dtos';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: any;

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(), // API Moderna di Angular per testare HttpClient
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock globale del localStorage per isolare il test dall'ambiente reale
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    httpMock.verify(); // Assicura che non ci siano chiamate HTTP pendenti o impreviste
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should authenticate user, save data to localStorage and return response', () => {
    const mockRequest: LoginRequest = { email: 'admin@bugboard.com', password: '123' };
    const mockResponse: JwtResponse = { token: 'fake-jwt', type: 'Bearer', id: 1, email: 'admin@bugboard.com', username: 'Admin', role: 'ADMIN' };

    service.login(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Intercettiamo la chiamata HTTP uscente
    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse); // Simuliamo la risposta del server (back-end mockato)

    // Verifichiamo i side-effects sul localStorage stabiliti nell'operatore tap() 3]
    expect(localStorage.setItem).toHaveBeenCalledWith('jwt_token', 'fake-jwt');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_role', 'ADMIN');
    expect(localStorage.setItem).toHaveBeenCalledWith('user_id', '1');
  });

  it('should clear localStorage and navigate to /login on logout', () => {
    service.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user_role');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user_id');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true from isLoggedIn if token exists', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('existing-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false from isLoggedIn if token does not exist', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    expect(service.isLoggedIn()).toBe(false);
  });
});