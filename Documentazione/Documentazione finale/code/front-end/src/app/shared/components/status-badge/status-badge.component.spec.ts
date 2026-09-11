import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent (Shared UI)', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    // Inizializza l'input obbligatorio prima di chiamare detectChanges()[cite: 2]
    fixture.componentRef.setInput('value', 'TODO');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should format underscores into spaces for display text', () => {
    fixture.componentRef.setInput('value', 'IN_PROGRESS');
    fixture.componentRef.setInput('category', 'status');
    fixture.detectChanges();

    const spanElement = fixture.nativeElement.querySelector('.badge');
    expect(spanElement.textContent.trim()).toBe('IN PROGRESS');
  });

  it('should apply the correct CSS class for STATUS category', () => {
    fixture.componentRef.setInput('value', 'DONE');
    fixture.componentRef.setInput('category', 'status');
    fixture.detectChanges();

    const spanElement = fixture.nativeElement.querySelector('.badge');
    expect(spanElement.classList.contains('status-done')).toBe(true);
  });

  it('should apply the correct CSS class for TYPE category', () => {
    fixture.componentRef.setInput('value', 'BUG');
    fixture.componentRef.setInput('category', 'type');
    fixture.detectChanges();

    const spanElement = fixture.nativeElement.querySelector('.badge');
    expect(spanElement.classList.contains('type-bug')).toBe(true);
  });

  it('should apply the correct CSS class for PRIORITY category', () => {
    fixture.componentRef.setInput('value', 'CRITICAL');
    fixture.componentRef.setInput('category', 'priority');
    fixture.detectChanges();

    const spanElement = fixture.nativeElement.querySelector('.badge');
    expect(spanElement.classList.contains('priority-critical')).toBe(true);
  });
});