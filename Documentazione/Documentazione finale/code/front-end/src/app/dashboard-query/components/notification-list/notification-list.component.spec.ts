import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationDTO } from '../../models/query-dtos';

describe('NotificationListComponent', () => {
  let component: NotificationListComponent;
  let fixture: ComponentFixture<NotificationListComponent>;

  let notificationServiceMock: any;
  let routerMock: any;

  const mockNotifications: NotificationDTO[] = [
    { id: 1, message: 'Ti è stato assegnato il Bug #42', timestamp: '2026-09-11T10:00:00', isRead: false },
    { id: 2, message: 'Ti è stato assegnato il Bug #43', timestamp: '2026-09-11T11:00:00', isRead: false }
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    notificationServiceMock = {
      getUnreadNotifications: vi.fn().mockReturnValue(of(mockNotifications)),
      markAsRead: vi.fn().mockReturnValue(of({})) // Ritorna void/empty in caso di successo
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [NotificationListComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and load notifications on init (DOM Testing)', () => {
    fixture.detectChanges(); // Innesca ngOnInit

    expect(notificationServiceMock.getUnreadNotifications).toHaveBeenCalled();

    // DOM Testing: verifica che il badge conti esattamente 2 notifiche
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent.trim()).toBe('2');

    // DOM Testing: verifica il rendering delle righe
    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Bug #42');
  });

  it('should call markAsRead and remove item from DOM when clicking check button', () => {
    fixture.detectChanges();

    // Troviamo il pulsante "Segna come letta" della prima notifica
    const readBtn = fixture.nativeElement.querySelectorAll('.btn-read')[0];
    
    // Creiamo un evento fittizio per soddisfare $event.stopPropagation()
    const mockEvent = new Event('click');
    vi.spyOn(mockEvent, 'stopPropagation');
    
    // Simuliamo la chiamata alla funzione come farebbe l'HTML
    component.markAsRead(1, mockEvent);
    fixture.detectChanges(); // Aggiorna il DOM post-signal update

    expect(notificationServiceMock.markAsRead).toHaveBeenCalledWith(1);
    
    // Verifica che l'array locale sia stato filtrato (ora ne resta 1)
    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items.length).toBe(1);
    
    // Verifica che il badge si sia aggiornato a 1
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent.trim()).toBe('1');
  });

  it('should navigate to issue details when clicking the notification body', () => {
    fixture.detectChanges();

    // Simula il click sul body della prima notifica
    const notifItem = fixture.nativeElement.querySelectorAll('.notification-item')[0];
    notifItem.click();

    // Il regex interno ha estratto il "42" dalla stringa "Ti è stato assegnato il Bug #42"
    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues', '42']);
  });
});