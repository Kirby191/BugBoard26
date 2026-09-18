package com.bugboard26.core.shared.exception;

/** Segnala che l'utente richiesto non esiste. */
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
