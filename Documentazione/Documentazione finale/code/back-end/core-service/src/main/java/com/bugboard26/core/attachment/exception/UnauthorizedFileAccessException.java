package com.bugboard26.core.attachment.exception;

public class UnauthorizedFileAccessException extends RuntimeException {
    public UnauthorizedFileAccessException(String message) {
        super(message);
    }
}
