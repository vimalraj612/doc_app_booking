package com.doc_app.booking.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PatientNotFoundException extends RuntimeException {
    
    public PatientNotFoundException(String phoneNumber) {
        super("Patient not found with phone number: " + phoneNumber);
    }
    
    public PatientNotFoundException(String phoneNumber, Throwable cause) {
        super("Patient not found with phone number: " + phoneNumber, cause);
    }
    
    public PatientNotFoundException(Long patientId) {
        super("Patient not found with ID: " + patientId);
    }
}