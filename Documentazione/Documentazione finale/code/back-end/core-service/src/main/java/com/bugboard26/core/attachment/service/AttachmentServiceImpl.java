package com.bugboard26.core.attachment.service;

import com.bugboard26.core.attachment.exception.FileNotFoundException;
import com.bugboard26.core.attachment.model.AttachmentMetadata;
import com.bugboard26.core.attachment.provider.StorageProvider;
import com.bugboard26.core.attachment.repository.AttachmentMetadataRepository;
import com.bugboard26.core.attachment.validator.FileValidator;
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
    public String storeFile(Long issueId, MultipartFile file) {

        fileValidator.validate(file);

        String uniqueFileName = generateUniqueFileName(file.getOriginalFilename());

        String fileUrl = storageProvider.store(file, uniqueFileName);

        AttachmentMetadata metadata = AttachmentMetadata.builder()
                .issueId(issueId)
                .originalFileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .fileUrl(fileUrl)
                .build();

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
     * Rimuove i segmenti di percorso dal nome ricevuto e antepone un UUID.
     * In questo modo il client non può scegliere una destinazione arbitraria
     * e due upload con lo stesso nome non si sovrascrivono logicamente.
     */
    private String generateUniqueFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return UUID.randomUUID().toString();
        }

        // Estrae il nome del file ignorando il percorso eventualmente inviato dal client
        String cleanFileName = StringUtils.getFilename(originalFilename);

        if (cleanFileName.isBlank()) return UUID.randomUUID().toString();

        // Sanitizzazione esplicita: rimuove tutto ciò che non è alfanumerico, punto o trattino.
        // Questo distrugge sul nascere eventuali sequenze di directory traversal come ".." o "/"
        cleanFileName = cleanFileName.replaceAll("[^a-zA-Z0-9.\\-]", "_");

        cleanFileName = cleanFileName.replaceAll("\\.+", "."); // Sostituisce più punti consecutivi con un singolo punto
        cleanFileName = cleanFileName.replaceAll("-+", "-"); // Sostituisce più trattini consecutivi con un singolo trattino
        cleanFileName = cleanFileName.replaceAll("^\\.", ""); // Rimuove il punto iniziale, se presente
        cleanFileName = cleanFileName.replaceAll("\\.$", ""); // Rimuove il punto finale, se presente
        cleanFileName = cleanFileName.replaceAll("^-", ""); // Rimuove il trattino iniziale, se presente
        cleanFileName = cleanFileName.replaceAll("-$", ""); // Rimuove il trattino finale, se presente

        return UUID.randomUUID() + "_" + cleanFileName;
    }
}
