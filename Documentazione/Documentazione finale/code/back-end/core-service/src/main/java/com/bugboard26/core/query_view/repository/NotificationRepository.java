package com.bugboard26.core.query_view.repository;

import com.bugboard26.core.query_view.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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
     *
     * @param recipientId L'ID dell'utente destinatario della notifica.
     * @return Lista di notifiche non lette ordinate per timestamp discendente.
     */
    List<Notification> findByRecipientIdAndIsReadFalseOrderByTimestampDesc(Long recipientId);

    /**
     * Elimina fisicamente le notifiche non lette relative a un bug specifico per un utente.
     * Usato quando un'assegnazione viene annullata prima che l'utente l'abbia vista.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId AND n.bugId = :bugId AND n.isRead = false")
    void deleteUnreadByRecipientAndBugId(Long recipientId, Long bugId);
}
