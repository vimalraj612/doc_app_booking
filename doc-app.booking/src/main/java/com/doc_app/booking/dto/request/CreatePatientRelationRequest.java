package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePatientRelationRequest {
    @NotBlank
    @Size(max = 200)
    private String fullName;

    private Integer age;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 20)
    private String gender;

    @NotBlank
    @Size(max = 50)
    private String relationship;
}
