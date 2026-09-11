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

  it('should display the correct brand name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Triggera il ciclo di rendering del DOM HTML

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('strong')?.textContent).toContain('BugBoard26');
  });

  it('should render the navigation bar with brand and ALL correct router links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Triggera il ciclo di rendering del DOM HTML
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    // 1. Verifichiamo la presenza del Brand Name
    const brand = compiled.querySelector('strong');
    expect(brand?.textContent).toContain('BugBoard26');

    // 2. Estraiamo la NodeList di TUTTI i link usando querySelectorAll
    const links = compiled.querySelectorAll('a');
    expect(links.length).toBe(3);
    
    // Verifichiamo la corretta renderizzazione della branch 1 (Login)
    expect(links[0].textContent).toContain('Login');
    expect(links[0].getAttribute('routerLink')).toBe('/login');

    // Verifichiamo la corretta renderizzazione della branch 2 (Issues)
    expect(links[1].textContent).toContain('Issues');
    expect(links[1].getAttribute('routerLink')).toBe('/issues');
    // Verifichiamo la corretta renderizzazione della branch 3 (Projects)
    expect(links[2].textContent).toContain('Projects');
    expect(links[2].getAttribute('routerLink')).toBe('/projects');
  });

  it('should contain a router-outlet for SPA navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const routerOutlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(routerOutlet).not.toBeNull();
  });
});