package com.bugboard26.core.issue_management.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entità di dominio che rappresenta un Progetto nel sistema.
 * Mappa la tabella fisica 'projects' garantendo i vincoli richiesti
 */
@Entity
@Table(name = "projects", schema = "bugboard")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vincolo Not Null richiesto dallo schema DDL
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    // Opzionale (Nullable) come definito nei requisiti di database
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Tracciamento automatico della creazione
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Mappa l'attributo 'lastModified' richiesto dai Class Diagram[cite: 4, 8]
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
