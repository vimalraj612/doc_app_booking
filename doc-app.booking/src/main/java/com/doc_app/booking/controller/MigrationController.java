package com.doc_app.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

@RestController
@RequestMapping("/api/v1/admin")
public class MigrationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/fix-foreign-key")
    public ResponseEntity<String> fixForeignKeyConstraint() {
        try {
            // Drop the incorrect constraint that references 'doctor' table
            jdbcTemplate.execute("ALTER TABLE appointments DROP CONSTRAINT IF EXISTS fkgpgce3qtc5fajyl4j5srcjkcf");
            
            // Add the correct constraint that references 'doctors' table
            jdbcTemplate.execute("ALTER TABLE appointments ADD CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)");
            
            return ResponseEntity.ok("Foreign key constraint fixed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fixing constraint: " + e.getMessage());
        }
    }

    @GetMapping("/check-constraints")
    public ResponseEntity<String> checkConstraints() {
        try {
            String query = "SELECT conname, conrelid::regclass, confrelid::regclass " +
                          "FROM pg_constraint " + 
                          "WHERE conname LIKE '%fk%' AND conrelid::regclass::text = 'appointments'";
            
            StringBuilder result = new StringBuilder("Appointment table constraints:\n");
            jdbcTemplate.query(query, (rs) -> {
                result.append(String.format("Constraint: %s, Table: %s, References: %s\n", 
                    rs.getString("conname"),
                    rs.getString("conrelid"),
                    rs.getString("confrelid")));
            });
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error checking constraints: " + e.getMessage());
        }
    }
}