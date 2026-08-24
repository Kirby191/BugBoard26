package com.bugboard26.core.history.service;

import com.bugboard26.core.history.dto.BugHistory;
import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.model.AuditRecord;
import com.bugboard26.core.history.repository.AuditRepository;
import com.bugboard26.core.shared.model.UserReference;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HistoryServiceImpl implements HistoryService {

    private final AuditRepository auditRepository;
    private final EntityManager entityManager;

    public HistoryServiceImpl(AuditRepository auditRepository, EntityManager entityManager) {
        this.auditRepository = auditRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BugHistory> getHistoryForBug(Long bugId) {
        // Estrae il log in sola lettura interrogando AuditRepository[cite: 9]
        return auditRepository.findByBugIdOrderByTimestampDesc(bugId).stream()
                .map(record -> new BugHistory(
                        record.getId(),
                        record.getBugId(),
                        record.getTimestamp(),
                        record.getAction(),
                        record.getAuthor().getEmail(),
                        record.getDetails()
                ))
                .toList(); // Sintassi snella introdotta in Java 16+
    }

    @Override
    @Transactional
    public void recordEvent(Long bugId, Long authorId, AuditAction action, String details) {
        // Usa il pattern proxy per collegare l'autore senza eseguire una query SELECT su DB.
        // Questo rispecchia il metodo getReferenceById(id) mostrato nel diagramma[cite: 9].
        UserReference authorRef = entityManager.getReference(UserReference.class, authorId);

        AuditRecord record = AuditRecord.builder()
                .bugId(bugId)
                .author(authorRef)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        // Salva immutabilmente l'evento nel database tramite AuditRepository[cite: 9].
        auditRepository.save(record);
    }
}