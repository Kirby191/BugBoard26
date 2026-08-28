package com.bugboard26.core.query_view.repository;

import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.model.Enums.IssuePriority;
import com.bugboard26.core.issue_management.model.Enums.IssueStatus;
import com.bugboard26.core.issue_management.model.Enums.IssueType;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

/**
 * Repository di sola lettura per le Segnalazioni.
 * Estende JpaSpecificationExecutor per permettere il filtraggio dinamico..
 */

// TODO: Dopo una riflessione, si è pensato di far estendere anche JpaSpecificationExecutor per permettere il filtraggio
//  dinamico delle segnalazioni, in modo da poter implementare facilmente
//  le funzionalità di ricerca e filtro nel Query Layer. Bisogna aggiungerlo nella documentazione finale.
@Repository
public interface IssueReadRepository extends ReadOnlyRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    // =========================================================================
    // METRICHE DASHBOARD
    // =========================================================================

    int countByStatus(IssueStatus status);

    int countByPriority(IssuePriority priority);

    int countByDueDateBeforeAndStatusNot(LocalDate date, IssueStatus status);

    // Adattato al Loose Coupling: cerca se l'ID assegnatario è null anziché l'intero oggetto
    int countByTypeAndAssigneeIdIsNull(IssueType type);

}
