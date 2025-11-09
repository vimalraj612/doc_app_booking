/**
 * Centralized message constants for the application
 * This file contains all success, error, info, and validation messages
 * to ensure consistency across the application.
 */

export const MESSAGES = {
  // Authentication Messages
  AUTH: {
    OTP_SENT: 'OTP sent to your mobile number.',
    OTP_SEND_FAILED: 'Failed to send OTP.',
    OTP_INVALID: 'Invalid OTP.',
    SENDING_OTP: 'Sending OTP...',
    VERIFYING_OTP: 'Verifying OTP...',
  },

  // Appointment Messages
  APPOINTMENT: {
    BOOKED_SUCCESS: 'Appointment booked successfully!',
    BOOKING_FAILED: 'Booking failed.',
    CANCEL_SUCCESS: 'Appointment cancelled successfully.',
    CANCEL_FAILED: 'Failed to cancel appointment.',
    COMPLETE_SUCCESS: 'Appointment completed successfully.',
    COMPLETE_FAILED: 'Failed to complete appointment.',
    LOADING_FAILED: 'Failed to fetch appointments.',
  },

  // Profile Messages
  PROFILE: {
    UPDATED_SUCCESS: 'Profile updated successfully!',
    UPDATE_FAILED: 'Failed to update profile.',
    LOADING_FAILED: 'Failed to load profile.',
  },

  // Slot Messages
  SLOT: {
    RESERVED_SUCCESS: 'Slot reserved successfully',
    RESERVE_FAILED: 'Failed to reserve slot',
    LOADING_FAILED: 'Failed to load slots',
    NO_SLOTS: 'No slots for this date',
  },

  // Slot Template Messages
  SLOT_TEMPLATE: {
    SAVED_SUCCESS: 'Slot template saved',
    SAVE_FAILED: 'Failed to save slot template',
    DELETED_SUCCESS: 'Slot template deleted',
    DELETE_FAILED: 'Failed to delete slot template',
    LOADING_FAILED: 'Failed to load slot templates',
    NO_DOCTOR_SELECTED: 'No doctor selected for slot template',
  },

  // Doctor Leave Messages
  LEAVE: {
    CREATED_SUCCESS: 'Leave created',
    CREATE_FAILED: 'Failed to create leave',
    DELETED_SUCCESS: 'Leave deleted',
    DELETE_FAILED: 'Failed to delete leave',
    LOADING_FAILED: 'Failed to load leaves',
    NO_LEAVES: 'No leaves scheduled.',
  },

  // Doctor Messages
  DOCTOR: {
    ADDED_SUCCESS: 'Doctor added successfully',
    ADD_FAILED: 'Failed to add doctor',
    UPDATED_SUCCESS: 'Doctor updated successfully',
    UPDATE_FAILED: 'Failed to update doctor',
    DELETED_SUCCESS: 'Doctor deleted successfully',
    DELETE_FAILED: 'Failed to delete doctor',
    LOADING_FAILED: 'Failed to load doctors.',
    DETAILS_FAILED: 'Failed to fetch doctor details.',
    TODAY_COUNT_FAILED: "Failed to load today's count",
  },

  // Generic Messages
  GENERIC: {
    LOADING: 'Loading...',
    UNKNOWN_ERROR: 'Unknown error',
    SUCCESS: 'Success',
    ERROR: 'Error',
  },

  // Validation Messages
  VALIDATION: {
    // Name validation
    NAME_REQUIRED: 'Name is required.',
    FIRST_NAME_REQUIRED: 'First name is required',
    FIRST_NAME_MAX: 'First name must not exceed 100 characters',
    FIRST_NAME_INVALID: 'First name contains invalid characters',
    LAST_NAME_REQUIRED: 'Last name is required',
    LAST_NAME_MAX: 'Last name must not exceed 100 characters',
    LAST_NAME_INVALID: 'Last name contains invalid characters',

    // Email validation
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_MAX: 'Email must not exceed 200 characters',
    EMAIL_INVALID: 'Please provide a valid email address',

    // Age validation
    AGE_REQUIRED: 'Age is required.',
    AGE_POSITIVE_INTEGER: 'Age must be a positive integer.',

    // Phone validation
    PHONE_REQUIRED: 'Phone is required.',
    PHONE_NUMBER_REQUIRED: 'Phone number is required',
    PHONE_MAX: 'Phone number must not exceed 20 characters',
    PHONE_INVALID: 'Phone must start with + and be a valid number (at least 7 digits).',
    PHONE_NUMBER_INVALID: 'Please provide a valid phone number',

    // Gender validation
    GENDER_REQUIRED: 'Gender is required.',
    GENDER_INVALID: 'Please select a valid gender.',

    // Specialization validation
    SPECIALIZATION_REQUIRED: 'Specialization is required',
    SPECIALIZATION_MAX: 'Specialization must not exceed 200 characters',
    SPECIALIZATION_INVALID: 'Please select a valid specialization',

    // Department validation
    DEPARTMENT_MAX: 'Department must not exceed 200 characters',
    DEPARTMENT_INVALID: 'Department contains invalid characters',

    // Experience validation
    EXPERIENCE_RANGE: 'Experience must be between 0 and 70',

    // Qualifications validation
    QUALIFICATIONS_MAX: 'Qualifications must not exceed 1000 characters',

    // Image validation
    IMAGE_TYPE_MAX: 'Image content type must not exceed 100 characters',

    // Time validation
    START_TIME_REQUIRED: 'Start time is required',
    END_TIME_REQUIRED: 'End time is required',
    END_TIME_AFTER_START: 'End time must be after start time',
    DURATION_MUST_FIT: 'Slot duration must fit within start/end range',

    // Duration validation
    DURATION_MIN_5: 'Duration must be at least 5 minutes',

    // Date validation
    DATE_REQUIRED: 'Please choose a date',
  },

  // Confirmation Messages
  CONFIRM: {
    DELETE_SLOT_TEMPLATE: 'Are you sure you want to delete this slot template? This action cannot be undone.',
    DELETE_DOCTOR: 'Are you sure you want to delete this doctor and all related data?',
    DELETE_LEAVE: 'Are you sure you want to delete this leave entry?',
  },
};

// Type-safe message getter
export const getMessage = (category: keyof typeof MESSAGES, key: string): string => {
  const categoryMessages = MESSAGES[category] as Record<string, string>;
  return categoryMessages[key] || MESSAGES.GENERIC.UNKNOWN_ERROR;
};

// Export individual categories for convenience
export const AuthMessages = MESSAGES.AUTH;
export const AppointmentMessages = MESSAGES.APPOINTMENT;
export const ProfileMessages = MESSAGES.PROFILE;
export const SlotMessages = MESSAGES.SLOT;
export const SlotTemplateMessages = MESSAGES.SLOT_TEMPLATE;
export const LeaveMessages = MESSAGES.LEAVE;
export const DoctorMessages = MESSAGES.DOCTOR;
export const GenericMessages = MESSAGES.GENERIC;
export const ValidationMessages = MESSAGES.VALIDATION;
export const ConfirmMessages = MESSAGES.CONFIRM;
