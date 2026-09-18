package com.bugboard26.core.issue_management.exception;

/** Segnala un conflitto con il nome già assegnato a un altro progetto. */
public class DuplicateProjectException extends RuntimeException {
    public DuplicateProjectException(String message) {
        super(message);
    }
}
