package com.bugboard26.core.shared.exception;

/** Segnala che il progetto richiesto non esiste. */
public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(String message) {
        super(message);
    }
}
