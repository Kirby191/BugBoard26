package com.bugboard26.core.query_view.dto;

public record DashboardStats (
        int totalIssues,
        int todoCount,
        int inProgressCount,
        int doneCount,
        short assignedToMeCount,
        int criticalCount,
        int overdueCount,
        int unassignedBugCount
) {}
