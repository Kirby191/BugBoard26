package com.bugboard26.core.query_view.dto;

import java.time.LocalDateTime;

public record NotificationDTO (
        Long id,
        String message,
        LocalDateTime timestamp,
        boolean isRead
) {}
