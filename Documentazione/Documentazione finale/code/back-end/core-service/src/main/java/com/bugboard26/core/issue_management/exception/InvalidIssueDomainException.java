package com.bugboard26.core.issue_management.exception;

public class InvalidIssueDomainException extends RuntimeException {
    public InvalidIssueDomainException(String message) {
        super(message);
    }
}
