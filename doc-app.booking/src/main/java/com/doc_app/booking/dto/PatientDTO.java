package com.doc_app.booking.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PatientDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String dateOfBirth;
    private String gender;
    private DoctorDTO lastVisitedDoctor;
    private List<AppointmentDTO> appointments;
}
