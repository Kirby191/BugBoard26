package com.bugboard26.core.query_view.dto;

import com.bugboard26.core.issue_management.model.Enums.Role;

public record UserReference (
        Long id,
        String email,
        Role role
) {}
