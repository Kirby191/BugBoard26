package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.NotificationDTO;

import java.util.List;

/**
 * Interfaccia di servizio per la gestione delle notifiche nel Query & View Subsystem.
 */
public interface NotificationService {

    /**
     * Crea una nuova notifica. Invocato localmente dal NotificationEventListener.
     *
     * @param assigneeId L'ID dell'utente a cui è stato assegnato il bug.
     * @param bugId      L'ID del bug assegnato.
     * @param message    Il messaggio della notifica.
     */
    // TODO: per mantenere la consistenza con il DB (Notification entity),
    //  c'è bisogno di passare anche il bugId. Far notare la differenza con l'UML,
    //  dove non era stato previsto questo parametro.
    void createNotification(Long assigneeId, Long bugId, String message);

    // TODO: Non accetta l'userId come parametro per ragioni di sicurezza (prevenzione IDOR).
    //  ricordarsi di specificare ciò nella documentazione_finale poichè differisce dall'UML,
    //   dove non era stata pensata questa limitazione. L'utente loggato sarà determinato internamente dal contesto di sicurezza.
    /**
     * Recupera le notifiche non lette per l'utente attualmente loggato.
     *
     *
     * @return Lista di DTO rappresentanti le notifiche.
     */
    List<NotificationDTO> getUnreadNotificationsForUser();

    /**
     * Contrassegna una specifica notifica come letta.
     * Il servizio verificherà internamente che l'utente loggato sia il reale proprietario.
     *
     * @param notificationId L'ID della notifica da aggiornare.
     */
    void markAsRead(Long notificationId);
}

