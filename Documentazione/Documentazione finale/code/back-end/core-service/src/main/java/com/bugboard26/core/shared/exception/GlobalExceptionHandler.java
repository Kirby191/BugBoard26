package com.bugboard26.core.shared.exception;

import com.bugboard26.core.shared.dto.ErrorResponse;

// Import History
import com.bugboard26.core.history.exception.HistoryNotFoundException;

// Import Issue Management
import com.bugboard26.core.issue_management.exception.DuplicateProjectException;
import com.bugboard26.core.issue_management.exception.InvalidIssueDomainException;
import com.bugboard26.core.issue_management.exception.UnauthorizedActionException;

// Import Attachment
import com.bugboard26.core.attachment.exception.FileNotFoundException;
import com.bugboard26.core.attachment.exception.FileSizeExceededException;
import com.bugboard26.core.attachment.exception.InvalidFileTypeException;
import com.bugboard26.core.attachment.exception.StorageException;
import com.bugboard26.core.attachment.exception.UnauthorizedFileAccessException;

// Import Query & View
import com.bugboard26.core.query_view.exception.InvalidFilterException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.ZoneId;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // -------------------------------------------------------------------------
    // --- ERROR CODES ---
    // -------------------------------------------------------------------------
    private static final String ERR_HISTORY_NOT_FOUND = "HISTORY_NOT_FOUND";
    private static final String ERR_STORAGE = "STORAGE_ERROR";

// -------------------------------------------------------------------------
    // --- GENERIC ---
    // -------------------------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Si è verificato un errore inaspettato sul server: " + ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // --- ISSUE MANAGEMENT ---
    // -------------------------------------------------------------------------

    @ExceptionHandler({
            IssueNotFoundException.class,
            ProjectNotFoundException.class,
            UserNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleIssueManagementNotFound(RuntimeException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidIssueDomainException.class)
    public ResponseEntity<ErrorResponse> handleInvalidIssueDomain(InvalidIssueDomainException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAction(UnauthorizedActionException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(DuplicateProjectException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateProject(DuplicateProjectException ex) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // --- HISTORY ---
    // -------------------------------------------------------------------------

    @ExceptionHandler(HistoryNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleHistoryNotFound(HistoryNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ERR_HISTORY_NOT_FOUND, ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // --- ATTACHMENT ---
    // -------------------------------------------------------------------------

    @ExceptionHandler({
            FileSizeExceededException.class,
            InvalidFileTypeException.class
    })
    public ResponseEntity<ErrorResponse> handleAttachmentBadRequest(RuntimeException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleFileNotFound(FileNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedFileAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedFileAccess(UnauthorizedFileAccessException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ErrorResponse> handleStorageException(StorageException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ERR_STORAGE, ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // --- QUERY & VIEW ---
    // -------------------------------------------------------------------------

    @ExceptionHandler(InvalidFilterException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFilter(InvalidFilterException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // -------------------------------------------------------------------------
    // UTILITY METHODS (Overloaded)
    // -------------------------------------------------------------------------

    /**
     * Usa in automatico il nome dello stato HTTP
     */
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message) {
        return buildResponse(status, status.name(), message);
    }

    /**
     * Permette di iniettare un codice di errore custom
     */
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String customErrorCode, String message) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(ZoneId.systemDefault()),
                status.value(),
                customErrorCode,
                message
        );
        return new ResponseEntity<>(errorResponse, status);
    }
}