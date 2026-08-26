package com.bugboard26.core.issue_management.dto;

import java.time.LocalDateTime;

public record ProjectState(
        Long projectId,
        String name,
        String description,
        LocalDateTime lastModified
) {}
