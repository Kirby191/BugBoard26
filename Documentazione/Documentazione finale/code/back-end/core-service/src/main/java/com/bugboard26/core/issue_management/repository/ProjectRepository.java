package com.bugboard26.core.issue_management.repository;

import com.bugboard26.core.issue_management.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA per la gestione in scrittura dell'entità Project (Command Layer).
 * Fornisce i metodi necessari per le mutazioni di stato e le validazioni sui nomi dei progetti.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Sonda di validazione ad alte prestazioni per la creazione.
     * Verifica se esiste già un progetto con il nome specificato.
     *
     * @param name Il nome del progetto da verificare.
     * @return true se il nome è già in uso, false altrimenti.
     */
    boolean existsByName(String name);

    /**
     * Sonda di validazione ad alte prestazioni per la modifica.
     * Verifica se esiste già un progetto con il nome specificato, escludendo l'ID del progetto corrente.
     *
     * @param name Il nuovo nome da assegnare al progetto.
     * @param id L'ID del progetto che si sta modificando.
     * @return true se il nome è occupato da un altro progetto, false altrimenti.
     */
    boolean existsByNameAndIdNot(String name, Long id);

    // I metodi standard come save() e findById() sono ereditati nativamente da JpaRepository

}
