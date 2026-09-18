package com.bugboard26.core.attachment.exception;

/**
 * Eccezione custom lanciata dallo StorageProvider quando si verifica
 * un errore di I/O irreversibile (es. permessi negati, disco pieno o bucket S3 inaccessibile).
 */
/** Segnala un errore durante la lettura o la scrittura dello storage. */
public class StorageException extends RuntimeException {

    public StorageException(String message) {
        super(message);
    }

    /**
     * Costruttore che accetta anche la causa scatenante (Exception Chaining).
     */
    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
