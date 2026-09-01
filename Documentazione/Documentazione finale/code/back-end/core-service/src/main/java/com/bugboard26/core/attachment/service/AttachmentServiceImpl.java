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
import org.springframework.util.StringUtils;

import java.util.UUID;

/**
 * Implementazione core del sottosistema Attachment.
 * Agisce da collante tra le validazioni, lo Storage fisico (Strategy Pattern)
 * e la persistenza dei metadati su PostgreSQL.
 */
@Service
public class AttachmentServiceImpl implements FileStorage, AttachmentService {

    private final StorageProvider storageProvider;
    private final AttachmentMetadataRepository metadataRepository;
    private final FileValidator fileValidator;

    // Iniezione di tutte le dipendenze richieste dal Class Diagram
    public AttachmentServiceImpl(StorageProvider storageProvider,
                                 AttachmentMetadataRepository metadataRepository,
                                 FileValidator fileValidator) {
        this.storageProvider = storageProvider;
        this.metadataRepository = metadataRepository;
        this.fileValidator = fileValidator;
    }

    /**
     * Implementazione del FileStorage esportato verso l'Issue Management.
     */
    @Override
    @Transactional
    public String storeFile(MultipartFile file) {

        // 1. Validazione di sicurezza
        fileValidator.validate(file);

        // 2. Generazione di un nome univoco
        String uniqueFileName = generateUniqueFileName(file.getOriginalFilename());

        // 3. Delegazione dell'I/O allo StorageProvider
        String fileUrl = storageProvider.store(file, uniqueFileName);

        // 4. Creazione dell'entità TRACCIANDO L'ISSUE ID
        AttachmentMetadata metadata = AttachmentMetadata.builder()
                .originalFileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .fileUrl(fileUrl)
                .build();

        // 5. Persistenza strutturata
        metadataRepository.save(metadata);

        return fileUrl;
    }

    /**
     * Recupera l'URL di un allegato a partire dal suo ID.
     */
    @Override
    @Transactional(readOnly = true)
    public String getFileUrl(Long fileId) {
        AttachmentMetadata metadata = metadataRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("Allegato non trovato con ID: " + fileId));

        return metadata.getFileUrl();
    }


    /**
     * Strips any malicious path sequences (e.g., "../../") from the filename
     * and prepends a UUID to guarantee uniqueness.
     */
    private String generateUniqueFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return UUID.randomUUID().toString();
        }

        // Spring utility that extracts just the file name, ignoring any path prefix
        String cleanFileName = StringUtils.getFilename(originalFilename);

        // Fallback in case the filename is somehow empty after cleaning
        if (cleanFileName.isBlank()) {
            return UUID.randomUUID().toString();
        }

        return UUID.randomUUID() + "_" + cleanFileName;
    }
}
