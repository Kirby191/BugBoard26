import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  const authServiceMock = { getToken: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, provideHttpClient(), provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock }]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should load unread notifications from the relative API endpoint', () => {
    const notifications = [{ id: 1, message: 'Bug #1', timestamp: '2026-09-11', isRead: false }];
    service.getUnreadNotifications().subscribe(value => expect(value).toEqual(notifications));
    const request = httpMock.expectOne('/api/notifications/unread');
    expect(request.request.method).toBe('GET');
    request.flush(notifications);
  });

  it('should mark a notification as read with a null PUT body', () => {
    service.markAsRead(7).subscribe();
    const request = httpMock.expectOne('/api/notifications/7/read');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBeNull();
    request.flush(null);
  });

  it('should fail live notification streaming without a token', () => {
    authServiceMock.getToken.mockReturnValue(null);
    service.listenToLiveNotifications().subscribe({
      error: error => expect(error).toBe('Nessun token disponibile')
    });
  });

  it('should parse data lines from the authenticated SSE stream', async () => {
    authServiceMock.getToken.mockReturnValue('token');
    const notification = { id: 2, message: 'Bug #2', timestamp: '2026-09-11', isRead: false };
    const reader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(`data: ${JSON.stringify(notification)}\n`) })
        .mockResolvedValueOnce({ done: true, value: undefined })
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ body: { getReader: () => reader } }));
    const received: unknown[] = [];
    service.listenToLiveNotifications().subscribe(value => received.push(value));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(fetch).toHaveBeenCalledWith('/api/notifications/stream', {
      method: 'GET', headers: { Authorization: 'Bearer token' }
    });
    expect(received).toEqual([notification]);
    vi.unstubAllGlobals();
  });
});
