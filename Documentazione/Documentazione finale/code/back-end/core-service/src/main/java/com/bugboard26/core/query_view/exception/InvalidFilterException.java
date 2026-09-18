package com.bugboard26.core.query_view.exception;

/** Segnala un filtro o un parametro di ordinamento non riconosciuto. */
public class InvalidFilterException extends RuntimeException {
    public InvalidFilterException(String message) {
        super(message);
    }
}
