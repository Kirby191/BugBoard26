package com.bugboard26.core.issue_management.service;

import com.bugboard26.core.issue_management.dto.AssignBug;
import com.bugboard26.core.issue_management.dto.IssueResponse;

/**
 * Interfaccia di servizio per l'assegnazione dei task (Command Layer).
 * Segrega la responsabilità di assegnazione dalle normali operazioni CRUD.
 */
public interface AssignBugService {

    /**
     * Assegna un bug a un nuovo assegnatario.
     * @param id L'ID del bug da assegnare.
     * @param request DTO contenente l'ID del nuovo assegnatario.
     * @return DTO contenente lo stato aggiornato della segnalazione.
     */
    IssueResponse assignBug(Long id, AssignBug request);

}
