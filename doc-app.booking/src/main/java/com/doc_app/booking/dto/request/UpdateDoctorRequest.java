package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDoctorRequest {
    @Size(max = 200)
    private String name;

    @Size(max = 200)
    private String specialization;

    @Email
    @Size(max = 200)
    private String email;

    @Size(max = 30)
    private String phoneNumber;

    private Long hospitalId;
}