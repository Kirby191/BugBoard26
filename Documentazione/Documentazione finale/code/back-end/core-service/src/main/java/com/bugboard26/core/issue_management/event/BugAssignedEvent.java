package com.bugboard26.core.issue_management.event;

import java.time.LocalDateTime;
//TODO: questa modifica cambia fondamentalmente l'UML di Issue_management, invertendo la logica di business
// che prima era erroneamente data a query_view(il consumer).
/**
 * Evento di dominio scatenato dall'assegnazione di un bug.
 * Implementa idealmente un'interfaccia BugEvent e permette di disaccoppiare
 * l'Issue Management (scrittura) da Query & View (notifiche)
 */
public record BugAssignedEvent(
        Long bugId,
        Long assigneeId,
        LocalDateTime timestamp
) implements BugEvent {}