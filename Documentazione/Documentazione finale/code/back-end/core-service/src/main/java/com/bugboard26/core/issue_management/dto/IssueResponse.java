package com.bugboard26.core.issue_management.dto;

import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;

public record IssueResponse(
    Long id,
    Long projectId,
    String title,
    IssueStatus status,
    IssueType type,
    IssuePriority priority,
    Long assigneeId
) {}