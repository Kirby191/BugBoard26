package com.bugboard26.core.attachment.service;

/**
 * Interfaccia di servizio interna al sottosistema allegati.
 * Definisce i contratti per l'upload e il recupero degli URI dei file.
 */
public interface AttachmentService {

    String getFileUrl(Long fileId);

}