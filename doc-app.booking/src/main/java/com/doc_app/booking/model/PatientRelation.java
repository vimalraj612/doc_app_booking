package com.doc_app.booking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.Period;

@Data
@Entity
@Table(name = "patient_relations")
public class PatientRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(nullable = true)
    private String phoneNumber;

    private String gender;

    @Column(nullable = false)
    private String relationship;

    /**
     * Calculate age based on date of birth
     */
    public Integer calculateAge() {
        if (dateOfBirth == null) {
            return null;
        }
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    /**
     * Get current age (calculated from DOB)
     */
    public Integer getCurrentAge() {
        return calculateAge();
    }
}
