package com.doc_app.booking.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator implementation for Base64ImageSize annotation
 * Calculates the actual decoded image size from base64 string
 */
public class Base64ImageSizeValidator implements ConstraintValidator<Base64ImageSize, String> {

    private long maxSizeInBytes;

    @Override
    public void initialize(Base64ImageSize constraintAnnotation) {
        this.maxSizeInBytes = constraintAnnotation.maxSizeInBytes();
    }

    @Override
    public boolean isValid(String base64Image, ConstraintValidatorContext context) {
        // Null or empty strings are considered valid (use @NotNull/@NotBlank for required validation)
        if (base64Image == null || base64Image.trim().isEmpty()) {
            return true;
        }

        try {
            // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            String cleanBase64 = base64Image;
            if (base64Image.startsWith("data:")) {
                int commaIndex = base64Image.indexOf(',');
                if (commaIndex > 0) {
                    cleanBase64 = base64Image.substring(commaIndex + 1);
                }
            }

            // Calculate the actual decoded size
            // Base64 encoding increases size by ~33%, so we can estimate or decode
            // For accuracy, we'll decode and check actual byte size
            byte[] decodedBytes = java.util.Base64.getDecoder().decode(cleanBase64);
            long actualSize = decodedBytes.length;

            if (actualSize > maxSizeInBytes) {
                // Customize error message with actual size
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    String.format("Image size (%d bytes / %.2f MB) exceeds maximum allowed size (%.2f MB)",
                        actualSize,
                        actualSize / (1024.0 * 1024.0),
                        maxSizeInBytes / (1024.0 * 1024.0))
                ).addConstraintViolation();
                return false;
            }

            return true;

        } catch (IllegalArgumentException e) {
            // Invalid base64 string - let other validators handle format validation
            // We'll consider it valid here to avoid duplicate error messages
            return true;
        }
    }
}
