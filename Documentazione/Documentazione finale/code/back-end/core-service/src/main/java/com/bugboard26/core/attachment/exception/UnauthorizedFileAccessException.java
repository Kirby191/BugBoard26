package com.bugboard26.core.attachment.exception;

/** Segnala un tentativo di uscire dalla directory autorizzata degli allegati. */
public class UnauthorizedFileAccessException extends RuntimeException {
    public UnauthorizedFileAccessException(String message) {
        super(message);
    }
}
