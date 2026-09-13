package com.bugboard26.core.shared.dto;

import java.time.LocalDateTime;

public record ProjectState(
        Long id,
        String name,
        String description,
        LocalDateTime lastModified
) {}
