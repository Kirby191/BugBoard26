package com.bugboard26.core.history.model;

/** Azioni registrabili nella cronologia delle issue. */
public enum AuditAction {
    CREATED,
    ASSIGNED,
    STATUS_CHANGED,
    DUE_DATE_CHANGED,
    UPDATED
}
