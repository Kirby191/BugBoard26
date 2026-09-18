package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.UserReferenceDTO;

import java.util.List;

/**
 * Interfaccia di servizio in sola lettura per l'estrazione degli utenti.
 */
/** Espone le letture degli utenti necessarie al core service. */
public interface UserQueryService {

    /**
     * Recupera la lista di tutti gli utenti registrati nel sistema, mappati in DTO di sola lettura.
     *
     * @return Lista di DTO degli utenti in sola lettura.
     */
    List<UserReferenceDTO> getUsers();

}
