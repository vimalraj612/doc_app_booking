package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePatientRelationRequest {
    @Size(max = 200)
    private String fullName;

    private Integer age;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 20)
    private String gender;

    @Size(max = 50)
    private String relationship;
}
