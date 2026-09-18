package com.bugboard26.core.shared.dto;

import java.time.LocalDateTime;

/**
 * DTO per la formattazione standardizzata degli errori REST.
 */
/** Formato uniforme degli errori restituiti dal core service. */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message
) {}
