package com.bugboard26.core.attachment.provider;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interfaccia che implementa lo Strategy Pattern per l'archiviazione fisica dei file[cite: 3].
 * Disaccoppia la logica di business dalla tecnologia di storage effettiva (es. File System Locale o AWS S3).
 */
public interface StorageProvider {

    /**
     * Salva il file fisico nello storage e restituisce l'URL di accesso.
     *
     * @param file L'oggetto MultipartFile da salvare.
     * @param uniqueFileName Il nome univoco generato dal servizio per evitare Path Traversal.
     * @return L'URI o URL generato per la risorsa.
     */
    String store(MultipartFile file, String uniqueFileName);

    /**
     * Recupera il file fisico dallo storage sotto forma di risorsa scaricabile.
     *
     * @param fileUrl L'URL o percorso della risorsa salvata.
     * @return Un oggetto Resource di Spring rappresentante il file binario.
     */
    Resource retrieve(String fileUrl);

}