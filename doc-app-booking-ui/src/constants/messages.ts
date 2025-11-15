/**
 * Centralized message constants for the application
 * This file contains all success, error, info, and validation messages
 * to ensure consistency across the application.
 */

// English Messages
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
    PREFIX: 'Dr.',
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
    PROFILE_IMAGE: 'Profile Image',
    PHONE_INVALID: 'Phone must start with + and be a valid number (at least 7 digits).',
    PHONE_NUMBER_INVALID: 'Please provide a valid phone number',

    // Gender validation
    GENDER_REQUIRED: 'Gender is required.',
    GENDER_INVALID: 'Please select a valid gender.',

    // Relation validation
    RELATION_REQUIRED: 'Please select a relation.',

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

  // UI Labels
  LABELS: {
    // Form fields
    FIRST_NAME: 'First name',
    LAST_NAME: 'Last name',
    EMAIL: 'Email',
    PHONE: 'Phone',
    PHONE_NUMBER: 'Phone Number',
    SPECIALIZATION: 'Specialization',
    DEPARTMENT: 'Department',
    EXPERIENCE_YEARS: 'Experience (years)',
    QUALIFICATIONS: 'Qualifications',
    AVAILABLE: 'Available',
    SCHEDULED: 'Scheduled',
    RESERVED: 'Reserved',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    DATE: 'Date',
    REASON: 'Reason',
    DAY_OF_WEEK: 'Day of Week',
    START_TIME: 'Start Time',
    END_TIME: 'End Time',
    DURATION_MINUTES: 'Duration (minutes)',
    PROFILE_IMAGE: 'Profile Image',
    // Status and info labels
    ACTIVE_TEMPLATE: 'Active template',
    PROFILE_IMAGE_UPLOADED: 'Profile image uploaded',

    // Table headers
    ACTIONS: 'Actions',
    DURATION: 'Duration',

    // Titles
    SLOT_TEMPLATES: 'Slot Templates',
    DOCTOR_LEAVES: 'Doctor Leaves',
    ADD_NEW_LEAVE: 'Add New Leave',
    ADD_NEW_TEMPLATE: 'Add New Template',
    EDIT_TEMPLATE: 'Edit Template',
    SLOTS: 'Slots',
    LEAVES: 'Leaves',
    APPOINTMENTS: 'Appointments',

    // Button labels
    RESET: 'Reset',
    SCHEDULED_LEAVES: 'Scheduled Leaves',

    // Messages/descriptions
    NO_SLOT_TEMPLATES: 'No slot templates yet',
    NO_LEAVES_SCHEDULED: 'No leaves scheduled',
    NO_SLOTS_FOR_DATE: 'No slots for this date',
    ADD_LEAVE_TO_START: 'Add a leave date above to get started',
    DOCTOR_ON_LEAVE: 'Doctor is on leave this day — booking disabled.',
    MANAGE_SLOT_TEMPLATES: 'Manage recurring slot templates for the selected doctor.',
    CREATE_RECURRING_TEMPLATE: 'Create a recurring availability template to let patients book predictable slots.',

    // Placeholders
    PLACEHOLDER_EMAIL: 'doctor@example.com',
    PLACEHOLDER_SELECT_DATE: 'Select date',
    PLACEHOLDER_FIRST_NAME: 'Enter first name',
    PLACEHOLDER_LAST_NAME: 'Enter last name',
    PLACEHOLDER_PHONE: 'Enter 10 digit mobile number',
    PLACEHOLDER_DEPARTMENT: 'Enter department',
    PLACEHOLDER_EXPERIENCE: '0',
    PLACEHOLDER_QUALIFICATIONS: 'Enter qualifications (e.g., MBBS, MD)',
    PLACEHOLDER_REASON: 'e.g. Medical appointment, Personal',
    PLACEHOLDER_DURATION: 'e.g. 15, 30, 60',
    PLACEHOLDER_SELECT_SPECIALIZATION: 'Select specialization',

    // Section headers
    SECTION_PERSONAL_INFO: 'Personal Information',
    SECTION_CONTACT_INFO: 'Contact Information',
    SECTION_PROFESSIONAL_INFO: 'Professional Information',
    SECTION_ADDITIONAL_INFO: 'Additional Information',

    // File upload
    CHOOSE_FILE: 'Choose file',
    PREVIEW_DESCRIPTION: 'Preview shows how it will appear',

    // Days of the week
    DAY_MONDAY: 'Monday',
    DAY_TUESDAY: 'Tuesday',
    DAY_WEDNESDAY: 'Wednesday',
    DAY_THURSDAY: 'Thursday',
    DAY_FRIDAY: 'Friday',
    DAY_SATURDAY: 'Saturday',
    DAY_SUNDAY: 'Sunday',

    // Time-related labels
    TIME_LABEL: 'Time',
    MINUTES_SHORT: 'min',

    // Common labels
    DAY_LABEL: 'Day',
    DISMISS: 'Dismiss',

    // Buttons/actions
    ADD_NEW_DOCTOR: 'Add New Doctor',
    EDIT_DOCTOR: 'Edit Doctor',
    DELETE_DOCTOR: 'Delete doctor',
    DELETE_TEMPLATE: 'Delete template',
    DELETE_LEAVE: 'Delete leave',
    EDIT_TEMPLATE_ACTION: 'Edit template',
    SLOT_TEMPLATES_ACTION: 'Slot Templates',
    EDIT: 'Edit',
    DELETE: 'Delete',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    SUBMIT: 'Submit',

    // Dialog descriptions
    UPDATE_DOCTOR_INFO: 'Update doctor information below',
    FILL_DOCTOR_DETAILS: 'Fill in the details to add a new doctor to your hospital',
    NO_DOCTORS_YET: 'No doctors added yet',

    // Required field indicator
    REQUIRED: '*',

    // Slot status labels
    STATUS_AVAILABLE: 'Available',
    STATUS_SCHEDULED: 'Scheduled',
    STATUS_RESERVED: 'Reserved',
    STATUS_COMPLETED: 'Completed',
    STATUS_CANCELLED: 'Cancelled',

    // Time-based labels
    TODAYS_SLOTS: "Today's Slots",
    NO_SLOTS_TODAY: 'No slots for today',
  },
};

