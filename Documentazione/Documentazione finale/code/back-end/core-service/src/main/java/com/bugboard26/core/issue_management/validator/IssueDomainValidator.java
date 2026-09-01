package com.bugboard26.core.issue_management.validator;

import com.bugboard26.core.issue_management.exception.InvalidIssueDomainException;
import com.bugboard26.core.shared.exception.ProjectNotFoundException;
import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import com.bugboard26.core.issue_management.repository.ProjectRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Componente dedicato alla convalida delle regole di business e invarianti di dominio.
 * Intercetta le incoerenze logiche prima dell'accesso in scrittura al DB[cite: 4, 5].
 */
@Component
public class IssueDomainValidator {

    private final ProjectRepository projectRepository;

    public IssueDomainValidator(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    /**
     * Verifica l'esistenza fisica del progetto associato[cite: 5].
     *
     * @param projectId L'ID del progetto da verificare.
     * @throws ProjectNotFoundException Se il progetto non esiste nel database.
     */
    public void validateProject(Long projectId) {
        if (projectId == null || !projectRepository.existsById(projectId)) {
            throw new ProjectNotFoundException("Progetto non trovato o inesistente con ID: " + projectId);
        }
    }

    /**
     * Verifica che la segnalazione sia assegnabile a uno sviluppatore.
     * Regola: Solo le segnalazioni di tipo BUG possono essere assegnate (Funzionalità 4)[cite: 4, 5].
     *
     * @param bug L'entità da validare.
     * @throws InvalidIssueDomainException Se il tipo non è BUG.
     */
    public void validateAssignable(Issue bug) {
        if (bug.getType() != IssueType.BUG) {
            throw new InvalidIssueDomainException("Errore di Dominio: Solo le segnalazioni di tipo BUG possono essere assegnate.");
        }
    }

    /**
     * Verifica la coerenza temporale della data di scadenza (Funzionalità 18)[cite: 4, 5].
     *
     * @param dueDate La data da validare. Può essere null (opzionale).
     * @throws InvalidIssueDomainException Se la data è nel passato.
     */
    public void validateDueDate(LocalDate dueDate) {
        if (dueDate != null && dueDate.isBefore(LocalDate.now(ZoneId.systemDefault()))) {
            throw new InvalidIssueDomainException("Errore di Dominio: La data di scadenza non può essere nel passato.");
        }
    }
}
