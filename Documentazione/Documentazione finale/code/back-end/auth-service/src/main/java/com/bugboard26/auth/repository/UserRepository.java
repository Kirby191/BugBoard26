package com.bugboard26.auth.repository;

import com.bugboard26.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA per la gestione della persistenza dell'entità User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Ricerca un utente per email.
     * @param email l'email dell'utente
     * @return Optional contenente l'User se presente, empty altrimenti
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica l'esistenza di un utente tramite la sua email.
     * Utilizzato durante la fase di Registrazione per prevenire duplicati.
     * @param email l'email da verificare
     * @return true se l'email esiste già a DB, false altrimenti
     */
    boolean existsByEmail(String email);
}
