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
 * Valida le regole di dominio prima delle operazioni di scrittura.
 */
@Component
public class IssueDomainValidator {

    private final ProjectRepository projectRepository;

    public IssueDomainValidator(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    /**
    * Verifica l'esistenza del progetto associato.
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
    * Solo le segnalazioni di tipo BUG possono essere assegnate.
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
    * Verifica che la data di scadenza non sia nel passato.
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
