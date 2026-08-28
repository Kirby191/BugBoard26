package com.bugboard26.core.query_view.model;

import com.bugboard26.core.shared.model.UserReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entità JPA che rappresenta una Notifica nel sistema (Query & View Subsystem).
 * Gestisce l'avviso asincrono generato dall'assegnazione di un bug.
 */
@Entity
@Table(name = "notifications", schema = "bugboard")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Richiesto da JPA
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relazione modellata come associazione verso UserReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false, updatable = false)
    private UserReference recipient;

    // Manteniamo il riferimento loose-coupled all'Issue tramite l'ID
    @Column(name = "bug_id", nullable = false, updatable = false)
    private Long bugId;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false, updatable = false)
    private String message;

    // Utilizzo del primitivo boolean per esprimere uno stato binario (letta/non letta)
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    // Corrisponde al "timestamp: LocalDateTime" dell'UML, mappato su "created_at" a DB
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    /**
     * Comportamento di dominio per contrassegnare la notifica come letta.
     */
    public void markAsRead() {
        this.isRead = true;
    }
}
