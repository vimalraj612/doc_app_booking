package com.doc_app.booking.exception;

import com.doc_app.booking.dto.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ApiResponse<Object> body = new ApiResponse<>(false, message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraint(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
        ApiResponse<Object> body = new ApiResponse<>(false, message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(SlotAlreadyBookedException.class)
    public ResponseEntity<ApiResponse<Object>> handleSlotAlreadyBooked(SlotAlreadyBookedException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handlePatientNotFound(PatientNotFoundException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleDoctorNotFound(DoctorNotFoundException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = "Data integrity violation. ";
        
        // Check for common constraint violations and provide user-friendly messages
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("foreign key constraint") && ex.getMessage().contains("doctor")) {
                message = "Invalid doctor ID. The specified doctor does not exist.";
            } else if (ex.getMessage().contains("foreign key constraint") && ex.getMessage().contains("patient")) {
                message = "Invalid patient ID. The specified patient does not exist.";
            } else if (ex.getMessage().contains("foreign key constraint") && ex.getMessage().contains("hospital")) {
                message = "Invalid hospital ID. The specified hospital does not exist.";
            } else if (ex.getMessage().contains("unique constraint") || ex.getMessage().contains("duplicate key")) {
                message = "Duplicate entry. This record already exists.";
            } else {
                message = "Invalid data provided. Please check your input and try again.";
            }
        }
        
        ApiResponse<Object> body = new ApiResponse<>(false, message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFound(EntityNotFoundException ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, ex.getMessage(), null);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAll(Exception ex) {
        ApiResponse<Object> body = new ApiResponse<>(false, "Internal server error", null);
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
