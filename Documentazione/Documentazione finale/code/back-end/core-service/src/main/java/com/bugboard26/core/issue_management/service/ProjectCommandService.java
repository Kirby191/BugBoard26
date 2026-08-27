package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.issue_management.dto.UpdateProject;
import com.bugboard26.core.issue_management.dto.ProjectState;


public interface ProjectCommandService {

    ProjectState createProject(CreateProject request);

    ProjectState updateProject(Long id, UpdateProject request);

    /**
     * Cancella un progetto.
     * @param id L'ID del progetto da cancellare.
     */
    /* TODO: aggiungere alla Documentazione Finale (con Class Diagram Issue_Management aggiornato)
     *  tale modifica, in quanto essendo i progetti manipolabili solo da admin, ha senso poterli rimuovere.
     *  WARN: Tale modifica eliminerà TUTTE le issue collegate per via della clausola "ON DELETE CASCADE"
     *  definita nella relazione tra Project e Issue.
     */
    void deleteProject(Long id);
}
