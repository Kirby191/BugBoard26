package com.bugboard26.core.query_view.service;

import com.bugboard26.core.shared.dto.ProjectState;
import java.util.List;

/**
 * Interfaccia di servizio in sola lettura per l'estrazione dei progetti.
 */
public interface ProjectQueryService {

    List<ProjectState> getProjects();

    ProjectState getProjectById(Long id);
}
