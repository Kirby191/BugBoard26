package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.shared.dto.ProjectState;
import com.bugboard26.core.issue_management.dto.UpdateProject;
import com.bugboard26.core.issue_management.exception.DuplicateProjectException;
import com.bugboard26.core.shared.exception.ProjectNotFoundException;
import com.bugboard26.core.issue_management.model.Project;
import com.bugboard26.core.issue_management.repository.ProjectRepository;
import com.bugboard26.core.issue_management.validator.AccessControlValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementazione del servizio di comando per la gestione dei progetti.
 * Coordina la creazione, l'aggiornamento e la cancellazione atomica
 * delle informazioni generali di un progetto.
 */
@Service
public class ProjectCommandServiceImpl implements ProjectCommandService {

    private final ProjectRepository projectRepository;
    private final AccessControlValidator accessControlValidator;

    public ProjectCommandServiceImpl(ProjectRepository projectRepository,
                                     AccessControlValidator accessControlValidator) {
        this.projectRepository = projectRepository;
        this.accessControlValidator = accessControlValidator;
    }

    @Override
    @Transactional
    public ProjectState createProject(CreateProject request) {
        accessControlValidator.canManageProjects();

        if (projectRepository.existsByName(request.name())) {
            throw new DuplicateProjectException("Esiste già un progetto con il nome: " + request.name());
        }

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .build();

        Project savedProject = projectRepository.save(project);

        return mapToProjectState(savedProject);
    }

    @Override
    @Transactional
    public ProjectState updateProject(Long id, UpdateProject request) {
        accessControlValidator.canManageProjects();

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Progetto non trovato con ID: " + id));

        if (request.name() != null && !request.name().equals(project.getName())) {
            if (projectRepository.existsByNameAndIdNot(request.name(), id)) {
                throw new DuplicateProjectException("Il nome '" + request.name() + "' è già utilizzato da un altro progetto.");
            }
            project.setName(request.name());
        }

        if (request.description() != null) {
            project.setDescription(request.description());
        }

        Project savedProject = projectRepository.save(project);

        return mapToProjectState(savedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        accessControlValidator.canManageProjects();

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Progetto non trovato con ID: " + id));

        projectRepository.delete(project);
    }

    private ProjectState mapToProjectState(Project project) {
        return new ProjectState(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getUpdatedAt()
        );
    }
}
