package com.bugboard26.auth.exception;

/** Segnala il tentativo di registrare un indirizzo email già utilizzato. */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
