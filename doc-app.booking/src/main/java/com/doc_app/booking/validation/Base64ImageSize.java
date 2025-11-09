package com.doc_app.booking.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validation annotation to check base64 encoded image size
 * Validates that the decoded image does not exceed the specified max size in bytes
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = Base64ImageSizeValidator.class)
@Documented
public @interface Base64ImageSize {
    
    String message() default "Image size exceeds the maximum allowed size";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Maximum allowed size in bytes
     * Default: 3MB (3 * 1024 * 1024 bytes)
     */
    long maxSizeInBytes() default 3145728; // 3MB
}
