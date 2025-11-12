package com.doc_app.booking.dto.request;

import com.doc_app.booking.constant.MessageKeys;
import com.doc_app.booking.validation.Base64ImageSize;
import com.doc_app.booking.validation.ValidPhoneNumber;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateDoctorRequest {
    // Personal Information
    @NotBlank(message = "{" + MessageKeys.FIRST_NAME_REQUIRED + "}")
    @Size(max = 100, message = "{" + MessageKeys.FIRST_NAME_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']+$", message = "{" + MessageKeys.FIRST_NAME_INVALID + "}")
    private String firstName;

    @NotBlank(message = "{" + MessageKeys.LAST_NAME_REQUIRED + "}")
    @Size(max = 100, message = "{" + MessageKeys.LAST_NAME_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.']+$", message = "{" + MessageKeys.LAST_NAME_INVALID + "}")
    private String lastName;

    @NotBlank(message = "{" + MessageKeys.EMAIL_REQUIRED + "}")
    @Email(message = "{" + MessageKeys.EMAIL_INVALID + "}")
    @Size(max = 200, message = "{" + MessageKeys.EMAIL_SIZE + "}")
    private String email;

    @NotBlank(message = "{" + MessageKeys.PHONE_REQUIRED + "}")
    @ValidPhoneNumber
    private String phoneNumber;

    // Professional Information
    @NotBlank(message = "{" + MessageKeys.SPECIALIZATION_REQUIRED + "}")
    @Size(max = 200, message = "{" + MessageKeys.SPECIALIZATION_SIZE + "}")
    @Pattern(regexp = "^[a-zA-Z\\s\\-.'&]+$", message = "{" + MessageKeys.SPECIALIZATION_INVALID + "}")
    private String specialization;

    @Size(max = 200, message = "{" + MessageKeys.DEPARTMENT_SIZE + "}")
    @Pattern(regexp = "^$|^[a-zA-Z\\s\\-.'&]+$", message = "{" + MessageKeys.DEPARTMENT_INVALID + "}")
    private String department;

    @Min(value = 0, message = "{" + MessageKeys.EXPERIENCE_NEGATIVE + "}")
    @Max(value = 70, message = "{" + MessageKeys.EXPERIENCE_MAX + "}")
    private Integer experienceYears;

    @Size(max = 1000, message = "{" + MessageKeys.QUALIFICATIONS_SIZE + "}")
    private String qualifications;

    // Profile Image (base64 encoded)
    @Base64ImageSize(maxSizeInBytes = 3145728, message = "{" + MessageKeys.IMAGE_SIZE + "}")
    private String profileImage;

    @Size(max = 100, message = "{" + MessageKeys.IMAGE_TYPE_SIZE + "}")
    @Pattern(regexp = "^$|^image/(jpeg|jpg|png|gif|bmp|webp)$", message = "{" + MessageKeys.IMAGE_TYPE_INVALID + "}")
    private String imageContentType;

    // Hospital Assignment
    @NotNull(message = "{" + MessageKeys.HOSPITAL_ID_REQUIRED + "}")
    @Positive(message = "{" + MessageKeys.HOSPITAL_ID_POSITIVE + "}")
    private Long hospitalId;
}
