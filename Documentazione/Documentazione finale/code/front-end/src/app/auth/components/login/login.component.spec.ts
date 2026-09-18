// ---------------------------------------------------------
// APP / AUTH / COMPONENTS / LOGIN / LOGIN.COMPONENT
// ---------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceMock: any;

  beforeEach(async () => {
    TestBed.resetTestingModule(); 
    
    authServiceMock = {
      login: vi.fn().mockReturnValue(of({ token: 'fake-jwt', role: 'ADMIN' }))
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
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
    fixture.detectChanges(); 
    
    
    expect(fixture.nativeElement.querySelector('.login-toast.show')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.login-toast').textContent).toContain('Inserisci');
    
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should clear local errors and call authService on valid submission', () => {
    
    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'password123' });
    
    
    component.login();
    fixture.detectChanges();

    
    const localErrors = fixture.nativeElement.querySelectorAll('.error-text');
    expect(localErrors.length).toBe(0);

    expect(authServiceMock.login).toHaveBeenCalled();
  });

  it('should handle backend errors and show the elegant login toast (DOM Testing)', () => {
    // Il mock simula l'errore del Back-End
    authServiceMock.login.mockReturnValue(throwError(() => ({
      error: { message: 'Credenziali errate' }
    })));
    
    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'wrongpassword' });
    component.login();
    fixture.detectChanges();
    
    // Controlliamo l'apparizione del nuovo componente toast
    const errorToast = fixture.nativeElement.querySelector('.login-toast.show');
    expect(errorToast).toBeTruthy();
    expect(errorToast.textContent).toContain('Credenziali errate');
  });
});