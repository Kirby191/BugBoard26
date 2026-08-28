package com.bugboard26.core.query_view.controller;

import com.bugboard26.core.query_view.service.ProjectQueryService;
import com.bugboard26.core.shared.dto.ProjectState;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST per il Query Layer dei Progetti.
 * Gestisce esclusivamente le operazioni di lettura (CQRS).
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectQueryController {

    private final ProjectQueryService projectQueryService;

    public ProjectQueryController(ProjectQueryService projectQueryService) {
        this.projectQueryService = projectQueryService;
    }

    /**
     * Recupera la lista di tutti i progetti per popolare i dropdown del front-end.
     * Risponde a GET /api/projects
     */
    @GetMapping
    public ResponseEntity<List<ProjectState>> getProjects() {
        List<ProjectState> projects = projectQueryService.getProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * Recupera i dettagli di un singolo progetto.
     * Risponde a GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectState> getProjectById(@PathVariable Long id) {
        ProjectState project = projectQueryService.getProjectById(id);
        return ResponseEntity.ok(project);
    }
}
