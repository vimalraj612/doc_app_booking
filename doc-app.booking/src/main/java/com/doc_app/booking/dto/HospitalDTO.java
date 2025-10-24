package com.doc_app.booking.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class HospitalDTO {
    private Long id;
    
    // Hospital Information
    private String name;
    private String hospitalType;
    private Integer establishedYear;
    private Integer bedCapacity;
    private String description;
    
    // Contact Information
    private String phoneNumber;
    private String alternatePhone;
    private String email;
    private String website;
    
    // Address Information
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    // Admin Information
    private String adminFirstName;
    private String adminLastName;
    private String adminEmail;
    private String adminPhone;
    
    // Services
    private Boolean emergencyServices;
    
    // Geo Location
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // Relationships
    private List<DoctorDTO> doctors;
}