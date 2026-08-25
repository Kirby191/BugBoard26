package com.bugboard26.core.attachment.controller;

import com.bugboard26.core.attachment.provider.StorageProvider;
import com.bugboard26.core.attachment.service.AttachmentService;
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
 * Controller REST per l'erogazione sicura degli allegati multimediali.
 * Previene l'accesso diretto ai file garantendo la verifica dei permessi (Prevenzione IDOR)
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final StorageProvider storageProvider;

    // Iniezione delle dipendenze per orchestrare sicurezza (Service) e I/O (Provider)
    public AttachmentController(AttachmentService attachmentService, StorageProvider storageProvider) {
        this.attachmentService = attachmentService;
        this.storageProvider = storageProvider;
    }

    /**
     * Recupera un allegato dal database e lo restituisce come risposta HTTP. *
     * @param fileId L'ID dell'allegato nel database PostgreSQL.
     * @return Il file binario incapsulato in una ResponseEntity.
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {

        // 1. Il Service recupera l'URL dal DB (qui dentro c'è o ci sarà il controllo dei permessi dell'utente)
        String fileUrl = attachmentService.getFileUrl(fileId);

        // 2. Lo Strategy Provider estrae il file fisico dal Docker Volume
        Resource resource = storageProvider.retrieve(fileUrl);

        // 3. Risoluzione dinamica del MIME Type per dire al browser come visualizzare il file
        String contentType = "application/octet-stream"; // Fallback di default
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (IOException e) {
            // Ignoriamo l'errore: se non riusciamo a leggere il MIME type, il browser farà semplicemente scaricare il file
        }

        // 4. Costruzione della risposta HTTP con gli header corretti per visualizzare l'immagine "inline" (nel browser)
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
