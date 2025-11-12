package com.doc_app.booking.constant;

/**
 * Message keys for localization.
 * All messages in the application should use these keys.
 */
public class MessageKeys {
    
    // Validation Messages - General
    public static final String REQUIRED = "validation.required";
    public static final String INVALID_FORMAT = "validation.invalid_format";
    public static final String SIZE_EXCEEDED = "validation.size_exceeded";
    public static final String INVALID_CHARACTERS = "validation.invalid_characters";
    public static final String POSITIVE_NUMBER_REQUIRED = "validation.positive_number";
    
    // Validation Messages - Specific Fields
    public static final String FIRST_NAME_REQUIRED = "validation.first_name.required";
    public static final String FIRST_NAME_SIZE = "validation.first_name.size";
    public static final String FIRST_NAME_INVALID = "validation.first_name.invalid";
    
    public static final String LAST_NAME_REQUIRED = "validation.last_name.required";
    public static final String LAST_NAME_SIZE = "validation.last_name.size";
    public static final String LAST_NAME_INVALID = "validation.last_name.invalid";
    
    public static final String EMAIL_REQUIRED = "validation.email.required";
    public static final String EMAIL_INVALID = "validation.email.invalid";
    public static final String EMAIL_SIZE = "validation.email.size";
    
    public static final String PHONE_REQUIRED = "validation.phone.required";
    public static final String PHONE_INVALID = "validation.phone.invalid";
    
    public static final String SPECIALIZATION_REQUIRED = "validation.specialization.required";
    public static final String SPECIALIZATION_SIZE = "validation.specialization.size";
    public static final String SPECIALIZATION_INVALID = "validation.specialization.invalid";
    
    public static final String DEPARTMENT_SIZE = "validation.department.size";
    public static final String DEPARTMENT_INVALID = "validation.department.invalid";
    
    public static final String EXPERIENCE_NEGATIVE = "validation.experience.negative";
    public static final String EXPERIENCE_MAX = "validation.experience.max";
    
    public static final String QUALIFICATIONS_SIZE = "validation.qualifications.size";
    
    public static final String IMAGE_SIZE = "validation.image.size";
    public static final String IMAGE_TYPE_SIZE = "validation.image_type.size";
    public static final String IMAGE_TYPE_INVALID = "validation.image_type.invalid";
    
    public static final String HOSPITAL_ID_REQUIRED = "validation.hospital_id.required";
    public static final String HOSPITAL_ID_POSITIVE = "validation.hospital_id.positive";
    
    // Hospital Validation
    public static final String HOSPITAL_NAME_REQUIRED = "validation.hospital_name.required";
    public static final String HOSPITAL_NAME_SIZE = "validation.hospital_name.size";
    public static final String HOSPITAL_NAME_INVALID = "validation.hospital_name.invalid";
    
    public static final String HOSPITAL_TYPE_REQUIRED = "validation.hospital_type.required";
    public static final String HOSPITAL_TYPE_SIZE = "validation.hospital_type.size";
    public static final String HOSPITAL_TYPE_INVALID = "validation.hospital_type.invalid";
    
    public static final String ESTABLISHED_YEAR_REQUIRED = "validation.established_year.required";
    public static final String ESTABLISHED_YEAR_MIN = "validation.established_year.min";
    public static final String ESTABLISHED_YEAR_MAX = "validation.established_year.max";
    
    public static final String BED_CAPACITY_REQUIRED = "validation.bed_capacity.required";
    public static final String BED_CAPACITY_MIN = "validation.bed_capacity.min";
    public static final String BED_CAPACITY_MAX = "validation.bed_capacity.max";
    
    public static final String DESCRIPTION_SIZE = "validation.description.size";
    
    public static final String ALTERNATE_PHONE_INVALID = "validation.alternate_phone.invalid";
    
    public static final String WEBSITE_INVALID = "validation.website.invalid";
    public static final String WEBSITE_SIZE = "validation.website.size";
    
    public static final String ADDRESS_REQUIRED = "validation.address.required";
    public static final String ADDRESS_SIZE = "validation.address.size";
    
    public static final String CITY_REQUIRED = "validation.city.required";
    public static final String CITY_SIZE = "validation.city.size";
    public static final String CITY_INVALID = "validation.city.invalid";
    
    public static final String STATE_REQUIRED = "validation.state.required";
    public static final String STATE_SIZE = "validation.state.size";
    public static final String STATE_INVALID = "validation.state.invalid";
    
    public static final String ZIP_CODE_REQUIRED = "validation.zip_code.required";
    public static final String ZIP_CODE_INVALID = "validation.zip_code.invalid";
    
    public static final String COUNTRY_REQUIRED = "validation.country.required";
    public static final String COUNTRY_SIZE = "validation.country.size";
    public static final String COUNTRY_INVALID = "validation.country.invalid";
    
    public static final String ADMIN_FIRST_NAME_REQUIRED = "validation.admin_first_name.required";
    public static final String ADMIN_FIRST_NAME_SIZE = "validation.admin_first_name.size";
    public static final String ADMIN_FIRST_NAME_INVALID = "validation.admin_first_name.invalid";
    
    public static final String ADMIN_LAST_NAME_SIZE = "validation.admin_last_name.size";
    public static final String ADMIN_LAST_NAME_INVALID = "validation.admin_last_name.invalid";
    
    public static final String ADMIN_EMAIL_REQUIRED = "validation.admin_email.required";
    public static final String ADMIN_EMAIL_INVALID = "validation.admin_email.invalid";
    public static final String ADMIN_EMAIL_SIZE = "validation.admin_email.size";
    
