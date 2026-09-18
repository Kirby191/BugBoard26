package com.bugboard26.core.issue_management.event;

import java.time.LocalDateTime;

/**
 * Evento di dominio scatenato dalla rimozione di un'assegnazione.
 */
/** Evento emesso quando l'assegnatario di un bug viene rimosso. */
public record BugUnassignedEvent(
        Long bugId,
        Long previousAssigneeId,
        LocalDateTime timestamp
) implements BugEvent {}
