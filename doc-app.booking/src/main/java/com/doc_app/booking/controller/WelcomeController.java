package com.doc_app.booking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Doctor Appointment Booking API");
        response.put("version", "1.0.0");
        response.put("status", "running");
        response.put("documentation", "http://localhost:8080/swagger-ui.html");
        response.put("endpoints", Map.of(
            "swagger", "/swagger-ui.html",
            "api-docs", "/v3/api-docs",
            "auth", "/api/v1/auth",
            "patients", "/api/v1/patients",
            "doctors", "/api/v1/doctors", 
            "hospitals", "/api/v1/hospitals",
            "appointments", "/api/v1/appointments",
            "health", "/actuator/health"
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}