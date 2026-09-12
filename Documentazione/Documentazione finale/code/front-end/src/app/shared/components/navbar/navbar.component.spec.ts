import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter } from '@angular/router'; // <-- Risolve l'errore NG0201

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      // Forniamo un router fittizio per isolare il componente[cite: 3]
      providers: [provideRouter([])] 
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component successfully', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('DOM Rendering based on isLoggedIn Input', () => {
    it('should display ONLY the Login link when isLoggedIn is false', () => {
      // Impostiamo l'input signal a false PRIMA di innescare il rendering[cite: 3]
      fixture.componentRef.setInput('isLoggedIn', false);
      fixture.detectChanges(); 

      const links = fixture.nativeElement.querySelectorAll('.nav-link');
      expect(links.length).toBe(1);
      expect(links[0].textContent.trim()).toBe('Login');

      // Verifichiamo che il pulsante di logout NON esista
      const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
      expect(logoutBtn).toBeNull();
    });

    it('should display Projects, Issues and Logout button when isLoggedIn is true', () => {
      // Impostiamo l'input signal a true per testare l'altro ramo del blocco @if[cite: 3]
      fixture.componentRef.setInput('isLoggedIn', true);
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('.nav-link');
      expect(links.length).toBe(2); 
      expect(links[0].textContent.trim()).toBe('Progetti');
      expect(links[1].textContent.trim()).toBe('Segnalazioni');

      // Verifichiamo la comparsa del pulsante di logout
      const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
      expect(logoutBtn).toBeTruthy();
      expect(logoutBtn.textContent.trim()).toBe('Logout');
    });
  });

  describe('Output Events', () => {
    it('should emit logoutAction event when logout button is clicked', () => {
      fixture.componentRef.setInput('isLoggedIn', true);
      fixture.detectChanges();

      // Creiamo una "Spia" (Spy) sull'Output event emitter usando Vitest[cite: 3]
      vi.spyOn(component.logoutAction, 'emit');

      // Simuliamo il click fisico dell'utente sul pulsante
      const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
      logoutBtn.click();

      // Verifichiamo che il componente abbia emesso il segnale verso l'esterno
      expect(component.logoutAction.emit).toHaveBeenCalled();
    });
  });
});
