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
    void createNotification(Long assigneeId, Long bugId, String message);

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

