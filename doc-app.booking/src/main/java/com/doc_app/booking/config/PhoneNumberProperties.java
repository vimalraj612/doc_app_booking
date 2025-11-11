package com.doc_app.booking.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for phone number validation and formatting.
 * Allows flexible configuration of country codes and phone number formats.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.phone")
public class PhoneNumberProperties {

    /**
     * Default country code (e.g., +91 for India, +1 for USA)
     */
    private String defaultCountryCode = "+91";

    /**
     * Minimum length of phone number including country code digits
     * Example: For India (+91 and 10 digits = 12 total)
     */
    private int minLength = 10;

    /**
     * Maximum length of phone number including country code digits
     * Example: For international numbers = 15 total
     */
    private int maxLength = 15;

    /**
     * Length of phone number without country code
     * Example: 10 for India
     */
    private int numberLength = 10;

    /**
     * Whether to automatically add country code if not present
     */
    private boolean autoAddCountryCode = false;

    /**
     * List of supported country codes (comma-separated)
     * Example: +91,+1,+44,+61
     */
    private String supportedCountryCodes = "+91,+1,+44,+61,+86,+81";
}
