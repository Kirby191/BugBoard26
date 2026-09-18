package com.bugboard26.core.query_view.dto;

/** Aggrega i contatori mostrati nella dashboard dell'utente corrente. */
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
