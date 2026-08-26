package com.bugboard26.core.issue_management.dto;

import com.bugboard26.core.issue_management.model.Enums.IssueStatus;
import com.bugboard26.core.issue_management.model.Enums.IssuePriority;

public record UpdateIssue(
        String title,
        String description,
        IssueStatus status,
        IssuePriority priority
) {}
