import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      // Forniamo un router fittizio per isolare il componente ed evitare l'errore NG0201
      providers: [provideRouter([])] 
    }).compileComponents();
  });

  it('should create the app component successfully', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the login router link with correct attributes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Triggera il ciclo di rendering del DOM HTML
    
    const compiled = fixture.nativeElement as HTMLElement;
    const loginLink = compiled.querySelector('a');
    
    // Verifichiamo che il link esista e che punti alla rotta corretta
    expect(loginLink).toBeTruthy();
    expect(loginLink?.textContent).toContain('Login');
    expect(loginLink?.getAttribute('routerLink')).toBe('/login');
  });

  it('should contain a router-outlet for SPA navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(routerOutlet).not.toBeNull();
  });
});