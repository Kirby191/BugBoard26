package com.bugboard26.core.query_view.controller;

import com.bugboard26.core.history.dto.BugHistory;
import com.bugboard26.core.query_view.dto.IssueDetailed;
import com.bugboard26.core.query_view.dto.IssueFilter;
import com.bugboard26.core.query_view.dto.IssueSummary;
import com.bugboard26.core.query_view.service.IssueQueryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST per il Query Layer delle Segnalazioni.
 * Gestisce esclusivamente le interrogazioni di lettura, filtraggio e dettaglio (CQRS).
 */
@RestController
@RequestMapping("/api/issues")
public class IssueQueryController {

    private final IssueQueryService issueQueryService;

    public IssueQueryController(IssueQueryService issueQueryService) {
        this.issueQueryService = issueQueryService;
    }

    /**
     * Ricerca e filtra le segnalazioni in formato paginato (Funzionalità 3).
     * Risponde a GET /api/issues
     */
    @GetMapping
    public ResponseEntity<Page<IssueSummary>> searchIssues(
            @ModelAttribute IssueFilter filter,
            Pageable pageable) {

        Page<IssueSummary> result = issueQueryService.searchIssues(filter, pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * Recupera i dettagli completi di una specifica segnalazione.
     * Risponde a GET /api/issues/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<IssueDetailed> getIssueById(@PathVariable Long id) {
        IssueDetailed issue = issueQueryService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    /**
     * Recupera lo storico delle modifiche per un bug specifico (Funzionalità 12).
     * Risponde a GET /api/issues/{issueId}/history
     */
    @GetMapping("/{issueId}/history")
    public ResponseEntity<List<BugHistory>> getBugHistory(@PathVariable Long issueId) {
        List<BugHistory> history = issueQueryService.getBugHistory(issueId);
        return ResponseEntity.ok(history);
    }
}
