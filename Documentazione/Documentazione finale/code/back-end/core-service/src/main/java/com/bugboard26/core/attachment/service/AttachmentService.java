package com.bugboard26.core.attachment.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Interfaccia di servizio interna al sottosistema allegati.
 * Definisce i contratti per l'upload e il recupero degli URI dei file.
 */
public interface AttachmentService {

    String uploadImage(MultipartFile file);

    String getFileUrl(Long fileId);

}