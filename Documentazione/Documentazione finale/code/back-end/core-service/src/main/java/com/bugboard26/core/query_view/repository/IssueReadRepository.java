package com.bugboard26.core.query_view.repository;

import com.bugboard26.core.issue_management.model.Issue;
import com.bugboard26.core.issue_management.model.enums.IssuePriority;
import com.bugboard26.core.issue_management.model.enums.IssueStatus;
import com.bugboard26.core.issue_management.model.enums.IssueType;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

/**
 * Repository di sola lettura per le Segnalazioni.
 * Estende JpaSpecificationExecutor per permettere il filtraggio dinamico..
 */

@Repository
/** Repository CQRS per cercare issue senza esporre operazioni di scrittura. */
public interface IssueReadRepository extends ReadOnlyRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    // =========================================================================
    // METRICHE DASHBOARD
    // =========================================================================

    int countByStatus(IssueStatus status);

    int countByPriority(IssuePriority priority);

    int countByDueDateLessThanEqualAndStatusNot(LocalDate date, IssueStatus status);

    // Adattato al Loose Coupling: cerca se l'ID assegnatario è null anziché l'intero oggetto
    int countByTypeAndAssigneeIdIsNull(IssueType type);

}
