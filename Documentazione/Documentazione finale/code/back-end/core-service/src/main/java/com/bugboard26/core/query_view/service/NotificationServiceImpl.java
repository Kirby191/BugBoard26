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

/** Coordina la persistenza e la consultazione delle notifiche. */
@Service
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
        internalCreateAndPushNotification(assigneeId, bugId, message);
    }

    @Override
    @Transactional
    public void handleUnassignment(Long previousAssigneeId, Long bugId) {
        // Sostituisce la notifica di assegnazione non letta con quella di revoca.
        notificationRepository.deleteUnreadByRecipientAndBugId(previousAssigneeId, bugId);

        String message = "L'assegnazione del Bug #" + bugId + " è stata annullata dall'Amministratore.";

        internalCreateAndPushNotification(previousAssigneeId, bugId, message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsForUser() {
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

        // L'ID arriva dal token, quindi una notifica non può essere modificata da un altro utente.
        if (!notification.getRecipient().getId().equals(currentUserId)) {
            throw new UnauthorizedActionException("Accesso negato: non puoi modificare le notifiche di un altro utente.");
        }

        notification.markAsRead();
        notificationRepository.save(notification);
    }

    private void internalCreateAndPushNotification(Long assigneeId, Long bugId, String message) {
        // Il riferimento JPA evita di caricare l'utente: serve solo la relazione.
        UserReference recipient = entityManager.getReference(UserReference.class, assigneeId);

        Notification notification = Notification.builder()
                .recipient(recipient)
                .bugId(bugId)
                .message(message)
                .build();

        notificationRepository.save(notification);

        // La persistenza precede il push, così il client riceve una notifica già disponibile.
        sseConnectionManager.pushToUser(assigneeId, new NotificationDTO(
                notification.getId(),
                notification.getMessage(),
                notification.getTimestamp(),
                notification.isRead()
        ));
    }
}
