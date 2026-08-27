package com.bugboard26.core.issue_management.controller;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.issue_management.dto.ProjectState;
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
     * Crea un nuovo progetto (Solo Admin).
     */
    @PostMapping
    public ResponseEntity<ProjectState> createProject(@RequestBody @Valid CreateProject request) {
        ProjectState response = projectCommandService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Aggiorna nome o descrizione di un progetto esistente (Solo Admin).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectState> updateProject(
            @PathVariable Long id,
            @RequestBody @Valid UpdateProject request) {

        ProjectState response = projectCommandService.updateProject(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un progetto e, a cascata (ON DELETE CASCADE), le issue collegate.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectCommandService.deleteProject(id);
        return ResponseEntity.noContent().build(); // Restituisce 204 No Content
    }
}
