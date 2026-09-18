package com.bugboard26.core.query_view.listener;

import com.bugboard26.core.issue_management.event.BugAssignedEvent;
import com.bugboard26.core.issue_management.event.BugUnassignedEvent;
import com.bugboard26.core.query_view.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listener del Query & View Subsystem che intercetta gli eventi di assegnazione bug.
 * Isola la logica di notifica dal Command Layer garantendo il Low Coupling.
 */
@Component
public class NotificationEventListener {

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Metodo in ascolto dell'evento di dominio BugAssignedEvent.
     * Reagisce in modo passivo quando l'Issue Management pubblica l'evento.
     *
     * @param event L'evento immutabile contenente i dati dell'assegnazione.
     */
    @EventListener
    @Async
    public void handleBugAssigned(BugAssignedEvent event) {

        Long assigneeId = event.assigneeId();
        Long bugId = event.bugId();

        String message = "Ti è stato assegnato il Bug #" + bugId;

        notificationService.createNotification(assigneeId, bugId, message);
    }

    /**
     * Reagisce alla rimozione di un'assegnazione.
     */
    @EventListener
    @Async
    public void handleBugUnassigned(BugUnassignedEvent event) {
        notificationService.handleUnassignment(event.previousAssigneeId(), event.bugId());
    }
}
