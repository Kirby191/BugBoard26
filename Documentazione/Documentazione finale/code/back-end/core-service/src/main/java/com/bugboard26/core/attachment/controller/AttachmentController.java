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

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final StorageProvider storageProvider;

    public AttachmentController(StorageProvider storageProvider) {
        this.storageProvider = storageProvider;
    }

    /**
     * Ascolta direttamente la richiesta dell'immagine tramite il suo nome univoco.
     * L'espressione regolare {:.+} serve a non far troncare le estensioni (.png, .jpg) da Spring.
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {

        // Ricostruisce l'URL esatto generato dal Provider
        String fileUrl = "/api/attachments/" + filename;
        Resource resource = storageProvider.retrieve(fileUrl);

        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (IOException e) {
            // Ignorato
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
