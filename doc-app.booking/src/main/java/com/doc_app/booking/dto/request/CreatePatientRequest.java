package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePatientRequest {
    @Size(max = 100, message = "{" + MessageKeys.FIRST_NAME_SIZE + "}")
    private String firstName;

    @Size(max = 100, message = "{" + MessageKeys.LAST_NAME_SIZE + "}")
    private String lastName;

    @Email(message = "{" + MessageKeys.EMAIL_INVALID + "}")
    @Size(max = 200, message = "{" + MessageKeys.EMAIL_SIZE + "}")
    private String email;

    @NotBlank(message = "{" + MessageKeys.PHONE_REQUIRED + "}")
    @ValidPhoneNumber
    private String phoneNumber;

    @Size(max = 500, message = "{" + MessageKeys.ADDRESS_SIZE + "}")
    private String address;

    // ISO date string expected (yyyy-MM-dd) - optional but size limited
    @Size(max = 10, message = "{" + MessageKeys.DATE_SIZE + "}")
    private String dateOfBirth;

    @Size(max = 20, message = "{" + MessageKeys.GENDER_SIZE + "}")
    private String gender;

    // Geo Location fields
    @DecimalMin(value = "-90.0", message = "{" + MessageKeys.LATITUDE_RANGE + "}")
    @DecimalMax(value = "90.0", message = "{" + MessageKeys.LATITUDE_RANGE + "}")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "{" + MessageKeys.LONGITUDE_RANGE + "}")
    @DecimalMax(value = "180.0", message = "{" + MessageKeys.LONGITUDE_RANGE + "}")
    private BigDecimal longitude;
}