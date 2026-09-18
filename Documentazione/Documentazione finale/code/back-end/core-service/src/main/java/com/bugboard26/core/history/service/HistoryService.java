package com.bugboard26.core.history.service;

import com.bugboard26.core.history.model.AuditAction;
import com.bugboard26.core.history.dto.BugHistory;

import java.util.List;

/**
 * Interfaccia esposta del sottosistema History.
 * Definisce i contratti per la consultazione e il tracciamento dei log.
 */
public interface HistoryService {

    List<BugHistory> getHistoryForBug(Long bugId);

    void recordEvent(Long bugId, Long authorId, AuditAction action, String details);

}
