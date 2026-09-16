package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.issue_management.dto.UpdateProject;
import com.bugboard26.core.shared.dto.ProjectState;


public interface ProjectCommandService {

    ProjectState createProject(CreateProject request);

    ProjectState updateProject(Long id, UpdateProject request);

    /**
     * Cancella un progetto.
     * @param id L'ID del progetto da cancellare.
     */
    void deleteProject(Long id);
}
