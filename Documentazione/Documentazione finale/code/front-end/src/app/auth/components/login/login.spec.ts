import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  
  let authServiceMock = {
    login: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with an empty and invalid form', () => {
    expect(component.loginForm.valid).toBe(false);
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should display an error banner and not call service if form is invalid', () => {
    component.loginForm.patchValue({ email: 'invalid-email', password: '123' });
    component.login();
    
    // 1. Aggiorniamo il DOM per riflettere i cambiamenti di stato
    fixture.detectChanges();
    
    // 2. Cerchiamo l'elemento HTML con classe .error-banner
    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    
    // 3. Verifichiamo che l'elemento esista e contenga la parola 'valida'
    expect(errorBanner).toBeTruthy();
    expect(errorBanner.textContent).toContain('valida');
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call authService and clear errors on valid submission', () => {
    authServiceMock.login.mockReturnValue(of({ token: 'fake-jwt', role: 'ADMIN' }));
    
    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'password123' });
    component.login();
    fixture.detectChanges();

    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    
    // Se non ci sono errori, il banner non deve esistere nel DOM
    expect(errorBanner).toBeNull();
    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@bugboard.com',
      password: 'password123'
    });
  });

  it('should handle backend errors and show the error banner', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({
      error: { message: 'Credenziali errate' }
    })));

    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'wrongpassword' });
    component.login();
    
    // Aggiorniamo il DOM per renderizzare la risposta di errore
    fixture.detectChanges();

    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    
    // Verifichiamo che il DOM mostri il messaggio proveniente dal backend
    expect(errorBanner).toBeTruthy();
    expect(errorBanner.textContent).toContain('Credenziali errate');
  });
});