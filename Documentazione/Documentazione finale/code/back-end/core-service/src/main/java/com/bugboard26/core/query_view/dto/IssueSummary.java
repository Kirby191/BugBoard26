package com.bugboard26.core.query_view.dto;

import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;

import java.time.LocalDate;

/**
 * DTO leggero per la visualizzazione tabellare delle segnalazioni (Elenco/Dashboard).
 * Omette volutamente la descrizione e i metadati pesanti per ottimizzare
 * il memory footprint e la latenza di rete durante la paginazione (CQRS Query).
 */
public record IssueSummary(
        Long id,
        String title,
        IssueStatus status,
        IssueType type,
        IssuePriority priority,
        LocalDate dueDate,
        // Dati aggregati pronti per la UI (evitano chiamate addizionali da Angular)
        String projectName,
        String assigneeEmail
) {}