package com.bugboard26.core.shared.exception;

/** Segnala che la issue richiesta non esiste o non è visibile. */
public class IssueNotFoundException extends RuntimeException {
    public IssueNotFoundException(String message) {
        super(message);
    }
}
