package com.bugboard26.core.attachment.repository;

import com.bugboard26.core.attachment.model.AttachmentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA per la persistenza dei metadati degli allegati.
 * Eredita i metodi CRUD nativi di Spring Data JPA per salvare le informazioni spaziali
 * (nome, dimensione, tipo, URL) senza memorizzare il file binario nel DB.
 */
@Repository
public interface AttachmentMetadataRepository extends JpaRepository<AttachmentMetadata, Long> {
}
