package com.doc_app.booking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = true)
    private String firstName;

    @Column(nullable = true)
    private String lastName;

    @Column(nullable = true, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    private String address;

    // Geo Location fields
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(nullable = true)
    private String dateOfBirth;

    @Column(nullable = true)
    private String gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_visited_doctor_id")
    private Doctor lastVisitedDoctor;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.doc_app.booking.model.PatientRelation> relations = new ArrayList<>();

    /**
     * Calculate age based on date of birth string (yyyy-MM-dd format expected)
     */
    public Integer calculateAge() {
        if (dateOfBirth == null || dateOfBirth.trim().isEmpty()) {
            return null;
        }
        try {
            LocalDate dob = LocalDate.parse(dateOfBirth, DateTimeFormatter.ISO_LOCAL_DATE);
            return Period.between(dob, LocalDate.now()).getYears();
        } catch (DateTimeParseException e) {
            // Try alternative formats like dd/MM/yyyy or dd-MM-yyyy
            try {
                DateTimeFormatter[] formatters = {
                    DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                    DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                    DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                    DateTimeFormatter.ofPattern("yyyy/MM/dd")
                };
                for (DateTimeFormatter formatter : formatters) {
                    try {
                        LocalDate dob = LocalDate.parse(dateOfBirth, formatter);
                        return Period.between(dob, LocalDate.now()).getYears();
                    } catch (DateTimeParseException ignored) {
                        // Continue to next format
                    }
                }
            } catch (Exception ignored) {
                // Ignore all parsing errors
            }
            return null;
        }
    }

    /**
     * Get current age (calculated from DOB string)
     */
    public Integer getCurrentAge() {
        return calculateAge();
    }
}