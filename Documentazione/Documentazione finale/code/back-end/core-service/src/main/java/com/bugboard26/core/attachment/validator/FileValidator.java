package com.bugboard26.core.attachment.validator;

import com.bugboard26.core.attachment.exception.FileSizeExceededException;
import com.bugboard26.core.attachment.exception.InvalidFileTypeException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Validatore per i file multimediali in ingresso.
 * Previene l'upload di file non consentiti o eccessivamente grandi.
 */
@Component
public class FileValidator {

    // Costanti definite esplicitamente nel Class Diagram dell'Attachment Subsystem
    private static final List<String> ALLOWED_MIME_TYPES = List.of("image/jpeg", "image/png", "image/gif");
    private static final long MAX_FILE_SIZE = 5242880L; // 5MB

    /**
     * Esegue i controlli di sicurezza sull'allegato.
     *
     * @param file L'oggetto MultipartFile ricevuto dal client.
     */
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileTypeException("Il file non può essere vuoto");
        }

        // 1. Validazione dimensione
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeExceededException("La dimensione del file supera il limite consentito di 5MB");
        }

        // 2. Validazione rigorosa del tipo MIME
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new InvalidFileTypeException("Tipo di file non supportato. Tipi ammessi: JPEG, PNG, GIF");
        }
    }
}
