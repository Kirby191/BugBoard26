package com.bugboard26.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Dati inviati dal client per autenticare un utente. */
public record LoginRequest(
        @NotBlank(message = "L'email non può essere vuota")
        @Email(message = "Il formato dell'email non è valido")
        String email,

        @NotBlank(message = "La password non può essere vuota")
        String password
) {}
