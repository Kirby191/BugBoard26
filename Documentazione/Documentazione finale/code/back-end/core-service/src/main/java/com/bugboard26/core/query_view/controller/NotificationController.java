package com.bugboard26.core.query_view.controller;

import com.bugboard26.core.query_view.dto.NotificationDTO;
import com.bugboard26.core.query_view.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import com.bugboard26.core.shared.sse.SseConnectionManager;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * Controller REST per la gestione delle notifiche dell'utente.
 * Appartiene al Query & View Subsystem.
 */
@RestController
@RequestMapping("/api/notifications")
/* Espone le notifiche dell'utente autenticato. */
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthenticatedUserProvider userProvider;
    private final SseConnectionManager sseConnectionManager;

    // Iniezione della dipendenza verso l'astrazione del servizio
    public NotificationController(NotificationService notificationService,
                                  AuthenticatedUserProvider userProvider,
                                  SseConnectionManager sseConnectionManager) {
        this.notificationService = notificationService;
        this.userProvider = userProvider;
        this.sseConnectionManager = sseConnectionManager;
    }

    /**
     * Eroga le notifiche non lette per l'utente loggato (usato per il dropdown della UI).
     * L'utente è inferito dal contesto di sicurezza (token JWT), prevenendo attacchi IDOR.
     * Risponde a GET /api/notifications/unread
     *
     * @return Lista di DTO contenenti messaggi e ID delle notifiche
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getMyUnreadNotifications() {
        List<NotificationDTO> unreadNotifications = notificationService.getUnreadNotificationsForUser();
        return ResponseEntity.ok(unreadNotifications);
    }

    /**
     * Contrassegna una notifica specifica come letta.
     * Risponde a PUT /api/notifications/{id}/read
     *
     * @param id L'identificativo univoco della notifica da marcare come letta
     * @return 204 No Content in caso di successo
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint per l'iscrizione al flusso Server-Sent Events (SSE).
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        Long currentUserId = userProvider.getCurrentUserId();
        return sseConnectionManager.createConnection(currentUserId);
    }
}
