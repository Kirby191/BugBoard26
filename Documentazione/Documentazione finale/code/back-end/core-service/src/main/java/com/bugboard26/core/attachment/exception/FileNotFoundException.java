package com.bugboard26.core.attachment.exception;

/** Segnala che l'allegato richiesto non è disponibile nello storage. */
public class FileNotFoundException extends RuntimeException {
    public FileNotFoundException(String message) {
        super(message);
    }
}
