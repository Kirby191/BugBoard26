package com.bugboard26.core.issue_management.repository;

import com.bugboard26.core.shared.model.UserReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per la verifica dell'esistenza degli utenti nel Command Layer.
 * Interroga la vista 'user_reference' in sola lettura.
 * L'integrità dei dati è garantita dall'annotazione @Immutable presente nell'entità UserReference.
 */
@Repository
public interface ReadOnlyUserRepository extends JpaRepository<UserReference, Long> {

    // Non sono necessarie custom query.
    // IssueAssignmentService utilizzerà existsById(Long id) ereditato da JpaRepository
    // per validare l'assegnatario

}
