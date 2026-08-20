package com.bugboard26.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO per la richiesta di Login.
 * Contiene le credenziali in chiaro inviate dal client.
 */
public record LoginRequest(
        @NotBlank(message = "L'email non può essere vuota")
        @Email(message = "Il formato dell'email non è valido")
        String email,

        @NotBlank(message = "La password non può essere vuota")
        String password
) {}
