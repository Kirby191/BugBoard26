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
     * @param issueId
     * @param file    L'oggetto MultipartFile ricevuto dal client REST.
     * @return L'URI o URL univoco (String) di puntamento alla risorsa salvata.
     */
    /*
     * TODO: Ricordarsi di aggiornare la documentazione per specificare la modifica data dall'implementazione
     *  reale nel database.
     */
    String storeFile(Long issueId, MultipartFile file);
}
