package com.bugboard26.core.issue_management.exception;

/** Segnala un'azione negata dai permessi dell'utente corrente. */
public class UnauthorizedActionException extends RuntimeException {
    public UnauthorizedActionException(String message) {
        super(message);
    }

    public UnauthorizedActionException(String message, Throwable cause) {
        super(message, cause);
    }
}
