import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent (Shared UI)', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    
    // Inizializza i signal inputs di base necessari
    fixture.componentRef.setInput('title', 'Titolo di Test');
  });

  it('should not render anything in the DOM if isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeNull();
  });

  it('should render the modal content if isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('message', 'Messaggio di avviso.');
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('.modal-title');
    const bodyElement = fixture.nativeElement.querySelector('.modal-body p');
    
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toBe('Titolo di Test');
    
    expect(bodyElement).toBeTruthy();
    expect(bodyElement.textContent).toBe('Messaggio di avviso.');
  });

  it('should emit "cancel" event when clicking the secondary button', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    // Creiamo una "Spia" (Spy) sull'Output event emitter usando Vitest[cite: 3]
    vi.spyOn(component.cancel, 'emit');

    const cancelBtn = fixture.nativeElement.querySelector('.btn-secondary');
    cancelBtn.click();

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should emit "confirm" event and apply dynamic classes based on type', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('type', 'danger');
    fixture.componentRef.setInput('confirmText', 'Elimina Definitivamente');
    fixture.detectChanges();

    vi.spyOn(component.confirm, 'emit');

    // Cerchiamo il bottone che ora dovrebbe avere la classe dinamica .btn-danger
    const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.textContent.trim()).toBe('Elimina Definitivamente');

    confirmBtn.click();
    expect(component.confirm.emit).toHaveBeenCalled();
  });
});
