package com.bugboard26.core.issue_management.dto;

import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.issue_management.model.enums.IssuePriority;

public record CreateIssue(
        Long projectId,
        String title,
        String description,
        IssueType type,
        IssuePriority priority
) {}
