package com.doc_app.booking.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientRelationDTO {
    private Long id;
    private Long patientId;
    private String fullName;
    private LocalDate dateOfBirth;
    private Integer age;
    private String phoneNumber;
    private String gender;
    private String relationship;
}
