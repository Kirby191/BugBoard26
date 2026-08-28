package com.bugboard26.core.query_view.service;

import com.bugboard26.core.issue_management.exception.UnauthorizedActionException;
import com.bugboard26.core.query_view.dto.NotificationDTO;
import com.bugboard26.core.query_view.model.Notification;
import com.bugboard26.core.query_view.repository.NotificationRepository;
import com.bugboard26.core.shared.model.UserReference;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service // FONDAMENTALE: Dice a Spring di istanziare questa classe e iniettarla nel Listener
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthenticatedUserProvider userProvider;
    private final EntityManager entityManager;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   AuthenticatedUserProvider userProvider,
                                   EntityManager entityManager) {
        this.notificationRepository = notificationRepository;
        this.userProvider = userProvider;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void createNotification(Long assigneeId, Long bugId, String message) {
        // Usa il proxy (getReference) per evitare una query SELECT inutile a DB
        UserReference recipient = entityManager.getReference(UserReference.class, assigneeId);

        Notification notification = Notification.builder()
                .recipient(recipient)
                .bugId(bugId)
                .message(message)
                .build();

        notificationRepository.save(notification);
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
}
