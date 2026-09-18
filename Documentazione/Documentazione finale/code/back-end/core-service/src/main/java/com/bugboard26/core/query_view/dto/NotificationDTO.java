package com.bugboard26.core.query_view.dto;

import java.time.LocalDateTime;

/** Dati di una notifica destinata al client. */
public record NotificationDTO (
        Long id,
        String message,
        LocalDateTime timestamp,
        boolean isRead
) {}
