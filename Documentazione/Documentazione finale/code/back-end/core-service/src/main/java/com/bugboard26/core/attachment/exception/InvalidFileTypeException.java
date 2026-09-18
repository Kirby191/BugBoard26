package com.bugboard26.core.attachment.exception;

/** Segnala un formato di file non consentito dal servizio. */
public class InvalidFileTypeException extends RuntimeException {
    public InvalidFileTypeException(String message) {
        super(message);
    }
}
