package com.bugboard26.core.attachment.exception;

/** Segnala un allegato più grande del limite configurato. */
public class FileSizeExceededException extends RuntimeException {
    public FileSizeExceededException(String message) {
        super(message);
    }
}
