package com.doc_app.booking.dto.request;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Past;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdatePatientRelationRequest {
    @Size(max = 200)
    private String fullName;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 20)
    private String gender;

    @Size(max = 50)
    private String relationship;
}
