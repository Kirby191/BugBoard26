package com.bugboard26.core.history.repository;

import com.bugboard26.core.history.model.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA per la gestione dell'entità AuditRecord.
 * Permette il salvataggio immutabile degli eventi e l'estrazione
 * dello storico ordinato cronologicamente per un singolo bug.
 */
@Repository
public interface AuditRepository extends JpaRepository<AuditRecord, Long> {

    /**
     * Recupera la cronologia completa di un bug specifico,
     * ordinata dalla modifica più recente alla più vecchia.
     *
     * @param bugId L'ID del bug di cui si vuole ottenere la cronologia.
     * @return Lista di eventi storici (AuditRecord) ordinata in modo discendente.
     */
    List<AuditRecord> findByBugIdOrderByTimestampDesc(Long bugId);

}