// ---------------------------------------------------------
// APP / AUTH / COMPONENTS / LOGIN / LOGIN.COMPONENT
// ---------------------------------------------------------

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
    TestBed.resetTestingModule(); 
    
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
    fixture.detectChanges(); 
    
    
    const localErrors = fixture.nativeElement.querySelectorAll('.error-text');
    expect(localErrors.length).toBe(2);
    expect(localErrors[0].textContent).toContain("Si prega di inserire l'email");
    
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

  it('should handle backend errors and show the global error banner (DOM Testing)', () => {
    
    authServiceMock.login.mockReturnValue(throwError(() => ({
      error: { message: 'Credenziali non trovate a sistema' }
    })));

    component.loginForm.patchValue({ email: 'test@bugboard.com', password: 'wrongpassword' });
    component.login();
    fixture.detectChanges();

    
    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    expect(errorBanner).toBeTruthy();
    expect(errorBanner.textContent).toContain('Credenziali errate');
  });
});