    public static final String ADMIN_PHONE_REQUIRED = "validation.admin_phone.required";
    public static final String ADMIN_PHONE_INVALID = "validation.admin_phone.invalid";
    
    public static final String EMERGENCY_SERVICES_REQUIRED = "validation.emergency_services.required";
    
    // Coordinate Validation
    public static final String LATITUDE_RANGE = "validation.latitude.range";
    public static final String LONGITUDE_RANGE = "validation.longitude.range";
    
    // Patient Validation
    public static final String PATIENT_NAME_SIZE = "validation.patient_name.size";
    
    // OTP Validation
    public static final String OTP_REQUIRED = "validation.otp.required";
    public static final String OTP_SIZE = "validation.otp.size";
    public static final String OTP_DIGITS_ONLY = "validation.otp.digits_only";
    public static final String OTP_INVALID = "validation.otp.invalid";
    
    public static final String ROLE_REQUIRED = "validation.role.required";
    public static final String ROLE_INVALID = "validation.role.invalid";
    
    // Appointment Validation
    public static final String DOCTOR_ID_REQUIRED = "validation.doctor_id.required";
    public static final String DOCTOR_ID_POSITIVE = "validation.doctor_id.positive";
    public static final String APPOINTMENT_DATE_TIME_REQUIRED = "validation.appointment_date_time.required";
    public static final String APPOINTMENT_DATE_TIME_FUTURE = "validation.appointment_date_time.future";
    public static final String SLOT_ID_POSITIVE = "validation.slot_id.positive";
    public static final String NOTES_SIZE = "validation.notes.size";
    public static final String DATE_SIZE = "validation.date.size";
    public static final String GENDER_SIZE = "validation.gender.size";
    public static final String REASON_SIZE = "validation.reason.size";
    
    // Notification Validation
    public static final String APPOINTMENT_ID_REQUIRED = "validation.appointment_id.required";
    public static final String NOTIFICATION_TYPE_REQUIRED = "validation.notification_type.required";
    public static final String RECIPIENT_REQUIRED = "validation.recipient.required";
    public static final String RECIPIENT_SIZE = "validation.recipient.size";
    public static final String CONTENT_SIZE = "validation.content.size";
    public static final String SCHEDULED_FOR_FUTURE = "validation.scheduled_for.future";
    
    // Error Messages - Not Found
    public static final String DOCTOR_NOT_FOUND_ID = "error.doctor.not_found_id";
    public static final String DOCTOR_NOT_FOUND = "error.doctor.not_found";
    public static final String PATIENT_NOT_FOUND_ID = "error.patient.not_found_id";
    public static final String PATIENT_NOT_FOUND_EMAIL = "error.patient.not_found_email";
    public static final String PATIENT_NOT_FOUND_PHONE = "error.patient.not_found_phone";
    public static final String HOSPITAL_NOT_FOUND_ID = "error.hospital.not_found_id";
    public static final String HOSPITAL_NOT_FOUND_EMAIL = "error.hospital.not_found_email";
    public static final String HOSPITAL_NOT_FOUND_PHONE = "error.hospital.not_found_phone";
    public static final String APPOINTMENT_NOT_FOUND_ID = "error.appointment.not_found_id";
    public static final String NOTIFICATION_NOT_FOUND_ID = "error.notification.not_found_id";
    public static final String SLOT_NOT_FOUND = "error.slot.not_found";
    public static final String SLOT_TEMPLATE_NOT_FOUND = "error.slot_template.not_found";
    public static final String LEAVE_NOT_FOUND = "error.leave.not_found";
    
    // Error Messages - Business Logic
    public static final String DOCTOR_ID_NULL = "error.doctor_id.null";
    public static final String DOCTOR_NOT_AVAILABLE = "error.doctor.not_available";
    public static final String SLOT_ALREADY_BOOKED = "error.slot.already_booked";
    public static final String HOSPITAL_EMAIL_EXISTS = "error.hospital.email_exists";
    public static final String SLOT_TEMPLATE_ID_NULL = "error.slot_template_id.null";
    public static final String TIME_RANGE_REQUIRED = "error.time_range.required";
    public static final String START_TIME_BEFORE_END = "error.start_time.before_end";
    public static final String SLOT_DURATION_POSITIVE = "error.slot_duration.positive";
    public static final String SLOT_DURATION_TOO_LARGE = "error.slot_duration.too_large";
    public static final String LOCATION_URI_NULL = "error.location_uri.null";
    public static final String UNKNOWN_ROLE = "error.unknown_role";
    public static final String EMAIL_SEND_FAILED = "error.email.send_failed";
    
    // Error Messages - Data Integrity
    public static final String DATA_INTEGRITY_VIOLATION = "error.data_integrity.violation";
    public static final String INVALID_DOCTOR_ID = "error.invalid.doctor_id";
    public static final String INVALID_PATIENT_ID = "error.invalid.patient_id";
    public static final String INVALID_HOSPITAL_ID = "error.invalid.hospital_id";
    public static final String DUPLICATE_ENTRY = "error.duplicate.entry";
    public static final String INVALID_DATA = "error.invalid.data";

    public static final String DOCTOR_ALREADY_EXISTS_EMAIL = "doctor.already.exists.email";
    public static final String DOCTOR_NOT_FOUND_EMAIL = "doctor.not.found.email";
    public static final String DOCTOR_NOT_FOUND_CONTACT = "doctor.not.found.contact";

    public static final String HOSPITAL_ALREADY_EXISTS_EMAIL = "hospital.already.exists.email";
    public static final String PATIENT_ALREADY_EXISTS_PHONE = "patient.already.exists.phone";
    
    private MessageKeys() {
        // Private constructor to prevent instantiation
    }
}
