import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceMock: any;

  beforeEach(async () => {
    TestBed.resetTestingModule(); // Previene crash con Vitest[cite: 8]
    
    authServiceMock = {
      login: vi.fn().mockReturnValue(of({ token: 'fake-jwt', role: 'ADMIN' }))
    };

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with an empty and invalid form', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should display local errors and NOT call service if form is empty on submit (DOM Testing)', () => {
    component.login();
    fixture.detectChanges(); // Aggiorna il DOM[cite: 7]
    
    // Verifichiamo la presenza dei messaggi <small> locali sotto gli input[cite: 6]
    const localErrors = fixture.nativeElement.querySelectorAll('.error-text');
    expect(localErrors.length).toBe(2);
    expect(localErrors[0].textContent).toContain("Si prega di inserire l'email");
    
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should clear local errors and call authService on valid submission', () => {
    // Riempiamo il form
    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'password123' });
    
    // Invochiamo il login (che internamente farà markAsUntouched per pulire la UI)[cite: 6]
    component.login();
    fixture.detectChanges();

    // Gli errori locali devono essere spariti per simulare il loading pulito[cite: 6]
    const localErrors = fixture.nativeElement.querySelectorAll('.error-text');
    expect(localErrors.length).toBe(0);

    expect(authServiceMock.login).toHaveBeenCalled();
  });

  it('should handle backend errors and show the global error banner (DOM Testing)', () => {
    // Simuliamo un errore reale 401 Unauthorized dal back-end[cite: 7]
    authServiceMock.login.mockReturnValue(throwError(() => ({
      error: { message: 'Credenziali non trovate a sistema' }
    })));

    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'wrongpassword' });
    component.login();
    fixture.detectChanges();

    // Verifichiamo che il DOM mostri il banner globale in alto (e non messaggi locali)[cite: 6]
    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    expect(errorBanner).toBeTruthy();
    expect(errorBanner.textContent).toContain('Credenziali errate');
  });
});