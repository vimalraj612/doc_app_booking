package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDoctorRequest {
    @NotBlank
    @Size(max = 200)
    private String name;

    @NotBlank
    @Size(max = 200)
    private String specialization;

    @Email
    @Size(max = 200)
    private String email;

    @Size(max = 30)
    @NotBlank
    private String phoneNumber;

    @NotNull
    @Positive
    private Long hospitalId;
}
