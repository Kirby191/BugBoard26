package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.IssueDetailed;
import com.bugboard26.core.query_view.dto.IssueFilter;
import com.bugboard26.core.query_view.dto.IssueSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/** Espone le letture paginated delle issue senza operazioni di mutazione. */
public interface IssueQueryService {

    /** Cerca le issue applicando filtri, visibilità RBAC e paginazione. */
    Page<IssueSummary> searchIssues(IssueFilter filter, Pageable pageable);

    /** Recupera il dettaglio di una issue rispettando la visibilità dell'utente. */
    IssueDetailed getIssueById(Long id);
}
