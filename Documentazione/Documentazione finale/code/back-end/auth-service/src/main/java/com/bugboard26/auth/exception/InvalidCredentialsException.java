package com.bugboard26.auth.exception;

/** Segnala credenziali non valide durante l'autenticazione. */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
