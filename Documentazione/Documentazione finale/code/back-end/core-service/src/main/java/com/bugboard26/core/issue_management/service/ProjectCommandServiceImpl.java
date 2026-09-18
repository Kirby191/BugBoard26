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
        /*
         * Il controllo dei permessi precede ogni accesso ai dati: in questo modo
         * un utente non autorizzato non può ottenere informazioni sul progetto.
         */
        accessControlValidator.canManageProjects();

        // Il nome è la chiave funzionale del progetto e deve restare univoco.
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

        // Il progetto viene caricato prima dei controlli sui campi per distinguere
        // l'assenza della risorsa da un aggiornamento parziale valido.
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Progetto non trovato con ID: " + id));

        /*
         * Un nome nullo significa "non modificare". Quando invece cambia,
         * la verifica esclude il progetto corrente per permettere il salvataggio
         * del suo stesso nome senza segnalare un duplicato.
         */
        if (request.name() != null && !request.name().equals(project.getName())) {
            if (projectRepository.existsByNameAndIdNot(request.name(), id)) {
                throw new DuplicateProjectException("Il nome '" + request.name() + "' è già utilizzato da un altro progetto.");
            }
            project.setName(request.name());
        }

        // Anche la descrizione segue la semantica di aggiornamento parziale.
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

        // Si elimina l'entità caricata per mantenere lo stesso comportamento
        // di errore dell'aggiornamento quando l'ID non esiste.
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException("Progetto non trovato con ID: " + id));

        projectRepository.delete(project);
    }

    private ProjectState mapToProjectState(Project project) {
        // Il mapping impedisce di esporre direttamente l'entità JPA al controller.
        return new ProjectState(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getUpdatedAt()
        );
    }
}
