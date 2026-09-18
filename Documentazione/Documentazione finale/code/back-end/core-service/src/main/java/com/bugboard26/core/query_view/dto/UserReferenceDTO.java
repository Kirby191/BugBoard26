package com.bugboard26.core.query_view.dto;

import com.bugboard26.core.issue_management.model.enums.Role;

/** Rappresentazione pubblica e minimale di un utente. */
public record UserReferenceDTO(
        Long id,
        String email,
        Role role
) {}
