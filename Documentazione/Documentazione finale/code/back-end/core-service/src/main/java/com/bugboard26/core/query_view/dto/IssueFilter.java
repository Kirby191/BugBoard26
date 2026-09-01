package com.bugboard26.core.query_view.dto;

import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.query_view.dto.enums.SortBy;
import com.bugboard26.core.query_view.dto.enums.SortDirection;

public record IssueFilter(
        Long projectId,
        IssueStatus status,
        IssueType type,
        IssuePriority priority,
        Long assigneeId,
        String titleQuery,
        SortBy sortBy,
        SortDirection sortDirection
) {}
