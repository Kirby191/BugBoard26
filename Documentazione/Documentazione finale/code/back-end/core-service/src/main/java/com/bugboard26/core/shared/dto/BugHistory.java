package com.bugboard26.core.shared.dto;

import java.time.LocalDateTime;

public record BugHistory(
    Long id,
    Long bugId,
    String authorEmail,
    String action,
    String details,
    LocalDateTime timestamp
) {}
