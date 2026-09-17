package com.bugboard26.core.query_view.service;

import com.bugboard26.core.issue_management.exception.UnauthorizedActionException;
import com.bugboard26.core.query_view.dto.NotificationDTO;
import com.bugboard26.core.query_view.model.Notification;
import com.bugboard26.core.query_view.repository.NotificationRepository;
import com.bugboard26.core.shared.model.UserReference;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import com.bugboard26.core.shared.sse.SseConnectionManager;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service // FONDAMENTALE: Dice a Spring di istanziare questa classe e iniettarla nel Listener
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthenticatedUserProvider userProvider;
    private final EntityManager entityManager;
    private final SseConnectionManager sseConnectionManager;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   AuthenticatedUserProvider userProvider,
                                   EntityManager entityManager,
                                   SseConnectionManager sseConnectionManager) {
        this.notificationRepository = notificationRepository;
        this.userProvider = userProvider;
        this.entityManager = entityManager;
        this.sseConnectionManager = sseConnectionManager;
    }

    @Override
    @Transactional
    public void createNotification(Long assigneeId, Long bugId, String message) {
        // Delega la logica al metodo privato per evitare la self-invocation del Proxy Spring
        internalCreateAndPushNotification(assigneeId, bugId, message);
    }

    @Override
    @Transactional
    public void handleUnassignment(Long previousAssigneeId, Long bugId) {
        // 1. Pulisce la vecchia notifica "Ti è stato assegnato..." se non è stata ancora letta
        notificationRepository.deleteUnreadByRecipientAndBugId(previousAssigneeId, bugId);

        // 2. Genera una nuova notifica per avvisare l'utente della rimozione
        String message = "L'assegnazione del Bug #" + bugId + " è stata annullata dall'Amministratore.";

        // Delega la logica al metodo privato per evitare la self-invocation del Proxy Spring
        internalCreateAndPushNotification(previousAssigneeId, bugId, message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsForUser() {
        // Security breach prevention: Usiamo l'ID sicuro dal token JWT
        Long currentUserId = userProvider.getCurrentUserId();

        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByTimestampDesc(currentUserId)
                .stream()
                .map(n -> new NotificationDTO(
                        n.getId(),
                        n.getMessage(),
                        n.getTimestamp(),
                        n.isRead()
                ))
                .toList();
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Long currentUserId = userProvider.getCurrentUserId();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notifica non trovata con ID: " + notificationId));

        // Sicurezza: verifica che la notifica appartenga davvero all'utente loggato
        if (!notification.getRecipient().getId().equals(currentUserId)) {
            throw new UnauthorizedActionException("Accesso negato: non puoi modificare le notifiche di un altro utente.");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    // =========================================================================
    // METODI PRIVATI
    // =========================================================================

    /**
     * Metodo privato che esegue effettivamente la logica.
     * Essendo private, Spring non lo inserisce nel Proxy AOP,
     * risolvendo il problema della chiamata transazionale interna.
     */
    private void internalCreateAndPushNotification(Long assigneeId, Long bugId, String message) {
        // Usa il proxy (getReference) per evitare una query SELECT inutile a DB
        UserReference recipient = entityManager.getReference(UserReference.class, assigneeId);

        Notification notification = Notification.builder()
                .recipient(recipient)
                .bugId(bugId)
                .message(message)
                .build();

        notificationRepository.save(notification);

        // Invia la notifica in tempo reale tramite SSE se l'utente è connesso
        sseConnectionManager.pushToUser(assigneeId, new NotificationDTO(
                notification.getId(),
                notification.getMessage(),
                notification.getTimestamp(),
                notification.isRead()
        ));
    }
}
