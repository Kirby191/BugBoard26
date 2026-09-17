// -------------------------------------------------------------
// APP / SHARED / COMPONENTS / NAVBAR / NAVBAR.COMPONENT
// -------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { provideRouter, ActivatedRoute } from '@angular/router'; 

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule(); 

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        
        provideRouter([]),
        
        { provide: ActivatedRoute, useValue: { snapshot: {} } }
      ]
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
      
      fixture.componentRef.setInput('isLoggedIn', false);
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('.nav-link');
      expect(links.length).toBe(1);
      expect(links[0].textContent.trim()).toBe('Login');
      
      
      const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
      expect(logoutBtn).toBeNull();
    });

    it('should display Projects, Issues and Logout button when isLoggedIn is true', () => {
      
      fixture.componentRef.setInput('isLoggedIn', true);
      fixture.detectChanges();

      const links = fixture.nativeElement.querySelectorAll('.nav-link');
      expect(links.length).toBe(2);
      expect(links[0].textContent.trim()).toBe('Progetti');
      expect(links[1].textContent.trim()).toBe('Segnalazioni');
      
      
      const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
      expect(logoutBtn).toBeTruthy();
      expect(logoutBtn.textContent.trim()).toBe('Logout');
    });
  });

  describe('Output Events', () => {
    it('should emit logoutAction event when logout button is clicked', () => {
      fixture.componentRef.setInput('isLoggedIn', true);
      fixture.detectChanges();
      
      
      vi.spyOn(component.logoutAction, 'emit');
      
      
      const logoutBtn = fixture.nativeElement.querySelector('.btn-logout');
      logoutBtn.click();
      
      
      expect(component.logoutAction.emit).toHaveBeenCalled();
    });
  });
});
