package com.bugboard26.auth.dto;

import com.bugboard26.auth.model.Role;

/** Contiene il token JWT e i dati minimi dell'utente autenticato. */
public record JwtResponse(
        String token,
        String type,
        Long id,
        String email,
        String username,
        Role role
) {}
