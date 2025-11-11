package com.doc_app.booking.dto.request;

import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePatientRequest {
    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Email
    @Size(max = 200)
    private String email;

    @ValidPhoneNumber(optional = true)
    private String phoneNumber;

    @Size(max = 500)
    private String address;

    @Size(max = 10)
    private String dateOfBirth;

    @Size(max = 20)
    private String gender;
}