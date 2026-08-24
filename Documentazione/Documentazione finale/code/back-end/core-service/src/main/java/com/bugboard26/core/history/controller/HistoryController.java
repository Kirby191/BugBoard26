package com.bugboard26.core.history.controller;

import com.bugboard26.core.history.dto.BugHistory;
import com.bugboard26.core.history.service.HistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST per il sottosistema History.
 * Espone gli endpoint in sola lettura per la consultazione
 * della cronologia immutabile dei bug (Funzionalità 12).
 */
@RestController
@RequestMapping("/api/issues")
public class HistoryController {

    private final HistoryService historyService;

    // Iniezione delle dipendenze tramite costruttore
    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    /**
     * Endpoint per il recupero dello storico completo di un singolo bug.
     * Risponde a GET /api/issues/{bugId}/history
     *
     * @param bugId L'ID della segnalazione (che deve essere un BUG)
     * @return Una lista di eventi storici mappati in BugHistory
     */
    @GetMapping("/{bugId}/history")
    public ResponseEntity<List<BugHistory>> getBugHistory(@PathVariable Long bugId) {

        // Delega al service l'estrazione e la mappatura dei dati
        List<BugHistory> history = historyService.getHistoryForBug(bugId);

        return ResponseEntity.ok(history);
    }
}
