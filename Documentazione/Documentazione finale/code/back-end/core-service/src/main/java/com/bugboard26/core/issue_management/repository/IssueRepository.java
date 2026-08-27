package com.bugboard26.core.issue_management.repository;

import com.bugboard26.core.issue_management.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA per la gestione in scrittura dell'entità Issue (Command Layer).
 * Fornisce i metodi necessari per le mutazioni di stato e le validazioni pre-inserimento[cite: 4].
 */
@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    /**
     * Sonda di validazione ad alte prestazioni.
     * Verifica se in un determinato progetto esiste già una segnalazione con lo stesso titolo.
     * Spring Data JPA genera automaticamente la query SQL ottimizzata con COUNT/EXISTS.
     *
     * @param projectId L'ID del progetto in cui cercare.
     * @param title Il titolo della segnalazione.
     * @return true se esiste un duplicato, false altrimenti.
     */
    boolean existsByProjectIdAndTitle(Long projectId, String title);

    // I metodi standard come save(), findById(), existsById() e getReferenceById()
    // sono ereditati nativamente da JpaRepository
}
