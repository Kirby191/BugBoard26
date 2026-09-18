package com.bugboard26.core.issue_management.controller;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.shared.dto.ProjectState;
import com.bugboard26.core.issue_management.dto.UpdateProject;
import com.bugboard26.core.issue_management.service.ProjectCommandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST per il Command Layer dei Progetti.
 * Gestisce la creazione, l'aggiornamento e l'eliminazione dei progetti (CQRS - Lato Scrittura).
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectCommandService projectCommandService;

    public ProjectController(ProjectCommandService projectCommandService) {
        this.projectCommandService = projectCommandService;
    }

    /**
     * Riceve i dati del nuovo progetto e delega la persistenza al command service.
     *
     * @param request dati validati del progetto
     * @return risposta HTTP 201 con lo stato persistito del progetto
     */
    @PostMapping
    public ResponseEntity<ProjectState> createProject(@RequestBody @Valid CreateProject request) {
        ProjectState response = projectCommandService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Applica un aggiornamento parziale al progetto indicato.
     *
     * @param id identificativo del progetto
     * @param request campi da modificare; i valori nulli restano invariati
     * @return risposta HTTP 200 con lo stato aggiornato
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectState> updateProject(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProject request) {

        ProjectState response = projectCommandService.updateProject(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina il progetto indicato e lascia al database la gestione delle relazioni a cascata.
     *
     * @param id identificativo del progetto da eliminare
     * @return risposta HTTP 204 senza contenuto
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectCommandService.deleteProject(id);
        return ResponseEntity.noContent().build(); // Restituisce 204 No Content
    }
}
