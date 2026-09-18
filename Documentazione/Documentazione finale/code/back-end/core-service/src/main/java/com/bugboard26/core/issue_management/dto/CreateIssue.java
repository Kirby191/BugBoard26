package com.bugboard26.core.issue_management.dto;

import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.issue_management.model.enums.IssuePriority;

/** Dati necessari per aprire una nuova segnalazione. */
public record CreateIssue(
        Long projectId,
        String title,
        String description,
        IssueType type,
        IssuePriority priority
) {}
