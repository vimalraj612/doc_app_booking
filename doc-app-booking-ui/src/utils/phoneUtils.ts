/**
 * Phone number utility functions
 * Centralized phone number handling with country code support
 */

// Configuration for country codes - easy to modify in future
export const PHONE_CONFIG = {
  DEFAULT_COUNTRY_CODE: '+91',
  PHONE_NUMBER_LENGTH: 10,
  COUNTRY_CODES: {
    IN: { code: '+91', length: 10, name: 'India' },
    US: { code: '+1', length: 10, name: 'United States' },
    // Add more countries as needed
  },
  // Current active country (can be made dynamic based on user location/preference)
  ACTIVE_COUNTRY: 'IN' as const,
} as const;

/**
 * Get the current country code configuration
 */
export const getActiveCountryConfig = () => {
  return PHONE_CONFIG.COUNTRY_CODES[PHONE_CONFIG.ACTIVE_COUNTRY];
};

/**
 * Get the current country code (e.g., '+91')
 */
export const getCountryCode = (): string => {
  return getActiveCountryConfig().code;
};

/**
 * Get the expected phone number length for current country
 */
export const getPhoneNumberLength = (): number => {
  return getActiveCountryConfig().length;
};

/**
 * Format phone number by adding country code
 * @param phoneNumber - The phone number (10 digits)
 * @returns Formatted phone number with country code (e.g., '+919876543210')
 */
export const formatPhoneWithCountryCode = (phoneNumber: string): string => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return `${getCountryCode()}${digitsOnly}`;
};

/**
 * Extract digits only from phone number
 * @param phoneNumber - Phone number with or without country code
 * @returns Only the digits (removes +, spaces, etc.)
 */
export const extractDigits = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};

/**
 * Remove country code from phone number
 * @param phoneNumber - Phone number with country code
 * @returns Phone number without country code
 */
export const removeCountryCode = (phoneNumber: string): string => {
  const digitsOnly = extractDigits(phoneNumber);
  const countryCodeDigits = extractDigits(getCountryCode());
  
  if (digitsOnly.startsWith(countryCodeDigits)) {
    return digitsOnly.slice(countryCodeDigits.length);
  }
  
  return digitsOnly;
};

/**
 * Validate phone number length
 * @param phoneNumber - Phone number to validate (without country code)
 * @returns true if valid length
 */
export const isValidPhoneLength = (phoneNumber: string): boolean => {
  const digitsOnly = extractDigits(phoneNumber);
  return digitsOnly.length === getPhoneNumberLength();
};

/**
 * Validate and format phone number
 * @param phoneNumber - Phone number to validate and format
 * @returns Object with validation status and formatted number
 */
export const validateAndFormatPhone = (phoneNumber: string): {
  isValid: boolean;
  formattedPhone: string;
  error?: string;
} => {
  const digitsOnly = extractDigits(phoneNumber);
  
  if (digitsOnly.length === 0) {
    return {
      isValid: false,
      formattedPhone: '',
      error: 'Phone number is required',
    };
  }
  
  if (digitsOnly.length !== getPhoneNumberLength()) {
    return {
      isValid: false,
      formattedPhone: '',
      error: `Please enter exactly ${getPhoneNumberLength()} digits`,
    };
  }
  
  return {
    isValid: true,
    formattedPhone: formatPhoneWithCountryCode(digitsOnly),
  };
};

/**
 * Sanitize phone input - keep only digits and limit to max length
 * @param input - User input
 * @returns Sanitized phone number
 */
export const sanitizePhoneInput = (input: string): string => {
  return extractDigits(input).slice(0, getPhoneNumberLength());
};
