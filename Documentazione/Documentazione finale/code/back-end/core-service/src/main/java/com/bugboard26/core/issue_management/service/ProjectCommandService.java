package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.CreateProject;
import com.bugboard26.core.issue_management.dto.UpdateProject;
import com.bugboard26.core.issue_management.exception.DuplicateProjectException;
import com.bugboard26.core.shared.dto.ProjectState;
import com.bugboard26.core.shared.exception.ProjectNotFoundException;

/**
 * Espone le operazioni che modificano il ciclo di vita di un progetto.
 *
 * Le implementazioni devono applicare i controlli di autorizzazione e
 * restituire lo stato aggiornato del progetto quando l'operazione lo prevede.
 */
public interface ProjectCommandService {

    /**
     * Crea un progetto dopo aver verificato i permessi dell'utente corrente.
     *
     * @param request dati del progetto da creare
     * @return stato del progetto appena persistito
     * @throws DuplicateProjectException se esiste già un progetto con lo stesso nome
     */
    ProjectState createProject(CreateProject request);

    /**
     * Aggiorna solo i campi valorizzati nella richiesta.
     *
     * @param id identificativo del progetto da aggiornare
     * @param request nuovi valori del nome e della descrizione
     * @return stato aggiornato del progetto
     * @throws ProjectNotFoundException se l'identificativo non corrisponde a un progetto
     * @throws DuplicateProjectException se il nuovo nome è già utilizzato
     */
    ProjectState updateProject(Long id, UpdateProject request);

    /**
     * Cancella un progetto.
     * @param id L'ID del progetto da cancellare.
     */
    void deleteProject(Long id);
}
