package com.doc_app.booking.dto.request;

import lombok.Data;

@Data
public class CreateDoctorRequest {
    private String name;
    private String specialization;
    private String email;
    private String phoneNumber;
    private Long hospitalId;
}
