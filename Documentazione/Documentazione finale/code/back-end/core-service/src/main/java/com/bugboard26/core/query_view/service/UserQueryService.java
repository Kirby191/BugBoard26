package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.UserReference;

import java.util.List;

/**
 * Interfaccia di servizio in sola lettura per l'estrazione degli utenti.
 */
public interface UserQueryService {

    /**
     * Recupera la lista di tutti gli utenti registrati per popolare
     * i menu a tendina (dropdown) sul front-end Angular.
     *
     * @return Lista di DTO degli utenti in sola lettura.
     */
    List<UserReference> getUsers();

}
