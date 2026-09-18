package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.DashboardStats;

/**
 * Interfaccia di servizio per l'aggregazione dei dati della Dashboard (Query Layer).
 */
public interface DashboardService {

    /**
     * Calcola le metriche e le statistiche per la dashboard.
     * Il contesto dell'utente (ID e ruolo Admin/Utente) viene recuperato in modo sicuro
     * internamente tramite l'AuthenticatedUserProvider
     *
     * @return DTO contenente i contatori e le statistiche aggiornate.
     */
    DashboardStats getDashboardStats();

}
