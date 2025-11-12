package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePatientRequest {
    @Size(max = 100, message = "{" + MessageKeys.FIRST_NAME_SIZE + "}")
    private String firstName;

    @Size(max = 100, message = "{" + MessageKeys.LAST_NAME_SIZE + "}")
    private String lastName;

    @Email(message = "{" + MessageKeys.EMAIL_INVALID + "}")
    @Size(max = 200, message = "{" + MessageKeys.EMAIL_SIZE + "}")
    private String email;

    @ValidPhoneNumber(optional = true)
    private String phoneNumber;

    @Size(max = 500, message = "{" + MessageKeys.ADDRESS_SIZE + "}")
    private String address;

    @Size(max = 10, message = "{" + MessageKeys.DATE_SIZE + "}")
    private String dateOfBirth;

    @Size(max = 20, message = "{" + MessageKeys.GENDER_SIZE + "}")
    private String gender;
}