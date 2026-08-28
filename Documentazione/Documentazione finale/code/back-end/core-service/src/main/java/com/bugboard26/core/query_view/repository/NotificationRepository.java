package com.bugboard26.core.query_view.repository;

import com.bugboard26.core.query_view.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA per la gestione delle Notifiche nel Query & View Subsystem.
 * A differenza delle altre repository di questo layer, estende JpaRepository
 * per consentire la creazione locale e l'aggiornamento dello stato delle notifiche.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Recupera tutte le notifiche non lette per un dato utente, ordinate dalla più recente.
     * Serve ad alimentare il dropdown delle notifiche (campanellina) nel front-end Angular.
     *
     * @param recipientId L'ID dell'utente destinatario della notifica.
     * @return Lista di notifiche non lette ordinate per timestamp discendente.
     */
    List<Notification> findByRecipientIdAndIsReadFalseOrderByTimestampDesc(Long recipientId);

}
