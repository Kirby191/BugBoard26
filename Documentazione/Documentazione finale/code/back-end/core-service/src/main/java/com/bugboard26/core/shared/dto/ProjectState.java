package com.bugboard26.core.shared.dto;

import java.time.LocalDateTime;

/** Stato pubblico di un progetto dopo un'operazione di scrittura. */
public record ProjectState(
        Long id,
        String name,
        String description,
        LocalDateTime lastModified
) {}
