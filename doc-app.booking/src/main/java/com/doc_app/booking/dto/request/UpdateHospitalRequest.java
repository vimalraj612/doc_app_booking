package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateHospitalRequest {
    // Hospital Information
    @Size(max = 200, message = "{" + MessageKeys.HOSPITAL_NAME_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-.'&]*$", message = "{" + MessageKeys.HOSPITAL_NAME_INVALID + "}")
    private String name;

    @Size(max = 50, message = "{" + MessageKeys.HOSPITAL_TYPE_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-]*$", message = "{" + MessageKeys.HOSPITAL_TYPE_INVALID + "}")
    private String hospitalType;

    @Min(value = 1800, message = "{" + MessageKeys.ESTABLISHED_YEAR_MIN + "}")
    @Max(value = 2100, message = "{" + MessageKeys.ESTABLISHED_YEAR_MAX + "}")
    private Integer establishedYear;

    @Min(value = 1, message = "{" + MessageKeys.BED_CAPACITY_MIN + "}")
    @Max(value = 10000, message = "{" + MessageKeys.BED_CAPACITY_MAX + "}")
    private Integer bedCapacity;

    @Size(max = 1000, message = "{" + MessageKeys.DESCRIPTION_SIZE + "}")
    private String description;

    // Contact Information
    @Email(message = "{" + MessageKeys.EMAIL_INVALID + "}")
    @Size(max = 200, message = "{" + MessageKeys.EMAIL_SIZE + "}")
    private String email;

    @ValidPhoneNumber(optional = true)
    private String phoneNumber;

    @ValidPhoneNumber(optional = true)
    private String alternatePhone;

    @Pattern(regexp = "^$|^(https?://)?(www\\.)?[a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.[a-zA-Z]{2,}(/.*)?$", 
             message = "{" + MessageKeys.WEBSITE_INVALID + "}")
    @Size(max = 200, message = "{" + MessageKeys.WEBSITE_SIZE + "}")
    private String website;

    // Address Information
    @Size(max = 500, message = "{" + MessageKeys.ADDRESS_SIZE + "}")
    private String address;

    @Size(max = 100, message = "{" + MessageKeys.CITY_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "{" + MessageKeys.CITY_INVALID + "}")
    private String city;

    @Size(max = 100, message = "{" + MessageKeys.STATE_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "{" + MessageKeys.STATE_INVALID + "}")
    private String state;

    @Pattern(regexp = "^[0-9]{5,10}$", message = "{" + MessageKeys.ZIP_CODE_INVALID + "}")
    private String zipCode;

    @Size(max = 100, message = "{" + MessageKeys.COUNTRY_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "{" + MessageKeys.COUNTRY_INVALID + "}")
    private String country;

    // Admin Information
    @Size(max = 100, message = "{" + MessageKeys.ADMIN_FIRST_NAME_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "{" + MessageKeys.ADMIN_FIRST_NAME_INVALID + "}")
    private String adminFirstName;

    @Size(max = 100, message = "{" + MessageKeys.ADMIN_LAST_NAME_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']*$", message = "{" + MessageKeys.ADMIN_LAST_NAME_INVALID + "}")
    private String adminLastName;

    @Email(message = "{" + MessageKeys.EMAIL_INVALID + "}")
    @Size(max = 200, message = "{" + MessageKeys.EMAIL_SIZE + "}")
    private String adminEmail;

    @ValidPhoneNumber(optional = true)
    private String adminPhone;

    // Services
    private Boolean emergencyServices;

    // Geo Location fields
    @DecimalMin(value = "-90.0", message = "{" + MessageKeys.LATITUDE_RANGE + "}")
    @DecimalMax(value = "90.0", message = "{" + MessageKeys.LATITUDE_RANGE + "}")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "{" + MessageKeys.LONGITUDE_RANGE + "}")
    @DecimalMax(value = "180.0", message = "{" + MessageKeys.LONGITUDE_RANGE + "}")
    private BigDecimal longitude;
}