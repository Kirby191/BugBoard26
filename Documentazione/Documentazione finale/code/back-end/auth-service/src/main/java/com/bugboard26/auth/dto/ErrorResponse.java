package com.bugboard26.auth.dto;

import java.time.LocalDateTime;

/** Rappresenta il formato uniforme degli errori restituiti dal servizio di autenticazione. */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message
) {}
