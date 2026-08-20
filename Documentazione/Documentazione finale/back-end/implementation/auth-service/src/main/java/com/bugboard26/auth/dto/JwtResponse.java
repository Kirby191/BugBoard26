package com.bugboard26.auth.dto;

import com.bugboard26.auth.model.Role;

/**
 * DTO di risposta che contiene il Token JWT e le informazioni dell'utente.
 */
public record JwtResponse(
        String token,
        Long id,
        String email,
        String username,
        Role role
) {}
