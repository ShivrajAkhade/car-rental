package com.rental.controller;

import com.rental.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ApiResponse.error(errorMessage));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String msg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (msg != null && (msg.contains("PHONE") || msg.contains("phone"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Phone number must be under 20 characters."));
        }
        if (msg != null && (msg.contains("EMAIL") || msg.contains("email"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email address is already in use."));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Database error: " + msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleAllExceptions(Exception ex) {
        return ResponseEntity.status(500).body(ApiResponse.error("An unexpected error occurred: " + ex.getMessage()));
    }
}
