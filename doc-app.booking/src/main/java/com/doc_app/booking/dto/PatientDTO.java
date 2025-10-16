package com.doc_app.booking.dto;

import lombok.Data;
import java.util.List;

@Data
public class PatientDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String dateOfBirth;
    private String gender;
    private List<AppointmentDTO> appointments;
}
