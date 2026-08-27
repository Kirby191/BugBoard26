package com.bugboard26.core.issue_management.controller;

import com.bugboard26.core.issue_management.dto.AssignBug;
import com.bugboard26.core.issue_management.dto.CreateIssue;
import com.bugboard26.core.issue_management.dto.IssueResponse;
import com.bugboard26.core.issue_management.dto.UpdateIssue;
import com.bugboard26.core.issue_management.service.AssignBugService;
import com.bugboard26.core.issue_management.service.IssueCommandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

/**
 * Controller REST per il Command Layer delle Segnalazioni.
 * Gestisce esclusivamente le mutazioni di stato (CQRS - Lato Scrittura).
 */
@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueCommandService issueCommandService;
    private final AssignBugService assignBugService;

    public IssueController(IssueCommandService issueCommandService, AssignBugService assignBugService) {
        this.issueCommandService = issueCommandService;
        this.assignBugService = assignBugService;
    }

    /**
     * Crea una nuova segnalazione, supportando l'upload opzionale di un allegato.
     * Mappato su POST /api/issues come da specifiche
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IssueResponse> createIssue(
            @RequestPart("issue") @Valid CreateIssue request,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        IssueResponse response = issueCommandService.createIssue(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Aggiorna i dati generali di una segnalazione.
     * Mappato su PUT /api/issues/{id} come da specifiche
     */
    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @RequestBody @Valid UpdateIssue request) {

        IssueResponse response = issueCommandService.updateIssue(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Assegna un bug a un membro del team.
     * Mappato su PUT /api/issues/{id}/assign come da specifiche
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<IssueResponse> assignBug(
            @PathVariable Long id,
            @RequestBody @Valid AssignBug request) {

        IssueResponse response = assignBugService.assignBug(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Modifica o rimuove la data di scadenza di una segnalazione.
     */
    @PutMapping("/{id}/due-date")
    public ResponseEntity<IssueResponse> setDueDate(
            @PathVariable Long id,
            @RequestParam(required = false) LocalDate dueDate) {

        IssueResponse response = issueCommandService.setDueDate(id, dueDate);
        return ResponseEntity.ok(response);
    }
}
