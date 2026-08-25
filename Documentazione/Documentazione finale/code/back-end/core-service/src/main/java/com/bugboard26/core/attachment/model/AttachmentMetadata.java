package com.bugboard26.core.attachment.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * Entità JPA che modella i metadati degli allegati multimediali.
 * Delega il salvataggio fisico dei BLOB all'Object Storage
 */
@Entity
@Table(name = "attachments", schema = "bugboard")
@Immutable // L'allegato, una volta caricato, non viene modificato
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AttachmentMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associazione alla segnalazione di riferimento (Foreign Key)
    @Column(name = "issue_id", nullable = false, updatable = false)
    private Long issueId;

    @Column(name = "filename", nullable = false, updatable = false)
    private String originalFileName;

    @Column(name = "file_type", nullable = false, length = 100, updatable = false)
    private String mimeType;

    @Column(name = "file_size", nullable = false, updatable = false)
    private long fileSize;

    @Column(name = "file_path", nullable = false, length = 500, updatable = false)
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "upload_timestamp", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

}