// Tamil Messages (தமிழ் செய்திகள்)
export const MESSAGES_TA = {
  // Authentication Messages
  AUTH: {
    OTP_SENT: 'உங்கள் மொபைல் எண்ணுக்கு OTP அனுப்பப்பட்டது.',
    OTP_SEND_FAILED: 'OTP அனுப்புவதில் தோல்வி.',
    OTP_INVALID: 'தவறான OTP.',
    SENDING_OTP: 'OTP அனுப்புகிறது...',
    VERIFYING_OTP: 'OTP சரிபார்க்கிறது...',
  },

  // Appointment Messages
  APPOINTMENT: {
    BOOKED_SUCCESS: 'சந்திப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
    BOOKING_FAILED: 'பதிவு தோல்வியடைந்தது.',
    CANCEL_SUCCESS: 'சந்திப்பு வெற்றிகரமாக ரத்து செய்யப்பட்டது.',
    CANCEL_FAILED: 'சந்திப்பை ரத்து செய்வதில் தோல்வி.',
    COMPLETE_SUCCESS: 'சந்திப்பு வெற்றிகரமாக நிறைவு செய்யப்பட்டது.',
    COMPLETE_FAILED: 'சந்திப்பை நிறைவு செய்வதில் தோல்வி.',
    LOADING_FAILED: 'சந்திப்புகளை ஏற்றுவதில் தோல்வி.',
  },

  // Profile Messages
  PROFILE: {
    UPDATED_SUCCESS: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!',
    UPDATE_FAILED: 'சுயவிவரத்தை புதுப்பிப்பதில் தோல்வி.',
    LOADING_FAILED: 'சுயவிவரத்தை ஏற்றுவதில் தோல்வி.',
  },

  // Slot Messages
  SLOT: {
    RESERVED_SUCCESS: 'இடம் வெற்றிகரமாக ஒதுக்கப்பட்டது',
    RESERVE_FAILED: 'இடத்தை ஒதுக்குவதில் தோல்வி',
    LOADING_FAILED: 'இடங்களை ஏற்றுவதில் தோல்வி',
    NO_SLOTS: 'இந்த தேதிக்கு இடங்கள் இல்லை',
  },

  // Slot Template Messages
  SLOT_TEMPLATE: {
    SAVED_SUCCESS: 'இட டெம்ப்ளேட் சேமிக்கப்பட்டது',
    SAVE_FAILED: 'இட டெம்ப்ளேட்டை சேமிப்பதில் தோல்வி',
    DELETED_SUCCESS: 'இட டெம்ப்ளேட் நீக்கப்பட்டது',
    DELETE_FAILED: 'இட டெம்ப்ளேட்டை நீக்குவதில் தோல்வி',
    LOADING_FAILED: 'இட டெம்ப்ளேட்களை ஏற்றுவதில் தோல்வி',
    NO_DOCTOR_SELECTED: 'இட டெம்ப்ளேட்டுக்கு மருத்துவர் தேர்ந்தெடுக்கப்படவில்லை',
  },

  // Doctor Leave Messages
  LEAVE: {
    CREATED_SUCCESS: 'விடுப்பு உருவாக்கப்பட்டது',
    CREATE_FAILED: 'விடுப்பை உருவாக்குவதில் தோல்வி',
    DELETED_SUCCESS: 'விடுப்பு நீக்கப்பட்டது',
    DELETE_FAILED: 'விடுப்பை நீக்குவதில் தோல்வி',
    LOADING_FAILED: 'விடுப்புகளை ஏற்றுவதில் தோல்வி',
    NO_LEAVES: 'விடுப்புகள் திட்டமிடப்படவில்லை.',
  },

  // Doctor Messages
  DOCTOR: {
    PREFIX: 'டாக்.',
    ADDED_SUCCESS: 'மருத்துவர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
    ADD_FAILED: 'மருத்துவரைச் சேர்ப்பதில் தோல்வி',
    UPDATED_SUCCESS: 'மருத்துவர் வெற்றிகரமாக புதுப்பிக்கப்பட்டார்',
    UPDATE_FAILED: 'மருத்துவரை புதுப்பிப்பதில் தோல்வி',
    DELETED_SUCCESS: 'மருத்துவர் வெற்றிகரமாக நீக்கப்பட்டார்',
    DELETE_FAILED: 'மருத்துவரை நீக்குவதில் தோல்வி',
    LOADING_FAILED: 'மருத்துவர்களை ஏற்றுவதில் தோல்வி.',
    DETAILS_FAILED: 'மருத்துவர் விவரங்களை பெறுவதில் தோல்வி.',
    TODAY_COUNT_FAILED: "இன்றைய எண்ணிக்கையை ஏற்றுவதில் தோல்வி",
  },

  // Generic Messages
  GENERIC: {
    LOADING: 'ஏற்றுகிறது...',
    UNKNOWN_ERROR: 'அறியப்படாத பிழை',
    SUCCESS: 'வெற்றி',
    ERROR: 'பிழை',
  },

  // Validation Messages
  VALIDATION: {
    // Name validation
    NAME_REQUIRED: 'பெயர் தேவை.',
    FIRST_NAME_REQUIRED: 'முதல் பெயர் தேவை',
    FIRST_NAME_MAX: 'முதல் பெயர் 100 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',
    FIRST_NAME_INVALID: 'முதல் பெயரில் தவறான எழுத்துக்கள் உள்ளன',
    LAST_NAME_REQUIRED: 'கடைசி பெயர் தேவை',
    LAST_NAME_MAX: 'கடைசி பெயர் 100 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',
    LAST_NAME_INVALID: 'கடைசி பெயரில் தவறான எழுத்துக்கள் உள்ளன',

    // Email validation
    EMAIL_REQUIRED: 'மின்னஞ்சல் தேவை',
    EMAIL_MAX: 'மின்னஞ்சல் 200 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',
    EMAIL_INVALID: 'சரியான மின்னஞ்சல் முகவரியை வழங்கவும்',

    // Age validation
    AGE_REQUIRED: 'வயது தேவை.',
    AGE_POSITIVE_INTEGER: 'வயது நேர்மறை எண்ணாக இருக்க வேண்டும்.',

    // Phone validation
    PHONE_REQUIRED: 'தொலைபேசி தேவை.',
    PHONE_NUMBER_REQUIRED: 'தொலைபேசி எண் தேவை',
    PROFILE_IMAGE: 'சுயவிவர படம்',
    PHONE_INVALID: 'தொலைபேசி + உடன் தொடங்க வேண்டும் மற்றும் சரியான எண்ணாக இருக்க வேண்டும் (குறைந்தது 7 இலக்கங்கள்).',
    PHONE_NUMBER_INVALID: 'சரியான தொலைபேசி எண்ணை வழங்கவும்',

    // Gender validation
    GENDER_REQUIRED: 'பாலினம் தேவை.',
    GENDER_INVALID: 'சரியான பாலினத்தை தேர்ந்தெடுக்கவும்.',

    // Relation validation
    RELATION_REQUIRED: 'உறவை தேர்ந்தெடுக்கவும்.',

    // Specialization validation
    SPECIALIZATION_REQUIRED: 'சிறப்பு தேவை',
    SPECIALIZATION_MAX: 'சிறப்பு 200 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',
    SPECIALIZATION_INVALID: 'சரியான சிறப்பை தேர்ந்தெடுக்கவும்',

    // Department validation
    DEPARTMENT_MAX: 'துறை 200 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',
    DEPARTMENT_INVALID: 'துறையில் தவறான எழுத்துக்கள் உள்ளன',

    // Experience validation
    EXPERIENCE_RANGE: 'அனுபவம் 0 முதல் 70 வரை இருக்க வேண்டும்',

    // Qualifications validation
    QUALIFICATIONS_MAX: 'தகுதிகள் 1000 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',

    // Image validation
    IMAGE_TYPE_MAX: 'படத்தின் வகை 100 எழுத்துக்களுக்கு மேல் இருக்கக்கூடாது',

    // Time validation
    START_TIME_REQUIRED: 'தொடக்க நேரம் தேவை',
    END_TIME_REQUIRED: 'முடிவு நேரம் தேவை',
    END_TIME_AFTER_START: 'முடிவு நேரம் தொடக்க நேரத்திற்கு பின் இருக்க வேண்டும்',
    DURATION_MUST_FIT: 'இட கால அளவு தொடக்கம்/முடிவு வரம்பிற்குள் பொருந்த வேண்டும்',

    // Duration validation
    DURATION_MIN_5: 'கால அளவு குறைந்தது 5 நிமிடங்களாக இருக்க வேண்டும்',

    // Date validation
    DATE_REQUIRED: 'தயவுசெய்து ஒரு தேதியை தேர்ந்தெடுக்கவும்',
  },

  // Confirmation Messages
  CONFIRM: {
    DELETE_SLOT_TEMPLATE: 'இந்த இட டெம்ப்ளேட்டை நீக்க விரும்புகிறீர்களா? இந்த செயலை மீண்டும் செய்ய முடியாது.',
    DELETE_DOCTOR: 'இந்த மருத்துவரையும் தொடர்புடைய எல்லா தரவுகளையும் நீக்க விரும்புகிறீர்களா?',
    DELETE_LEAVE: 'இந்த விடுப்பு பதிவை நீக்க விரும்புகிறீர்களா?',
  },

  // UI Labels
  LABELS: {
    // Form fields
    FIRST_NAME: 'முதல் பெயர்',
    LAST_NAME: 'கடைசி பெயர்',
    EMAIL: 'மின்னஞ்சல்',
    PHONE: 'தொலைபேசி',
    PHONE_NUMBER: 'தொலைபேசி எண்',
    SPECIALIZATION: 'சிறப்பு',
    DEPARTMENT: 'துறை',
    EXPERIENCE_YEARS: 'அனுபவம் (ஆண்டுகள்)',
    QUALIFICATIONS: 'தகுதிகள்',
    AVAILABLE: 'கிடைக்கும்',
    SCHEDULED: 'திட்டமிடப்பட்டது',
    RESERVED: 'முன்பதிவு',
    COMPLETED: 'நிறைவு',
    CANCELLED: 'ரத்து',
    DATE: 'தேதி',
    REASON: 'காரணம்',
    DAY_OF_WEEK: 'வாரத்தின் நாள்',
    START_TIME: 'தொடக்க நேரம்',
    END_TIME: 'முடிவு நேரம்',
    DURATION_MINUTES: 'கால அளவு (நிமிடங்கள்)',
    PROFILE_IMAGE: 'சுயவிவர படம்',
    // Status and info labels
    ACTIVE_TEMPLATE: 'செயலில் உள்ள டெம்ப்ளேட்',
    PROFILE_IMAGE_UPLOADED: 'சுயவிவர படம் பதிவேற்றப்பட்டது',

    // Table headers
    ACTIONS: 'செயல்கள்',
    DURATION: 'கால அளவு',

    // Titles
    SLOT_TEMPLATES: 'இட டெம்ப்ளேட்கள்',
    DOCTOR_LEAVES: 'மருத்துவர் விடுப்புகள்',
    ADD_NEW_LEAVE: 'புதிய விடுப்பை சேர்',
    ADD_NEW_TEMPLATE: 'புதிய டெம்ப்ளேட்டை சேர்',
    EDIT_TEMPLATE: 'டெம்ப்ளேட்டை திருத்து',
    SLOTS: 'இடங்கள்',
    LEAVES: 'விடுப்புகள்',
    APPOINTMENTS: 'சந்திப்புகள்',

    // Button labels
    RESET: 'ரீசெட்',
    SCHEDULED_LEAVES: 'திட்டமிடப்பட்ட விடுப்புகள்',

    // Messages/descriptions
    NO_SLOT_TEMPLATES: 'இட டெம்ப்ளேட்கள் இல்லை',
    NO_LEAVES_SCHEDULED: 'விடுப்புகள் திட்டமிடப்படவில்லை',
    NO_SLOTS_FOR_DATE: 'இந்த தேதிக்கு இடங்கள் இல்லை',
    ADD_LEAVE_TO_START: 'தொடங்க மேலே ஒரு விடுப்பு தேதியை சேர்க்கவும்',
    DOCTOR_ON_LEAVE: 'மருத்துவர் இந்த நாளில் விடுப்பில் உள்ளார் — பதிவு முடக்கப்பட்டுள்ளது.',
    MANAGE_SLOT_TEMPLATES: 'தேர்ந்தெடுக்கப்பட்ட மருத்துவருக்கான மீண்டும் மீண்டும் இட டெம்ப்ளேட்களை நிர்வகிக்கவும்.',
    CREATE_RECURRING_TEMPLATE: 'நோயாளிகள் எதிர்பார்க்கக்கூடிய இடங்களை பதிவு செய்ய மீண்டும் மீண்டும் கிடைக்கும் டெம்ப்ளேட்டை உருவாக்கவும்.',

    // Placeholders
    PLACEHOLDER_EMAIL: 'doctor@example.com',
    PLACEHOLDER_SELECT_DATE: 'தேதியை தேர்ந்தெடு',
    PLACEHOLDER_FIRST_NAME: 'முதல் பெயரை உள்ளிடவும்',
    PLACEHOLDER_LAST_NAME: 'கடைசி பெயரை உள்ளிடவும்',
    PLACEHOLDER_PHONE: '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
    PLACEHOLDER_DEPARTMENT: 'துறையை உள்ளிடவும்',
    PLACEHOLDER_EXPERIENCE: '0',
    PLACEHOLDER_QUALIFICATIONS: 'தகுதிகளை உள்ளிடவும் (எ.கா., MBBS, MD)',
    PLACEHOLDER_REASON: 'எ.கா. மருத்துவ சந்திப்பு, தனிப்பட்ட',
    PLACEHOLDER_DURATION: 'எ.கா. 15, 30, 60',
    PLACEHOLDER_SELECT_SPECIALIZATION: 'சிறப்பை தேர்ந்தெடு',

    // Section headers
    SECTION_PERSONAL_INFO: 'தனிப்பட்ட தகவல்',
    SECTION_CONTACT_INFO: 'தொடர்பு தகவல்',
    SECTION_PROFESSIONAL_INFO: 'தொழில்முறை தகவல்',
    SECTION_ADDITIONAL_INFO: 'கூடுதல் தகவல்',

    // File upload
    CHOOSE_FILE: 'கோப்பை தேர்வு செய்',
    PREVIEW_DESCRIPTION: 'முன்னோட்டம் எப்படி தோன்றும் என்பதைக் காட்டுகிறது',

    // Days of the week
    DAY_MONDAY: 'திங்கள்',
    DAY_TUESDAY: 'செவ்வாய்',
    DAY_WEDNESDAY: 'புதன்',
    DAY_THURSDAY: 'வியாழன்',
    DAY_FRIDAY: 'வெள்ளி',
    DAY_SATURDAY: 'சனி',
    DAY_SUNDAY: 'ஞாயிறு',

    // Time-related labels
    TIME_LABEL: 'நேரம்',
    MINUTES_SHORT: 'நிமி',

    // Common labels
    DAY_LABEL: 'நாள்',
    DISMISS: 'நிராகரி',

    // Buttons/actions
    ADD_NEW_DOCTOR: 'புதிய மருத்துவரைச் சேர்',
    EDIT_DOCTOR: 'மருத்துவரைத் திருத்து',
    DELETE_DOCTOR: 'மருத்துவரை நீக்கு',
    DELETE_TEMPLATE: 'டெம்ப்ளேட்டை நீக்கு',
    DELETE_LEAVE: 'விடுப்பை நீக்கு',
    EDIT_TEMPLATE_ACTION: 'டெம்ப்ளேட்டை திருத்து',
    SLOT_TEMPLATES_ACTION: 'இட டெம்ப்ளேட்கள்',
    EDIT: 'திருத்து',
    DELETE: 'நீக்கு',
    SAVE: 'சேமி',
    CANCEL: 'ரத்து',
    SUBMIT: 'சமர்ப்பி',

    // Dialog descriptions
    UPDATE_DOCTOR_INFO: 'கீழே மருத்துவர் தகவலை புதுப்பிக்கவும்',
    FILL_DOCTOR_DETAILS: 'உங்கள் மருத்துவமனையில் புதிய மருத்துவரைச் சேர்க்க விவரங்களை நிரப்பவும்',
    NO_DOCTORS_YET: 'இன்னும் மருத்துவர்கள் சேர்க்கப்படவில்லை',

    // Required field indicator
    REQUIRED: '*',

    // Slot status labels
    STATUS_AVAILABLE: 'கிடைக்கிறது',
    STATUS_SCHEDULED: 'திட்டமிடப்பட்டது',
    STATUS_RESERVED: 'ஒதுக்கப்பட்டது',
    STATUS_COMPLETED: 'நிறைவு',
    STATUS_CANCELLED: 'ரத்து',

    // Time-based labels
    TODAYS_SLOTS: "இன்றைய இடங்கள்",
    NO_SLOTS_TODAY: 'இன்று இடங்கள் இல்லை',
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
