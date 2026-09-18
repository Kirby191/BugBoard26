package com.bugboard26.core.history.exception;

/** Segnala l'assenza della cronologia richiesta. */
public class HistoryNotFoundException extends RuntimeException {
    public HistoryNotFoundException(String message) {
        super(message);
    }
}
