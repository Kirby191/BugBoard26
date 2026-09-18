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
import java.time.ZoneId;
import java.util.List;

/** Implementa la cronologia usando riferimenti JPA agli autori degli eventi. */
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
        // L'ordinamento discendente permette alla UI di mostrare subito l'evento più recente.
        return auditRepository.findByBugIdOrderByTimestampDesc(bugId).stream()
                .map(auditRecord -> new BugHistory(
                        auditRecord.getId(),
                        auditRecord.getBugId(),
                        auditRecord.getTimestamp(),
                        auditRecord.getAction(),
                        auditRecord.getAuthor().getEmail(),
                        auditRecord.getDetails()
                ))
                .toList();
    }

    @Override
    @Transactional
    public void recordEvent(Long bugId, Long authorId, AuditAction action, String details) {
        // Serve solo la relazione verso l'autore: non è necessario caricare l'utente.
        UserReference authorRef = entityManager.getReference(UserReference.class, authorId);

        AuditRecord auditRecord = AuditRecord.builder()
                .bugId(bugId)
                .author(authorRef)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now(ZoneId.systemDefault()))
                .build();

        auditRepository.save(auditRecord);
    }
}