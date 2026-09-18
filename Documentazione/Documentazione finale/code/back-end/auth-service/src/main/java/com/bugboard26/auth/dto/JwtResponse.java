package com.bugboard26.auth.dto;

import com.bugboard26.auth.model.Role;

/**
 * DTO di risposta che contiene il Token JWT e le informazioni dell'utente.
 */
/** Contiene il token JWT e i dati minimi dell'utente autenticato. */
public record JwtResponse(
        String token,
        String type,
        Long id,
        String email,
        String username,
        Role role
) {}
