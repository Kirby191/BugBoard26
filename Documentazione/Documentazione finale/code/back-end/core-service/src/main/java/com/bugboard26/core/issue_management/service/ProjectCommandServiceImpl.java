package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.issue_management.dto.ProjectState;
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

    // Iniezione delle dipendenze strettamente necessarie per il Command Layer
    public ProjectCommandServiceImpl(ProjectRepository projectRepository,
                                     AccessControlValidator accessControlValidator) {
        this.projectRepository = projectRepository;
        this.accessControlValidator = accessControlValidator;
    }

    @Override
    @Transactional
    public ProjectState createProject(CreateProject request) {
        // 1. Sicurezza: Solo un Amministratore può creare progetti
        accessControlValidator.canManageProjects();

        // 2. Sonda di validazione ad alte prestazioni per prevenire duplicati
        if (projectRepository.existsByName(request.name())) {
            throw new DuplicateProjectException("Esiste già un progetto con il nome: " + request.name());
        }

        // 3. Creazione Entità
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .build();

        // 4. Persistenza
        Project savedProject = projectRepository.save(project);

        // 5. Ritorno DTO
        return mapToProjectState(savedProject);
    }

    @Override
    @Transactional
    public ProjectState updateProject(Long id, UpdateProject request) {
        // 1. Sicurezza: Solo un Amministratore può aggiornare progetti
        accessControlValidator.canManageProjects();

        // 2. Recupero Entità
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Progetto non trovato con ID: " + id));

        // 3. Validazione di Dominio: univocità del nuovo nome escludendo l'id corrente
        if (request.name() != null && !request.name().equals(project.getName())) {
            if (projectRepository.existsByNameAndIdNot(request.name(), id)) {
                throw new DuplicateProjectException("Il nome '" + request.name() + "' è già utilizzato da un altro progetto.");
            }
            project.setName(request.name());
        }

        if (request.description() != null) {
            project.setDescription(request.description());
        }

        // 4. Salvataggio
        Project savedProject = projectRepository.save(project);

        return mapToProjectState(savedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        // 1. Sicurezza: Solo un Amministratore può cancellare progetti
        accessControlValidator.canManageProjects();

        // 2. Recupero Entità per validare l'esistenza
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Progetto non trovato con ID: " + id));

        // 3. Cancellazione
        // IMPORTANT: A livello di database questa operazione scatenerà l'ON DELETE CASCADE
        // sulle issue collegate nel database.
        projectRepository.delete(project);
    }

    /**
     * Metodo di utility privato per generare il DTO ProjectState
     */
    private ProjectState mapToProjectState(Project project) {
        return new ProjectState(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getUpdatedAt()
        );
    }
}
