package com.doc_app.booking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "hospitals")
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hospital Information
    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 50)
    private String hospitalType;

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(name = "bed_capacity")
    private Integer bedCapacity;

    @Column(length = 1000)
    private String description;

    // Contact Information
    @NotNull
    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(length = 200)
    private String website;

    // Address Information
    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "zip_code", nullable = false, length = 10)
    private String zipCode;

    @Column(nullable = false, length = 100)
    private String country;

    // Admin Information
    @Column(name = "admin_first_name", nullable = false, length = 100)
    private String adminFirstName;

    @Column(name = "admin_last_name", length = 100)
    private String adminLastName;

    @Column(name = "admin_email", nullable = false, length = 200)
    private String adminEmail;

    @Column(name = "admin_phone", nullable = false, length = 20)
    private String adminPhone;

    // Services
    @Column(name = "emergency_services", nullable = false)
    private Boolean emergencyServices = false;

    // Geo Location fields
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    // Relationships
    @OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL)
    private List<Doctor> doctors = new ArrayList<>();

}