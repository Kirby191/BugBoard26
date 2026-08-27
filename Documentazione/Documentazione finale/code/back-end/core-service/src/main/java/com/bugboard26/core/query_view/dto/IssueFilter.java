package com.bugboard26.core.query_view.dto;

import com.bugboard26.core.issue_management.model.Enums.IssuePriority;
import com.bugboard26.core.issue_management.model.Enums.IssueType;
import com.bugboard26.core.issue_management.model.Enums.IssueStatus;
import com.bugboard26.core.query_view.dto.Enums.SortBy;
import com.bugboard26.core.query_view.dto.Enums.SortDirection;

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
