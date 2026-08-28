package com.bugboard26.core.query_view.listener;

import com.bugboard26.core.issue_management.event.BugAssignedEvent;
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

    // Iniezione della dipendenza verso il servizio di gestione notifiche
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
    @Async // Abilita l'esecuzione asincrona per non bloccare il thread della richiesta originale
    public void handleBugAssigned(BugAssignedEvent event) {

        // 1. Estrazione dei dati direttamente dal Java Record dell'evento[cite: 2]
        Long assigneeId = event.assigneeId();
        Long bugId = event.bugId();

        // 2. Costruzione del messaggio descrittivo per l'utente
        String message = "Ti è stato assegnato il Bug #" + bugId;

        // 3. Delegazione al NotificationService locale per la persistenza della notifica[cite: 2, 4]
        notificationService.createNotification(assigneeId, message);
    }
}
