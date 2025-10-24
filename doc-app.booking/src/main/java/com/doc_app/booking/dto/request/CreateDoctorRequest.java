package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateDoctorRequest {
    // Personal Information
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']+$", message = "First name contains invalid characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']+$", message = "Last name contains invalid characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 200, message = "Email must not exceed 200 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]?[1-9]\\d{1,14}$", message = "Please provide a valid phone number")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    // Professional Information
    @NotBlank(message = "Specialization is required")
    @Size(max = 200, message = "Specialization must not exceed 200 characters")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.'&]+$", message = "Specialization contains invalid characters")
    private String specialization;

    @Size(max = 200, message = "Department must not exceed 200 characters")
    @Pattern(regexp = "^$|^[a-zA-Z\\s\\-.'&]+$", message = "Department contains invalid characters")
    private String department;

    @Min(value = 0, message = "Experience cannot be negative")
    @Max(value = 70, message = "Experience cannot exceed 70 years")
    private Integer experienceYears;

    @Size(max = 1000, message = "Qualifications must not exceed 1000 characters")
    private String qualifications;

    // Profile Image (base64 encoded)
    private String profileImageBase64;

    @Size(max = 100, message = "Image content type must not exceed 100 characters")
    @Pattern(regexp = "^$|^image/(jpeg|jpg|png|gif|bmp|webp)$", message = "Invalid image content type. Allowed: jpeg, jpg, png, gif, bmp, webp")
    private String imageContentType;

    // Hospital Assignment
    @NotNull(message = "Hospital ID is required")
    @Positive(message = "Hospital ID must be a positive number")
    private Long hospitalId;
}
