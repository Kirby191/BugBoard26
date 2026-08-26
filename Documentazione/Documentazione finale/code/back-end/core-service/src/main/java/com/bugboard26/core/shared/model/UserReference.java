package com.bugboard26.core.shared.model;

import com.bugboard26.core.issue_management.model.Enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

/**
 * Entità in sola lettura che mappa la vista SQL 'user_reference'.
 * Permette al core-service di relazionare le issue e la cronologia (History)
 * agli utenti senza avere i privilegi per modificarne i dati anagrafici o le credenziali.
 */
@Entity
@Table(name = "user_reference", schema = "bugboard")
@Immutable // Impedisce a Hibernate di eseguire query di INSERT, UPDATE o DELETE su questa entità
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Costruttore protetto richiesto da Hibernate per creare istanze tramite reflection
@AllArgsConstructor
public class UserReference {

    @Id
    // INFO: Non c'è @GeneratedValue perché il core-service NON crea utenti, li legge e basta.
    private Long id;

    @Column(name = "email", updatable = false, insertable = false)
    private String email;

    @Column(name = "username", updatable = false, insertable = false)
    private String username;

    @Column(name = "role", updatable = false, insertable = false)
    private Role role;

}
