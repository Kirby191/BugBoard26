package com.bugboard26.auth.dto;

import com.bugboard26.auth.model.Role;
import java.time.LocalDateTime;

/** Rappresenta i dati pubblici restituiti dopo la registrazione di un utente. */
public record UserResponse(
        Long id,
        String email,
        String username,
        Role role,
        LocalDateTime createdAt
) {}