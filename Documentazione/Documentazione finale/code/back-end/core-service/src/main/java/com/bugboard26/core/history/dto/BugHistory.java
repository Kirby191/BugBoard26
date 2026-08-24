package com.bugboard26.core.history.dto;

import java.time.LocalDateTime;
import com.bugboard26.core.history.model.AuditAction;

public record BugHistory(
    Long id,
    Long bugId,
    String authorEmail,
    AuditAction action,
    String details,
    LocalDateTime timestamp
) {}
