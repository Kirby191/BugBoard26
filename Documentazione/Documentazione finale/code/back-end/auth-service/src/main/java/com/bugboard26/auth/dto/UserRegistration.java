package com.bugboard26.auth.dto;

import com.bugboard26.auth.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO per la registrazione di un nuovo utente.
 * Mappa la Funzionalità 1 (Creazione Utenze e Ruoli).
 */
public record UserRegistration(
        @NotBlank(message = "L'email non può essere vuota")
        @Email(message = "Il formato dell'email non è valido")
        String email,

        @NotBlank(message = "La password non può essere vuota")
        @Size(min = 8, message = "La password deve contenere almeno 8 caratteri")
        String password,

        @NotBlank(message = "Lo username non può essere vuoto")
        @Size(max = 50, message = "Lo username non può superare i 50 caratteri")
        String username,

        @NotNull(message = "Il ruolo è obbligatorio")
        Role role
) {}
