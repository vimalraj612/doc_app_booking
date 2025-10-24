package com.doc_app.booking.dto;

import lombok.Data;
import java.util.List;

@Data
public class DoctorDTO {
    private Long id;
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String name; // Computed field for backwards compatibility
    private String email;
    private String phoneNumber;
    
    // Professional Information
    private String specialization;
    private String department;
    private Integer experienceYears;
    private String qualifications;
    
    // Profile Image
    private byte[] profileImage;
    private String imageContentType;
    
    // Hospital Information
    private Long hospitalId;
    private String hospitalName;
    
    // Relationships
    private List<AppointmentDTO> appointments;
}
