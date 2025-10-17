package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateHospitalRequest {
    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 500)
    private String address;

    @Size(max = 30)
    private String phoneNumber;

    @Email
    @Size(max = 200)
    private String email;

    @Size(max = 200)
    private String website;
}