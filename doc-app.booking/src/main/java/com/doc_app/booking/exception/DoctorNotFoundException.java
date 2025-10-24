package com.doc_app.booking.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class DoctorNotFoundException extends RuntimeException {
    
    public DoctorNotFoundException(Long doctorId) {
        super("Doctor not found with ID: " + doctorId);
    }
    
    public DoctorNotFoundException(String message) {
        super(message);
    }
    
    public DoctorNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}