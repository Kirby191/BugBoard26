package com.bugboard26.core.query_view.dto;

import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO completo per la visualizzazione di dettaglio di una singola segnalazione.
 * Include campi pesanti (descrizione, URL allegato) e tutti i metadati temporali.
 */
public record IssueDetailed(
        Long id,
        Long projectId,
        String projectName,
        String title,
        String description,
        IssueStatus status,
        IssueType type,
        IssuePriority priority,
        LocalDate dueDate,
        String attachmentUrl,
        String creatorEmail,
        String assigneeEmail,
        LocalDateTime createdAt
) {}
