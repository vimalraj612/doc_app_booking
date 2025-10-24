package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateHospitalRequest {
    // Hospital Information
    @Size(max = 200, message = "Hospital name must not exceed 200 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-.'&]*$", message = "Hospital name contains invalid characters")
    private String name;

    @Size(max = 50, message = "Hospital type must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]*$", message = "Hospital type contains invalid characters")
    private String hospitalType;

    @Min(value = 1800, message = "Established year must be after 1800")
    @Max(value = 2100, message = "Established year cannot be in the future")
    private Integer establishedYear;

    @Min(value = 1, message = "Bed capacity must be at least 1")
    @Max(value = 10000, message = "Bed capacity cannot exceed 10,000")
    private Integer bedCapacity;

    @Size(max = 1000, message = "Hospital description must not exceed 1000 characters")
    private String description;

    // Contact Information
    @Email(message = "Please provide a valid email address")
    @Size(max = 200, message = "Email must not exceed 200 characters")
    private String email;

    @Pattern(regexp = "^$|^[+]?[1-9]\\d{1,14}$", message = "Please provide a valid phone number")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Pattern(regexp = "^$|^[+]?[1-9]\\d{1,14}$", message = "Please provide a valid alternate phone number")
    @Size(max = 20, message = "Alternate phone number must not exceed 20 characters")
    private String alternatePhone;

    @Pattern(regexp = "^$|^(https?://)?(www\\.)?[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.[a-zA-Z]{2,}(/.*)?$", 
             message = "Please provide a valid website URL")
    @Size(max = 200, message = "Website URL must not exceed 200 characters")
    private String website;

    // Address Information
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "City name contains invalid characters")
    private String city;

    @Size(max = 100, message = "State name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "State name contains invalid characters")
    private String state;

    @Pattern(regexp = "^[0-9]{5,10}$", message = "Please provide a valid zip code (5-10 digits)")
    private String zipCode;

    @Size(max = 100, message = "Country name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "Country name contains invalid characters")
    private String country;

    // Admin Information
    @Size(max = 100, message = "Admin first name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "Admin first name contains invalid characters")
    private String adminFirstName;

    @Size(max = 100, message = "Admin last name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "Admin last name contains invalid characters")
    private String adminLastName;

    @Email(message = "Please provide a valid admin email address")
    @Size(max = 200, message = "Admin email must not exceed 200 characters")
    private String adminEmail;

    @Pattern(regexp = "^[+]?[1-9]\\d{1,14}$", message = "Please provide a valid admin phone number")
    @Size(max = 20, message = "Admin phone number must not exceed 20 characters")
    private String adminPhone;

    // Services
    private Boolean emergencyServices;

    // Geo Location fields
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;
}