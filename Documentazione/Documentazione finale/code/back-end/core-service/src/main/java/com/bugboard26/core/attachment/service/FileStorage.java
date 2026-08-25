package com.bugboard26.core.attachment.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Interfaccia esposta verso l'Issue Management Subsystem.
 * Consente al modulo chiamante di richiedere il salvataggio di un allegato
 * rimanendo completamente disaccoppiato dalle implementazioni di storage fisiche.
 */
public interface FileStorage {

    /**
     * Gestisce la persistenza del file in ingresso e la creazione dei metadati.
     *
     * @param file L'oggetto MultipartFile ricevuto dal client REST.
     * @return L'URI o URL univoco (String) di puntamento alla risorsa salvata.
     */
    String storeFile(MultipartFile file);
}
