package com.doc_app.booking.dto;

import lombok.Data;

@Data
public class PatientRelationDTO {
    private Long id;
    private Long patientId;
    private String fullName;
    private Integer age;
    private String phoneNumber;
    private String gender;
    private String relationship;
}
