package com.bugboard26.core.issue_management.exception;

/** Segnala un'operazione incompatibile con le regole del dominio delle issue. */
public class InvalidIssueDomainException extends RuntimeException {
    public InvalidIssueDomainException(String message) {
        super(message);
    }
}
