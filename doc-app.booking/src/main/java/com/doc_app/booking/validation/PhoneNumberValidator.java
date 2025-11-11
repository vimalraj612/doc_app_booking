package com.doc_app.booking.validation;

import com.doc_app.booking.config.PhoneNumberProperties;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Component;

/**
 * Validator for phone numbers based on configurable country code and length.
 */
@Component
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private final PhoneNumberProperties phoneProperties;
    private boolean optional;
    private boolean allowWithoutCountryCode;

    public PhoneNumberValidator(PhoneNumberProperties phoneProperties) {
        this.phoneProperties = phoneProperties;
    }

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        this.optional = constraintAnnotation.optional();
        this.allowWithoutCountryCode = constraintAnnotation.allowWithoutCountryCode();
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        // If optional and null/empty, it's valid
        if (optional && (phoneNumber == null || phoneNumber.trim().isEmpty())) {
            return true;
        }

        // If not optional and null/empty, it's invalid
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Phone number is required")
                    .addConstraintViolation();
            return false;
        }

        String trimmedPhone = phoneNumber.trim();

        // Check if phone starts with country code
        String defaultCountryCode = phoneProperties.getDefaultCountryCode();
        boolean hasCountryCode = trimmedPhone.startsWith("+");

        if (!hasCountryCode && !allowWithoutCountryCode) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Phone number must start with country code (e.g., " + defaultCountryCode + ")")
                    .addConstraintViolation();
            return false;
        }

        // Validate format based on whether country code is present
        if (hasCountryCode) {
            // Format: +<country_code><number>
            // Example: +919876543210
            if (!trimmedPhone.matches("^\\+[1-9]\\d{" + phoneProperties.getMinLength() + "," + phoneProperties.getMaxLength() + "}$")) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                        String.format("Phone number with country code must be in format: +<code><number> with %d-%d total digits after +",
                                phoneProperties.getMinLength(), phoneProperties.getMaxLength()))
                        .addConstraintViolation();
                return false;
            }
        } else {
            // Format: <number> without country code
            // Example: 9876543210
            if (!trimmedPhone.matches("^[1-9]\\d{" + (phoneProperties.getMinLength() - 1) + "," + (phoneProperties.getMaxLength() - 1) + "}$")) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                        String.format("Phone number must be %d-%d digits",
                                phoneProperties.getMinLength(), phoneProperties.getMaxLength()))
                        .addConstraintViolation();
                return false;
            }
        }

        return true;
    }
}
