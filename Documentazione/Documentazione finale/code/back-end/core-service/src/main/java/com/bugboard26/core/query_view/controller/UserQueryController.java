package com.bugboard26.core.query_view.controller;

import com.bugboard26.core.query_view.dto.UserReferenceDTO;
import com.bugboard26.core.query_view.service.UserQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST in sola lettura per le anagrafiche utente.
 * Espone i dati strettamente necessari alle assegnazioni e ai filtri.
 */
@RestController
@RequestMapping("/api/users")
public class UserQueryController {

    private final UserQueryService userQueryService;

    public UserQueryController(UserQueryService userQueryService) {
        this.userQueryService = userQueryService;
    }

    /**
     * Eroga la lista degli utenti registrati nel sistema.
     * Indispensabile per le funzionalità di Assegnazione Bug (F.4) e Filtraggio (F.3).
     * Risponde a GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<UserReferenceDTO>> getUsers() {
        List<UserReferenceDTO> users = userQueryService.getUsers();
        return ResponseEntity.ok(users);
    }
}
