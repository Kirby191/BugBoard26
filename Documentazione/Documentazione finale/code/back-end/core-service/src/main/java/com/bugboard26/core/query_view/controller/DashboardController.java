package com.bugboard26.core.query_view.controller;

import com.bugboard26.core.query_view.dto.DashboardStats;
import com.bugboard26.core.query_view.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST per l'erogazione delle metriche della Dashboard.
 * Applica segmentazione automatica basata sul token JWT.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Recupera le statistiche e i contatori aggregati per la Dashboard.
     * Risponde a GET /api/dashboard/stats
     * L'identità dell'utente e il suo ruolo sono derivati lato server dal JWT.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
