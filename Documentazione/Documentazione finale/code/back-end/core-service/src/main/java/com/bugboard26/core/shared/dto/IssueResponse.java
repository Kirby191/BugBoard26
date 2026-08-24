package com.bugboard26.core.shared.dto;

import com.bugboard26.core.issue_management.model.IssuePriority;
import com.bugboard26.core.issue_management.model.IssueStatus;
import com.bugboard26.core.issue_management.model.IssueType;

public record IssueResponse(
    Long id,
    Long projectId,
    String title,
    IssueStatus status,
    IssueType type,
    IssuePriority priority,
    Long assigneeId
) {}