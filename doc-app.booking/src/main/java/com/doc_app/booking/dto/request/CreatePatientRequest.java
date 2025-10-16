package com.doc_app.booking.dto.request;

import lombok.Data;

@Data
public class CreatePatientRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String dateOfBirth;
    private String gender;
}