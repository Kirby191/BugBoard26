package com.bugboard26.auth.dto;

import java.time.LocalDateTime;

/**
 * DTO per la formattazione standardizzata degli errori REST.
 */
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message
) {}
