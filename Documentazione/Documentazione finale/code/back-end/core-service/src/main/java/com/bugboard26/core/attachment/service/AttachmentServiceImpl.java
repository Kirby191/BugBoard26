package com.bugboard26.core.attachment.service;

import com.bugboard26.core.attachment.exception.FileNotFoundException;
import com.bugboard26.core.attachment.model.AttachmentMetadata;
import com.bugboard26.core.attachment.provider.StorageProvider;
import com.bugboard26.core.attachment.repository.AttachmentMetadataRepository;
import com.bugboard26.core.attachment.validator.FileValidator;
import com.bugboard26.core.shared.security.AuthenticatedUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Implementazione core del sottosistema Attachment.
 * Agisce da collante tra le validazioni, lo Storage fisico (Strategy Pattern)
 * e la persistenza dei metadati su PostgreSQL[cite: 3, 4].
 */
@Service
public class AttachmentServiceImpl implements FileStorage, AttachmentService {

    private final StorageProvider storageProvider;
    private final AttachmentMetadataRepository metadataRepository;
    private final FileValidator fileValidator;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    // Iniezione di tutte le dipendenze richieste dal Class Diagram
    public AttachmentServiceImpl(StorageProvider storageProvider,
                                 AttachmentMetadataRepository metadataRepository,
                                 FileValidator fileValidator,
                                 AuthenticatedUserProvider authenticatedUserProvider) {
        this.storageProvider = storageProvider;
        this.metadataRepository = metadataRepository;
        this.fileValidator = fileValidator;
        this.authenticatedUserProvider = authenticatedUserProvider;
    }

    /**
     * Implementazione del FileStorage esportato verso l'Issue Management.
     * Delega l'elaborazione al metodo interno.
     */
    @Override
    @Transactional
    public String storeFile(MultipartFile file) {
        return uploadImage(file);
    }

    /**
     * Flusso completo di validazione, archiviazione fisica e tracciamento metadati.
     */
    @Override
    @Transactional
    public String uploadImage(MultipartFile file) {

        // 1. Validazione di sicurezza (MIME-Type e Dimensioni)
        fileValidator.validate(file);

        // 2. Generazione di un nome univoco (Prevenzione attacchi Path Traversal)
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // 3. Delegazione dell'I/O allo StorageProvider (Docker Volume o AWS S3)
        String fileUrl = storageProvider.store(file, uniqueFileName);

        // 4. Creazione dell'entità che traccia unicamente i metadati (Niente BLOB nel DB)
        AttachmentMetadata metadata = AttachmentMetadata.builder()
                .originalFileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .fileUrl(fileUrl)
                .build();

        // 5. Persistenza strutturata
        metadataRepository.save(metadata);

        // Ritorna l'URL in modo che il modulo Issue possa referenziare l'allegato
        return fileUrl;
    }

    /**
     * Recupera l'URL di un allegato a partire dal suo ID.
     */
    @Override
    @Transactional(readOnly = true)
    public String getFileUrl(Long fileId) {
        // Verifica preliminare dell'utente richiedente (per sicurezza e logging)
        Long currentUserId = authenticatedUserProvider.getCurrentUserId();

        AttachmentMetadata metadata = metadataRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("Allegato non trovato con ID: " + fileId));

        return metadata.getFileUrl();
    }
}
