// ---------------------------------------------------------------
// APP / AUTH / COMPONENTS / REGISTER / REGISTER.COMPONENT
// ---------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    TestBed.resetTestingModule(); 
    
    authServiceMock = {
      register: vi.fn().mockReturnValue(of({ username: 'AdminMaster', role: 'ADMIN' }))
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should enforce strict email and password regex validation constraints', () => {
    
    component.registerForm.patchValue({ 
      email: 'emailSenzaChiocciola.com', 
      password: 'weak' 
    });
    
    expect(component.registerForm.get('email')?.valid).toBe(false);
    expect(component.registerForm.get('password')?.valid).toBe(false);

    
    component.registerForm.patchValue({ 
      email: 'admin@bugboard.com', 
      password: 'StrongPassword123!' 
    });
    
    expect(component.registerForm.get('email')?.valid).toBe(true);
    expect(component.registerForm.get('password')?.valid).toBe(true);
  });

  it('should dynamically show the password checklist when input is focused (DOM Testing)', () => {
    
    let checklist = fixture.nativeElement.querySelector('.pwd-checklist');
    expect(checklist).toBeNull();

    
    const pwdInput = fixture.nativeElement.querySelector('#password');
    pwdInput.dispatchEvent(new Event('focus'));
    fixture.detectChanges(); 

    
    checklist = fixture.nativeElement.querySelector('.pwd-checklist');
    expect(checklist).toBeTruthy();
  });

  it('should display error banner if submitted with invalid form (DOM Testing)', () => {
    
    component.register();
    fixture.detectChanges();

    
    expect(authServiceMock.register).not.toHaveBeenCalled();

    
    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('Compila correttamente tutti i campi');
  });

  it('should call authService and display success banner on valid submission (DOM Testing)', () => {
    component.registerForm.patchValue({ 
      email: 'admin@bugboard.com', 
      username: 'AdminMaster',
      password: 'PasswordSicura123!',
      role: 'ADMIN'
    });
    
    component.register();
    fixture.detectChanges();

    expect(authServiceMock.register).toHaveBeenCalled();

    
    const successAlert = fixture.nativeElement.querySelector('.alert-success');
    expect(successAlert).toBeTruthy();
    expect(successAlert.textContent).toContain('creato con successo');
    
    
    expect(component.registerForm.get('email')?.value).toBeNull();
  });

  it('should handle backend errors and display them (DOM Testing)', () => {
    
    authServiceMock.register.mockReturnValue(throwError(() => ({
      error: { message: 'L\'email admin@bugboard.com è in uso.' }
    })));

    component.registerForm.patchValue({ 
      email: 'admin@bugboard.com', 
      username: 'Admin',
      password: 'PasswordSicura123!',
      role: 'ADMIN'
    });
    
    component.register();
    fixture.detectChanges();

    const errorAlert = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.textContent).toContain('è in uso');
  });
});
