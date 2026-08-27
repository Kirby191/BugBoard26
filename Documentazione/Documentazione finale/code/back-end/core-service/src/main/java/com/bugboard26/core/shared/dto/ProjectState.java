package com.bugboard26.core.shared.dto;

import java.time.LocalDateTime;

public record ProjectState(
        Long projectId,
        String name,
        String description,
        LocalDateTime lastModified
) {}
