// --------------------------------------------------------------------------------------------
// APP / DASHBOARD QUERY / COMPONENTS / NOTIFICATION LIST / NOTIFICATION LIST.COMPONENT
// --------------------------------------------------------------------------------------------

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationListComponent } from './notification-list.component';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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
      markAsRead: vi.fn().mockReturnValue(of({})),
      listenToLiveNotifications: vi.fn().mockReturnValue(of())
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
    fixture.detectChanges(); 

    fixture.nativeElement.querySelector('.bell-icon-container').click();
    fixture.detectChanges();

    expect(notificationServiceMock.getUnreadNotifications).toHaveBeenCalled();

    
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent.trim()).toBe('2');

    
    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Bug #42');
  });

  it('should call markAsRead and remove item from DOM when clicking check button', () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.bell-icon-container').click();
    fixture.detectChanges();

    
    const mockEvent = new Event('click');
    vi.spyOn(mockEvent, 'stopPropagation');
    
    
    component.markAsReadQuick(1, mockEvent);
    fixture.detectChanges(); 

    expect(notificationServiceMock.markAsRead).toHaveBeenCalledWith(1);
    
    
    const items = fixture.nativeElement.querySelectorAll('.notification-item');
    expect(items.length).toBe(1);
    
    
    const badge = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent.trim()).toBe('1');
  });

  it('should navigate to issue details when clicking the notification body', () => {
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.bell-icon-container').click();
    fixture.detectChanges();

    
    const notifItem = fixture.nativeElement.querySelectorAll('.notification-item')[0];
    notifItem.click();
    fixture.detectChanges();
    const confirmButton = fixture.nativeElement.querySelector('.btn-info');
    confirmButton.click();

    
    expect(routerMock.navigate).toHaveBeenCalledWith(['/issues', '42']);
  });

  it('should show the server error state for an initial unread-load failure', () => {
    notificationServiceMock.getUnreadNotifications.mockReturnValue(
      throwError(() => ({ status: 503, error: { error: 'SERVICE_UNAVAILABLE', message: 'Notifications unavailable' } }))
    );
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.bell-icon-container').click();
    fixture.detectChanges();

    const errorState = fixture.nativeElement.querySelector('app-server-error-state');
    expect(errorState).toBeTruthy();
    expect((component as any).errorData().message).toBe('Notifications unavailable');
  });
});