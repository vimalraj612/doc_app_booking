package com.doc_app.booking.dto.request;

import lombok.Data;

@Data
public class CreateHospitalRequest {
    private String name;
    private String address;
    private String phoneNumber;
    private String email;
    private String website;
}