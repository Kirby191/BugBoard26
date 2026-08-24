package com.bugboard26.core.history.dto;

import java.time.LocalDateTime;
import com.bugboard26.core.history.model.AuditAction;

public record BugHistory(
    Long id,
    Long bugId,
    LocalDateTime timestamp,
    AuditAction action,
    String authorEmail,
    String details
) {}
