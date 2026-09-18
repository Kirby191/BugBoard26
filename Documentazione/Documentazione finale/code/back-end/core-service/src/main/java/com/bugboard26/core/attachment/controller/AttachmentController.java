package com.bugboard26.core.attachment.controller;

import com.bugboard26.core.attachment.provider.StorageProvider;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;

/**
 * Espone gli allegati come risorse inline, così il browser può visualizzare
 * direttamente immagini e altri file per cui conosce il tipo MIME.
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final StorageProvider storageProvider;

    public AttachmentController(StorageProvider storageProvider) {
        this.storageProvider = storageProvider;
    }

    /**
     * Recupera un allegato tramite il nome completo del file.
     *
    * Il suffisso {@code :.+} nella rotta impedisce a Spring
     * di troncare il valore della variabile quando il nome contiene un punto.
     *
     * @param filename nome univoco dell'allegato comprensivo di estensione
     * @return risorsa pronta per essere visualizzata dal client
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {

        // Il provider risolve gli allegati usando lo stesso percorso esposto dall'API.
        String fileUrl = "/api/attachments/" + filename;
        Resource resource = storageProvider.retrieve(fileUrl);

        // Il fallback mantiene il download leggibile anche quando il filesystem
        // non riconosce il formato del file.
        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (IOException e) {
            // Il tipo predefinito è sufficiente per restituire comunque la risorsa.
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
