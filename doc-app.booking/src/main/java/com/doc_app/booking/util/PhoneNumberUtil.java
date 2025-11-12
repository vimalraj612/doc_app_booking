package com.doc_app.booking.util;

import com.doc_app.booking.config.PhoneNumberProperties;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for phone number operations including formatting, validation,
 * and normalization.
 */
@Component
public class PhoneNumberUtil {

    private final PhoneNumberProperties phoneProperties;

    public PhoneNumberUtil(PhoneNumberProperties phoneProperties) {
        this.phoneProperties = phoneProperties;
    }

    /**
     * Normalize phone number by adding default country code if not present
     * 
     * @param phoneNumber the phone number to normalize
     * @return normalized phone number with country code
     */
    public String normalize(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return phoneNumber;
        }

        String trimmed = phoneNumber.trim();

        // If already has country code, return as is
        if (trimmed.startsWith("+")) {
            return trimmed;
        }

        // Add default country code
        if (phoneProperties.isAutoAddCountryCode()) {
            return phoneProperties.getDefaultCountryCode() + trimmed;
        }

        return trimmed;
    }

    /**
     * Format phone number for display
     * Example: +919876543210 -> +91 98765 43210
     * 
     * @param phoneNumber the phone number to format
     * @return formatted phone number
     */
    public String format(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return phoneNumber;
        }

        String normalized = normalize(phoneNumber);

        if (normalized.startsWith("+91") && normalized.length() == 13) {
            return normalized.substring(0, 3) + " " +
                    normalized.substring(3, 8) + " " +
                    normalized.substring(8);
        }

        if (normalized.startsWith("+1") && normalized.length() == 12) {
            return normalized.substring(0, 2) + " " +
                    normalized.substring(2, 5) + " " +
                    normalized.substring(5, 8) + " " +
                    normalized.substring(8);
        }

        // Default: just add space after country code
        if (normalized.startsWith("+")) {
            int codeEnd = normalized.indexOf(' ') > 0 ? normalized.indexOf(' ') : (normalized.length() > 4 ? 3 : 2);
            if (codeEnd < normalized.length()) {
                return normalized.substring(0, codeEnd) + " " + normalized.substring(codeEnd);
            }
        }

        return normalized;
    }

    /**
     * Extract country code from phone number
     * 
     * @param phoneNumber the phone number
     * @return country code (e.g., +91) or default country code if not present
     */
    public String extractCountryCode(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return phoneProperties.getDefaultCountryCode();
        }

        String trimmed = phoneNumber.trim();
        if (trimmed.startsWith("+")) {
            // Extract country code (typically 1-3 digits after +)
            for (int i = 2; i <= Math.min(4, trimmed.length()); i++) {
                String potentialCode = trimmed.substring(0, i);
                if (getSupportedCountryCodes().contains(potentialCode)) {
                    return potentialCode;
                }
            }
        }

        return phoneProperties.getDefaultCountryCode();
    }

    /**
     * Check if phone number has country code
     * 
     * @param phoneNumber the phone number
     * @return true if phone number starts with +
     */
    public boolean hasCountryCode(String phoneNumber) {
        return phoneNumber != null && phoneNumber.trim().startsWith("+");
    }

    /**
     * Get list of supported country codes
     * 
     * @return list of country codes
     */
    public List<String> getSupportedCountryCodes() {
        return Arrays.stream(phoneProperties.getSupportedCountryCodes().split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }

    /**
     * Validate if country code is supported
     * 
     * @param countryCode the country code to validate
     * @return true if supported
     */
    public boolean isCountryCodeSupported(String countryCode) {
        return getSupportedCountryCodes().contains(countryCode);
    }

    /**
     * Remove country code from phone number
     * 
     * @param phoneNumber the phone number
     * @return phone number without country code
     */
    public String removeCountryCode(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return phoneNumber;
        }

        String trimmed = phoneNumber.trim();
        if (trimmed.startsWith("+")) {
            String countryCode = extractCountryCode(trimmed);
            return trimmed.substring(countryCode.length());
        }

        return trimmed;
    }

    /**
     * Get default country code from configuration
     * 
     * @return default country code
     */
    public String getDefaultCountryCode() {
        return phoneProperties.getDefaultCountryCode();
    }
}
