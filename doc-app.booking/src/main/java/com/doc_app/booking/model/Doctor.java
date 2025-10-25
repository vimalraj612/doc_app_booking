package com.doc_app.booking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Information
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = false, length = 200)
    private String email;

    @NotNull
    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String contact;

    // Professional Information
    @Column(nullable = false, length = 200)
    private String specialization;

    @Column(length = 200)
    private String department;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(length = 1000)
    private String qualifications;

    // Profile Image
    @Lob
    @Column(name = "profile_image")
    private byte[] profileImage;

    @Column(name = "image_content_type", length = 100)
    private String imageContentType;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointments;

    // Computed field for backwards compatibility
    @Transient
    public String getName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        return firstName != null ? firstName : lastName;
    }
}