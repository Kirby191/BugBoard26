package com.bugboard26.core.issue_management.model;

import com.bugboard26.core.issue_management.model.Enums.IssuePriority;
import com.bugboard26.core.issue_management.model.Enums.IssueStatus;
import com.bugboard26.core.issue_management.model.Enums.IssueType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entità centrale di dominio per l'Issue Management Subsystem.
 * Mappa la tabella fisica 'issues' garantendo i vincoli di opzionalità richiesti.
 */
@Entity
@Table(name = "issues", schema = "bugboard")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Nullable (Opzionale)

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private IssueType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IssueStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private IssuePriority priority; // Nullable

    @Column(name = "due_date")
    private LocalDate dueDate; // Nullable

    // Chiavi esterne mappate come ID (Loose Coupling) per separazione logica
    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "assignee_id")
    private Long assigneeId; // Nullable

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
