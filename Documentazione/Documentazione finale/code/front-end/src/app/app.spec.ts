// ------------------------------------------------
// APP / APP
// ------------------------------------------------

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { NotificationService } from './dashboard-query/services/notification.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  
  let authServiceMock: any;
  let notificationServiceMock: any;

  beforeEach(async () => {
    
    authServiceMock = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      logout: vi.fn(),
      confirmSessionExpiration: vi.fn(),
      isSessionExpired: { set: vi.fn() }
    };

    
    notificationServiceMock = {
      getUnreadNotifications: vi.fn().mockReturnValue(of([])),
      listenToLiveNotifications: vi.fn().mockReturnValue(of()),
      markAsRead: vi.fn().mockReturnValue(of())
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app component successfully', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the navigation bar with brand and ALL correct router links when logged in', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); 
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    
    const brand = compiled.querySelector('.brand-text');
    expect(brand?.textContent).toContain('BugBoard26');

    
    const links = compiled.querySelectorAll('.nav-link');
    expect(links.length).toBe(3);
    
    
    expect(links[0].textContent).toContain('Progetti');
    expect(links[0].getAttribute('routerLink')).toBe('/projects');

    
    expect(links[1].textContent).toContain('Segnalazioni');
    expect(links[1].getAttribute('routerLink')).toBe('/issues');

    expect(links[2].textContent).toContain('Dashboard');
    expect(links[2].getAttribute('routerLink')).toBe('/dashboard');
  });

  it('should only render Login link when user is NOT logged in', () => {
    
    authServiceMock.isLoggedIn.mockReturnValue(false);
    
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.nav-link');
    
    expect(links.length).toBe(1);
    expect(links[0].textContent).toContain('Login');
    expect(links[0].getAttribute('routerLink')).toBe('/login');
  });

  it('should call authService.logout() when logout button is clicked', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
    logoutBtn.click();
    
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should contain a router-outlet for SPA navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(routerOutlet).not.toBeNull();
  });
});