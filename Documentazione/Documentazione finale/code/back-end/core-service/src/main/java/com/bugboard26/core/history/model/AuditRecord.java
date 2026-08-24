package com.bugboard26.core.history.model;

import com.bugboard26.core.shared.model.UserReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * Entità JPA che rappresenta un singolo log nel registro storico.
 * Mappa la tabella fisica 'bug_history' e garantisce l'immutabilità dei dati[cite: 10].
 */
@Entity
@Table(name = "bug_history", schema = "bugboard")
@Immutable // L'entità non può essere modificata dopo l'inserimento
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Richiesto da JPA
@AllArgsConstructor
@Builder
public class AuditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associa l'evento unicamente alle segnalazioni di tipo BUG (Funzionalità 12)[cite: 10]
    @Column(name = "bug_id", nullable = false, updatable = false)
    private Long bugId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 30, updatable = false)
    private AuditAction action;

    @Column(name = "details", columnDefinition = "TEXT", updatable = false)
    private String details;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    // Relazione mappata sulla FK 'performed_by_user_id' e associata al ruolo 'author'[cite: 3, 10]
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_user_id", nullable = false, updatable = false)
    private UserReference author;

}