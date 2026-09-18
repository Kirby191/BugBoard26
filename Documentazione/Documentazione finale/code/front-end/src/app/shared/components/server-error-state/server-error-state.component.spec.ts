import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ServerErrorStateComponent } from './server-error-state.component';
import { AuthService } from '../../../auth/services/auth.service';

describe('ServerErrorStateComponent', () => {
  let component: ServerErrorStateComponent;
  let fixture: ComponentFixture<ServerErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerErrorStateComponent],
      providers: [
        { provide: AuthService, useValue: { userRole: signal<string | null>(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServerErrorStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose an accessible retry action without reloading the page', () => {
    fixture.componentRef.setInput('errorCode', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('non è raggiungibile');

    vi.spyOn(component.retry, 'emit');
    fixture.nativeElement.querySelector('button').click();

    expect(component.retry.emit).toHaveBeenCalled();
  });

  it('should show technical details when the reactive role becomes ADMIN', () => {
    const authService = TestBed.inject(AuthService) as { userRole: ReturnType<typeof signal<string | null>> };
    authService.userRole.set('ADMIN');
    fixture.componentRef.setInput('errorCode', 503);
    fixture.componentRef.setInput('errorType', 'SERVICE_UNAVAILABLE');
    fixture.componentRef.setInput('errorDetails', 'Backend offline');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.admin-error-trace')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Backend offline');
  });
});
