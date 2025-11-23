/**
 * Centralized Localization for English and Tamil
 * Add more languages by extending the Locale type and translations object
 */

import { MESSAGES, MESSAGES_TA } from './messages';

export type Locale = 'en' | 'ta';

export interface Translations {
  // Patient Relations
  patientRelations: {
    title: string;
    addRelation: string;
    editRelation: string;
    deleteSuccess: string;
    deleteError: string;
    createSuccess: string;
    createError: string;
    updateSuccess: string;
    updateError: string;
    fetchError: string;
    loading: string;
    noRelations: string;
    fullName: string;
    age: string;
    phoneNumber: string;
    gender: string;
    relationship: string;
    dialogDescription: string;
    selectRelationship: string;
  };
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    update: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    loading: string;
    search: string;
    filter: string;
    all: string;
    submit: string;
    view: string;
    back: string;
    next: string;
    previous: string;
    changeMobileNumber: string;
    actions: string;
  };

  // Date & Time
  dateTime: {
    today: string;
    yesterday: string;
    tomorrow: string;
    date: string;
    time: string;
    startDate: string;
    endDate: string;
    dateRange: string;
  };

  // Authentication
  auth: {
    signIn: string;
    signOut: string;
    logout: string;
    phoneNumber: string;
    enterPhoneNumber: string;
    sendOTP: string;
    verifyOTP: string;
    enterOTP: string;
    sendingOTP: string;
    verifying: string;
    mobileNumber: string;
    enterMobileOTP: string;
    welcomePatient: string;
    welcomeDoctor: string;
    welcomeHospital: string;
    patientTagline: string;
    doctorTagline: string;
    hospitalTagline: string;
    securePrivate: string;
    easyToUse: string;
    access24x7: string;
    brandTagline: string;
    copyrightText: string;
    healthCare: string;
  };

  // Portals
  portals: {
    patientPortal: string;
    doctorPortal: string;
    hospitalPortal: string;
    patientSignIn: string;
    doctorSignIn: string;
    hospitalSignIn: string;
  };

  // Patient
  patient: {
    profile: string;
    editProfile: string;
    myAppointments: string;
    bookAppointment: string;
    patientName: string;
    patientPhone: string;
    patientDetails: string;
    appointeeName: string;
    appointeeAge: string;
    appointeeGender: string;
    appointeePhone: string;
  };

  // Doctor
  doctor: {
    prefix: string;
    doctor: string;
    doctorName: string;
    doctorDetails: string;
    specialization: string;
    experience: string;
    qualification: string;
    qualifications: string;
    freeSlots: string;
    mySlots: string;
    todaysSlots: string;
    addDoctor: string;
    editDoctor: string;
    deleteDoctor: string;
    doctors: string;
    onLeave: string;
    years: string;
    contact: string;
    noDoctorDetails: string;
    loadingDoctorDetails: string;
    bookNow: string;
  };

  // Hospital
  hospital: {
    hospitalName: string;
    hospitalDetails: string;
    manageDoctors: string;
    manageAppointments: string;
    addNewDoctor: string;
  };

  // Appointments
  appointments: {
    appointment: string;
    appointments: string;
    appointmentDetails: string;
    appointmentTime: string;
    appointmentDate: string;
    bookAppointment: string;
    cancelAppointment: string;
    rescheduleAppointment: string;
    completeAppointment: string;
    viewAppointment: string;
    noAppointments: string;
    upcomingAppointments: string;
    pastAppointments: string;
    filterAppointments: string;
    noAppointmentsBetween: string;
    yrs: string;
    patientName: string;
    markAsComplete: string;
    completing: string;
    markAppointmentComplete: string;
    followUpInformation: string;
    followUpDate: string;
    completionNotes: string;
    notes: string;
    scheduleFollowUp: string;
    provideDetails: string;
    diagnosisPlaceholder: string;
    cancelConfirmMessage: string;
    yesCancel: string;
    noKeepIt: string;
    notAvailable: string;
  };

  // Filters
  filters: {
    filterAppointments: string;
    dateRange: string;
    previousDay: string;
    nextDay: string;
    to: string;
    status: string;
    allStatuses: string;
    search: string;
    clear: string;
    showMoreFilters: string;
    hideMoreFilters: string;
    doctorName: string;
    patientName: string;
    patientPhone: string;
    searchByDoctorName: string;
    searchByPatientName: string;
    searchByPhoneNumber: string;
  };

  // Status
  status: {
    all: string;
    booked: string;
    cancelled: string;
    completed: string;
    pending: string;
    scheduled: string;
    rescheduled: string;
    noShow: string;
    confirmed: string;
  };

  // Slots
  slots: {
    slot: string;
    slots: string;
    slotTime: string;
    availableSlots: string;
    noSlots: string;
    selectSlot: string;
    slotTemplate: string;
    slotTemplates: string;
    manageSlots: string;
    addSlot: string;
    deleteSlot: string;
  };

  // Leaves
  leaves: {
    leaves: string;
    doctorLeaves: string;
    addLeave: string;
    deleteLeave: string;
    onLeaveMessage: string;
    noLeavesAdded: string;
  };

  // Profile Fields
  profileFields: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneNumber: string;
    address: string;
    age: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    profileImage: string;
    profileImageUploaded: string;
    updatePersonalInfo: string;
    phoneCannotChange: string;
    enterFirstName: string;
    enterLastName: string;
    enterEmail: string;
    enterAddress: string;
    selectGender: string;
    loadingProfile: string;
    savingProfile: string;
    saveProfile: string;
  };

  // Gender
  gender: {
    male: string;
    female: string;
    other: string;
  };

  // Relationships
  relationships: {
    spouse: string;
    father: string;
    mother: string;
    son: string;
    daughter: string;
    brother: string;
    sister: string;
    grandfather: string;
    grandmother: string;
    grandson: string;
    granddaughter: string;
    uncle: string;
    aunt: string;
    nephew: string;
    niece: string;
    cousin: string;
    friend: string;
    other: string;
  };

  // Days
  days: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  // Forms
  forms: {
    personalInfo: string;
    contactInfo: string;
    professionalInfo: string;
    additionalInfo: string;
    required: string;
    optional: string;
  };

  // Buttons & Actions
  actions: {
    showSlots: string;
    hideSlots: string;
    bookNow: string;
    cancelNow: string;
    saveChanges: string;
    discardChanges: string;
    confirmBooking: string;
    confirmCancellation: string;
    confirmDeletion: string;
  };

  // UI Labels & Placeholders
  ui: {
    availableSlots: string;
    selectDateToView: string;
    selectDate: string;
    availableTimeSlots: string;
    noSlotsForDate: string;
    doctorOnLeave: string;
    loadingSlots: string;
    bookAppointment: string;
    bookYourAppointment: string;
    appointeeInformation: string;
    fullName: string;
    age: string;
    phoneNumber: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    selectGender: string;
    namePlaceholder: string;
    agePlaceholder: string;
    phonePlaceholder: string;
    invalidPhone: string;
    on: string;
    for: string;
  };

  // Messages (keeping existing message structure)
  messages: typeof import('./messages').MESSAGES;
}

export const translations: Record<Locale, Translations> = {
  en: {
    patientRelations: {
      title: 'Patient Relations',
      addRelation: 'Add Relation',
      editRelation: 'Edit Relation',
      deleteSuccess: 'Relation deleted successfully.',
      deleteError: 'Failed to delete relation.',
      createSuccess: 'Relation added successfully.',
      createError: 'Failed to add relation.',
      updateSuccess: 'Relation updated successfully.',
      updateError: 'Failed to update relation.',
      fetchError: 'Failed to fetch relations.',
      loading: 'Loading relations...',
      noRelations: 'No relations added yet.',
      fullName: 'Full Name',
      age: 'Age',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      relationship: 'Relationship',
      dialogDescription: 'Add or edit a relation for this patient.',
      selectRelationship: 'Select relationship',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      update: 'Update',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      submit: 'Submit',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
  changeMobileNumber: 'Change mobile number',
  actions: 'Actions',
    },

    dateTime: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      date: 'Date',
      time: 'Time',
      startDate: 'Start Date',
      endDate: 'End Date',
      dateRange: 'Date Range',
    },

    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      logout: 'Logout',
      phoneNumber: 'Phone Number',
      enterPhoneNumber: 'Enter phone number',
      sendOTP: 'Send OTP',
      verifyOTP: 'Verify OTP',
      enterOTP: 'Enter OTP',
      sendingOTP: 'Sending OTP...',
      verifying: 'Verifying...',
      mobileNumber: 'Mobile Number',
      enterMobileOTP: 'Enter your mobile number to receive an OTP',
      welcomePatient: 'Welcome Patient',
      welcomeDoctor: 'Welcome Doctor',
      welcomeHospital: 'Welcome Hospital',
      patientTagline: 'Book appointments with ease',
      doctorTagline: 'Manage your appointments and patients',
      hospitalTagline: 'Manage your doctors and appointments',
      securePrivate: 'Secure & Private',
      easyToUse: 'Easy to Use',
      access24x7: '24/7 Access',
      brandTagline: 'Your health, our priority',
      copyrightText: '© 2025 HealthCare Portal. All rights reserved.',
      healthCare: 'HealthCare',
    },

    portals: {
      patientPortal: 'Patient Portal',
      doctorPortal: 'Doctor Portal',
      hospitalPortal: 'Hospital Portal',
      patientSignIn: 'Schedule appointments with expert Doctors',
      doctorSignIn: 'Doctor Sign In',
      hospitalSignIn: 'Hospital Sign In',
    },

    patient: {
      profile: 'Profile',
      editProfile: 'Edit Profile',
      myAppointments: 'My Appointments',
      bookAppointment: 'Book Appointment',
      patientName: 'Patient Name',
      patientPhone: 'Patient Phone',
      patientDetails: 'Patient Details',
      appointeeName: 'Appointee Name',
      appointeeAge: 'Appointee Age',
      appointeeGender: 'Appointee Gender',
      appointeePhone: 'Appointee Phone',
    },

    doctor: {
      prefix: 'Dr.',
      doctor: 'Doctor',
      doctorName: 'Doctor Name',
      doctorDetails: 'Doctor Details',
      specialization: 'Specialization',
      experience: 'Experience',
      qualification: 'Qualification',
      qualifications: 'Qualifications',
      freeSlots: 'Free Slots',
      mySlots: 'My Slots',
      todaysSlots: "Today's Slots",
      addDoctor: 'Add Doctor',
      editDoctor: 'Edit Doctor',
      deleteDoctor: 'Delete Doctor',
      doctors: 'Doctors',
      onLeave: 'On Leave',
      years: 'years',
      contact: 'Contact',
      noDoctorDetails: 'No doctor details found.',
      loadingDoctorDetails: 'Loading doctor details...',
      bookNow: 'Book Now',
    },

    hospital: {
      hospitalName: 'Hospital Name',
      hospitalDetails: 'Hospital Details',
      manageDoctors: 'Manage Doctors',
      manageAppointments: 'Manage Appointments',
      addNewDoctor: 'Add New Doctor',
    },

    appointments: {
      appointment: 'Appointment',
      appointments: 'Appointments',
      appointmentDetails: 'Appointment Details',
      appointmentTime: 'Appointment Time',
      appointmentDate: 'Appointment Date',
      bookAppointment: 'Book Appointment',
      cancelAppointment: 'Cancel Appointment',
      rescheduleAppointment: 'Reschedule Appointment',
      completeAppointment: 'Complete Appointment',
      viewAppointment: 'View Appointment',
      noAppointments: 'No appointments found',
      upcomingAppointments: 'Upcoming Appointments',
      pastAppointments: 'Past Appointments',
      filterAppointments: 'Filter Appointments',
      noAppointmentsBetween: 'No appointments between',
      yrs: 'yrs',
      patientName: 'Patient Name',
      markAsComplete: 'Mark as Complete',
      completing: 'Completing...',
      markAppointmentComplete: 'Mark the appointment with',
      followUpInformation: 'Follow-up Information',
      followUpDate: 'Follow-up Date',
      completionNotes: 'Completion Notes',
      notes: 'Notes',
      scheduleFollowUp: 'Schedule a follow-up appointment if needed',
      provideDetails: 'Provide details about the completed appointment',
      diagnosisPlaceholder: 'Add diagnosis, treatment details, or any other relevant notes...',
      cancelConfirmMessage: 'Are you sure you want to cancel your appointment with',
      yesCancel: 'Yes, Cancel',
      noKeepIt: 'No, Keep It',
      notAvailable: 'N/A',
    },

    filters: {
      filterAppointments: 'Filter Appointments',
      dateRange: 'Date Range',
      previousDay: 'Previous day',
      nextDay: 'Next day',
      to: 'to',
      status: 'Status',
      allStatuses: 'All Statuses',
      search: 'Search',
      clear: 'Clear',
      showMoreFilters: 'Show More Filters',
      hideMoreFilters: 'Hide More Filters',
      doctorName: 'Doctor Name',
      patientName: 'Patient Name',
      patientPhone: 'Patient Phone',
      searchByDoctorName: 'Search by doctor name...',
      searchByPatientName: 'Search by patient name...',
      searchByPhoneNumber: 'Search by phone number...',
    },

    status: {
      all: 'All',
      booked: 'Booked',
      cancelled: 'Cancelled',
      completed: 'Completed',
      pending: 'Pending',
      scheduled: 'Scheduled',
      rescheduled: 'Rescheduled',
      noShow: 'No Show',
      confirmed: 'Confirmed',
    },

    slots: {
      slot: 'Slot',
      slots: 'Slots',
      slotTime: 'Slot Time',
      availableSlots: 'Available Slots',
      noSlots: 'No slots available',
      selectSlot: 'Select a slot',
      slotTemplate: 'Slot Template',
      slotTemplates: 'Slot Templates',
      manageSlots: 'Manage Slots',
      addSlot: 'Add Slot',
      deleteSlot: 'Delete Slot',
    },

    leaves: {
      leaves: 'Leaves',
      doctorLeaves: 'Doctor Leaves',
      addLeave: 'Add Leave',
      deleteLeave: 'Delete Leave',
      onLeaveMessage: 'Doctor is on leave this day — booking disabled.',
      noLeavesAdded: 'No leaves added yet',
    },

    profileFields: {
      name: 'Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      phoneNumber: 'Phone Number',
      address: 'Address',
      age: 'Age',
      gender: 'Gender',
      dateOfBirth: 'Date of Birth',
      bloodGroup: 'Blood Group',
      profileImage: 'Profile Image',
      profileImageUploaded: 'Profile image uploaded',
      updatePersonalInfo: 'Update your personal information below',
      phoneCannotChange: 'Phone number cannot be changed',
      enterFirstName: 'Enter first name',
      enterLastName: 'Enter last name',
      enterEmail: 'patient@example.com',
      enterAddress: 'Enter your address',
      selectGender: 'Select gender',
      loadingProfile: 'Loading profile...',
      savingProfile: 'Saving...',
      saveProfile: 'Save Profile',
    },

    gender: {
      male: 'Male',
      female: 'Female',
      other: 'Other',
    },

    relationships: {
      spouse: 'Spouse',
      father: 'Father',
      mother: 'Mother',
      son: 'Son',
      daughter: 'Daughter',
      brother: 'Brother',
      sister: 'Sister',
      grandfather: 'Grandfather',
      grandmother: 'Grandmother',
      grandson: 'Grandson',
      granddaughter: 'Granddaughter',
      uncle: 'Uncle',
      aunt: 'Aunt',
      nephew: 'Nephew',
      niece: 'Niece',
      cousin: 'Cousin',
      friend: 'Friend',
      other: 'Other',
    },

    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },

    forms: {
      personalInfo: 'Personal Information',
      contactInfo: 'Contact Information',
      professionalInfo: 'Professional Information',
      additionalInfo: 'Additional Information',
      required: 'Required',
      optional: 'Optional',
    },

    actions: {
      showSlots: 'Show Slots',
      hideSlots: 'Hide Slots',
      bookNow: 'Book Now',
      cancelNow: 'Cancel Now',
      saveChanges: 'Save Changes',
      discardChanges: 'Discard Changes',
      confirmBooking: 'Confirm Booking',
      confirmCancellation: 'Confirm Cancellation',
      confirmDeletion: 'Confirm Deletion',
    },

    ui: {
      availableSlots: 'Available Slots',
      selectDateToView: 'Select a date to view available appointment slots',
      selectDate: 'Select Date',
      availableTimeSlots: 'Available Time Slots',
      noSlotsForDate: 'No slots for this date',
      doctorOnLeave: 'Doctor is on leave this day — booking disabled.',
      loadingSlots: 'Loading slots...',
      bookAppointment: 'Book Appointment',
      bookYourAppointment: 'Book your appointment for',
      appointeeInformation: 'Appointee Information',
      fullName: 'Full Name',
      age: 'Age',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      selectGender: 'Select Gender',
      namePlaceholder: 'John Doe',
      agePlaceholder: '25',
      phonePlaceholder: '9876543210',
      invalidPhone: 'Invalid phone number',
      on: 'on',
      for: 'for',
    },

    messages: MESSAGES,
  },

  ta: {
    patientRelations: {
      title: 'உறவுகள்',
      addRelation: 'உறவை சேர்',
      editRelation: 'உறவை திருத்து',
      deleteSuccess: 'உறவு வெற்றிகரமாக நீக்கப்பட்டது.',
      deleteError: 'உறவை நீக்குவதில் தோல்வி.',
      createSuccess: 'உறவு வெற்றிகரமாக சேர்க்கப்பட்டது.',
      createError: 'உறவை சேர்ப்பதில் தோல்வி.',
      updateSuccess: 'உறவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது.',
      updateError: 'உறவை புதுப்பிப்பதில் தோல்வி.',
      fetchError: 'உறவுகளை பெறுவதில் தோல்வி.',
      loading: 'உறவுகள் ஏற்றப்படுகின்றன...',
      noRelations: 'இன்னும் உறவுகள் சேர்க்கப்படவில்லை.',
      fullName: 'முழு பெயர்',
      age: 'வயது',
      phoneNumber: 'தொலைபேசி எண்',
      gender: 'பாலினம்',
      relationship: 'உறவு',
      dialogDescription: 'இந்த நோயாளிக்கான உறவை சேர்க்கவும் அல்லது திருத்தவும்.',
      selectRelationship: 'உறவை தேர்ந்தெடுக்கவும்',
    },
    common: {
      save: 'சேமி',
      cancel: 'ரத்து',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      add: 'சேர்',
      update: 'புதுப்பி',
      close: 'மூடு',
      confirm: 'உறுதி',
      yes: 'ஆம்',
      no: 'இல்லை',
      loading: 'ஏற்றுகிறது...',
      search: 'தேடு',
      filter: 'வடிகட்டு',
      all: 'அனைத்தும்',
      submit: 'சமர்ப்பி',
      view: 'பார்',
      back: 'பின்',
      next: 'அடுத்து',
      previous: 'முந்தைய',
  changeMobileNumber: 'மொபைல் எண்ணை மாற்று',
  actions: 'செயல்கள்',
    },

    dateTime: {
      today: 'இன்று',
      yesterday: 'நேற்று',
      tomorrow: 'நாளை',
      date: 'தேதி',
      time: 'நேரம்',
      startDate: 'தொடக்க தேதி',
      endDate: 'முடிவு தேதி',
      dateRange: 'தேதி வரம்பு',
    },

    auth: {
      signIn: 'உள்நுழை',
      signOut: 'வெளியேறு',
      logout: 'வெளியேறு',
      phoneNumber: 'தொலைபேசி எண்',
      enterPhoneNumber: 'தொலைபேசி எண்ணை உள்ளிடவும்',
      sendOTP: 'OTP அனுப்பு',
      verifyOTP: 'OTP சரிபார்',
      enterOTP: 'OTP உள்ளிடவும்',
      sendingOTP: 'OTP அனுப்புகிறது...',
      verifying: 'சரிபார்க்கிறது...',
      mobileNumber: 'மொபைல் எண்',
      enterMobileOTP: 'OTP பெற உங்கள் மொபைல் எண்ணை உள்ளிடவும்',
      welcomePatient: 'நோயாளி வரவேற்கிறோம்',
      welcomeDoctor: 'மருத்துவர் வரவேற்கிறோம்',
      welcomeHospital: 'மருத்துவமனை வரவேற்கிறோம்',
      patientTagline: 'எளிதாக சந்திப்புகளை பதிவு செய்யுங்கள்',
      doctorTagline: 'உங்கள் சந்திப்புகள் மற்றும் நோயாளிகளை நிர்வகிக்கவும்',
      hospitalTagline: 'உங்கள் மருத்துவர்கள் மற்றும் சந்திப்புகளை நிர்வகிக்கவும்',
      securePrivate: 'பாதுகாப்பான மற்றும் தனிப்பட்ட',
      easyToUse: 'பயன்படுத்த எளிதானது',
      access24x7: '24/7 அணுகல்',
      brandTagline: 'உங்கள் ஆரோக்கியம், எங்கள் முன்னுரிமை',
      copyrightText: '© 2025 ஹெல்த்கேர் போர்ட்டல். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      healthCare: 'ஹெல்த்கேர்',
    },

    portals: {
      patientPortal: 'நோயாளி போர்ட்டல்',
      doctorPortal: 'மருத்துவர் போர்ட்டல்',
      hospitalPortal: 'மருத்துவமனை போர்ட்டல்',
      patientSignIn: 'நோயாளி உள்நுழைவு',
      doctorSignIn: 'மருத்துவர் உள்நுழைவு',
      hospitalSignIn: 'மருத்துவமனை உள்நுழைவு',
    },

    patient: {
      profile: 'சுயவிவரம்',
      editProfile: 'சுயவிவரத்தை திருத்து',
      myAppointments: 'என் சந்திப்புகள்',
      bookAppointment: 'சந்திப்பு பதிவு',
      patientName: 'நோயாளி பெயர்',
      patientPhone: 'நோயாளி தொலைபேசி',
      patientDetails: 'நோயாளி விவரங்கள்',
      appointeeName: 'சந்திப்பாளர் பெயர்',
      appointeeAge: 'சந்திப்பாளர் வயது',
      appointeeGender: 'சந்திப்பாளர் பாலினம்',
      appointeePhone: 'சந்திப்பாளர் தொலைபேசி',
    },

    doctor: {
      prefix: 'டாக்.',
      doctor: 'மருத்துவர்',
      doctorName: 'மருத்துவர் பெயர்',
      doctorDetails: 'மருத்துவர் விவரங்கள்',
      specialization: 'சிறப்பு',
      experience: 'அனுபவம்',
      qualification: 'தகுதி',
      qualifications: 'தகுதிகள்',
      freeSlots: 'இலவச இடங்கள்',
      mySlots: 'என் இடங்கள்',
      todaysSlots: 'இன்றைய இடங்கள்',
      addDoctor: 'மருத்துவரை சேர்',
      editDoctor: 'மருத்துவரை திருத்து',
      deleteDoctor: 'மருத்துவரை நீக்கு',
      doctors: 'மருத்துவர்கள்',
      onLeave: 'விடுப்பில்',
      years: 'ஆண்டுகள்',
      contact: 'தொடர்பு',
      noDoctorDetails: 'மருத்துவர் விவரங்கள் கிடைக்கவில்லை.',
      loadingDoctorDetails: 'மருத்துவர் விவரங்களை ஏற்றுகிறது...',
      bookNow: 'இப்போது பதிவு செய்',
    },

    hospital: {
      hospitalName: 'மருத்துவமனை பெயர்',
      hospitalDetails: 'மருத்துவமனை விவரங்கள்',
      manageDoctors: 'மருத்துவர்களை நிர்வகி',
      manageAppointments: 'சந்திப்புகளை நிர்வகி',
      addNewDoctor: 'புதிய மருத்துவரை சேர்',
    },

    appointments: {
      appointment: 'சந்திப்பு',
      appointments: 'சந்திப்புகள்',
      appointmentDetails: 'சந்திப்பு விவரங்கள்',
      appointmentTime: 'சந்திப்பு நேரம்',
      appointmentDate: 'சந்திப்பு தேதி',
      bookAppointment: 'சந்திப்பு பதிவு செய்',
      cancelAppointment: 'சந்திப்பை ரத்து செய்',
      rescheduleAppointment: 'சந்திப்பை மாற்று',
      completeAppointment: 'சந்திப்பை முடி',
      viewAppointment: 'சந்திப்பைப் பார்',
      noAppointments: 'சந்திப்புகள் இல்லை',
      upcomingAppointments: 'வரவிருக்கும் சந்திப்புகள்',
      pastAppointments: 'முந்தைய சந்திப்புகள்',
      filterAppointments: 'சந்திப்புகளை வடிகட்டு',
      noAppointmentsBetween: 'இடையில் சந்திப்புகள் இல்லை',
      yrs: 'வயது',
      patientName: 'நோயாளி பெயர்',
      markAsComplete: 'முடிந்ததாக குறி',
      completing: 'முடிக்கிறது...',
      markAppointmentComplete: 'சந்திப்பை முடிந்ததாக குறி',
      followUpInformation: 'பின்தொடர் தகவல்',
      followUpDate: 'பின்தொடர் தேதி',
      completionNotes: 'முடிவு குறிப்புகள்',
      notes: 'குறிப்புகள்',
      scheduleFollowUp: 'தேவைப்பட்டால் பின்தொடர் சந்திப்பு திட்டமிடுங்கள்',
      provideDetails: 'முடிந்த சந்திப்பு பற்றிய விவரங்களை வழங்கவும்',
      diagnosisPlaceholder: 'நோய் கண்டறிதல், சிகிச்சை விவரங்கள் அல்லது வேறு தொடர்புடைய குறிப்புகளை சேர்க்கவும்...',
      cancelConfirmMessage: 'உங்கள் சந்திப்பை ரத்து செய்ய விரும்புகிறீர்களா',
      yesCancel: 'ஆம், ரத்து செய்',
      noKeepIt: 'இல்லை, வைத்திரு',
      notAvailable: 'கிடைக்கவில்லை',
    },

    filters: {
      filterAppointments: 'சந்திப்புகளை வடிகட்டு',
      dateRange: 'தேதி வரம்பு',
      previousDay: 'முந்தைய நாள்',
      nextDay: 'அடுத்த நாள்',
      to: 'முதல்',
      status: 'நிலை',
      allStatuses: 'அனைத்து நிலைகள்',
      search: 'தேடு',
      clear: 'அழி',
      showMoreFilters: 'மேலும் வடிப்பான்களைக் காட்டு',
      hideMoreFilters: 'வடிப்பான்களை மறை',
      doctorName: 'மருத்துவர் பெயர்',
      patientName: 'நோயாளி பெயர்',
      patientPhone: 'நோயாளி தொலைபேசி',
      searchByDoctorName: 'மருத்துவர் பெயரால் தேடவும்...',
      searchByPatientName: 'நோயாளி பெயரால் தேடவும்...',
      searchByPhoneNumber: 'தொலைபேசி எண்ணால் தேடவும்...',
    },

    status: {
      all: 'அனைத்தும்',
      booked: 'பதிவு செய்யப்பட்டது',
      cancelled: 'ரத்து செய்யப்பட்டது',
      completed: 'முடிந்தது',
      pending: 'நிலுவையில்',
      scheduled: 'திட்டமிடப்பட்டது',
      rescheduled: 'மாற்றப்பட்டது',
      noShow: 'வரவில்லை',
      confirmed: 'உறுதி செய்யப்பட்டது',
    },

    slots: {
      slot: 'இடம்',
      slots: 'இடங்கள்',
      slotTime: 'இட நேரம்',
      availableSlots: 'கிடைக்கும் இடங்கள்',
      noSlots: 'இடங்கள் இல்லை',
      selectSlot: 'இடத்தைத் தேர்ந்தெடு',
      slotTemplate: 'இட வார்ப்புரு',
      slotTemplates: 'இட வார்ப்புருக்கள்',
      manageSlots: 'இடங்களை நிர்வகி',
      addSlot: 'இடத்தை சேர்',
      deleteSlot: 'இடத்தை நீக்கு',
    },

    leaves: {
      leaves: 'விடுப்புகள்',
      doctorLeaves: 'மருத்துவர் விடுப்புகள்',
      addLeave: 'விடுப்பு சேர்',
      deleteLeave: 'விடுப்பை நீக்கு',
      onLeaveMessage: 'மருத்துவர் இந்த நாளில் விடுப்பில் உள்ளார் — பதிவு செய்ய முடியாது.',
      noLeavesAdded: 'இன்னும் விடுப்புகள் சேர்க்கப்படவில்லை',
    },

    profileFields: {
      name: 'பெயர்',
      firstName: 'முதல் பெயர்',
      lastName: 'கடைசி பெயர்',
      email: 'மின்னஞ்சல்',
      phone: 'தொலைபேசி',
      phoneNumber: 'தொலைபேசி எண்',
      address: 'முகவரி',
      age: 'வயது',
      gender: 'பாலினம்',
      dateOfBirth: 'பிறந்த தேதி',
      bloodGroup: 'இரத்த வகை',
      profileImage: 'சுயவிவர படம்',
      profileImageUploaded: 'சுயவிவர படம் பதிவேற்றப்பட்டது',
      updatePersonalInfo: 'உங்கள் தனிப்பட்ட தகவலை கீழே புதுப்பிக்கவும்',
      phoneCannotChange: 'தொலைபேசி எண்ணை மாற்ற முடியாது',
      enterFirstName: 'முதல் பெயரை உள்ளிடவும்',
      enterLastName: 'கடைசி பெயரை உள்ளிடவும்',
      enterEmail: 'patient@example.com',
      enterAddress: 'உங்கள் முகவரியை உள்ளிடவும்',
      selectGender: 'பாலினத்தை தேர்ந்தெடு',
      loadingProfile: 'சுயவிவரம் ஏற்றப்படுகிறது...',
      savingProfile: 'சேமிக்கிறது...',
      saveProfile: 'சுயவிவரத்தை சேமி',
    },

    gender: {
      male: 'ஆண்',
      female: 'பெண்',
      other: 'மற்றவை',
    },

    relationships: {
      spouse: 'மனைவி/கணவர்',
      father: 'அப்பா',
      mother: 'அம்மா',
      son: 'மகன்',
      daughter: 'மகள்',
      brother: 'அண்ணன்/தம்பி',
      sister: 'அக்கா/தங்கை',
      grandfather: 'தாத்தா',
      grandmother: 'பாட்டி',
      grandson: 'பேரன்',
      granddaughter: 'பேத்தி',
      uncle: 'மாமா/சித்தப்பா',
      aunt: 'அத்தை/மாமி',
      nephew: 'மருமகன்',
      niece: 'மருமகள்',
      cousin: 'உறவினர்',
      friend: 'நண்பர்',
      other: 'மற்றவை',
    },

    days: {
      monday: 'திங்கள்',
      tuesday: 'செவ்வாய்',
      wednesday: 'புதன்',
      thursday: 'வியாழன்',
      friday: 'வெள்ளி',
      saturday: 'சனி',
      sunday: 'ஞாயிறு',
    },

    forms: {
      personalInfo: 'தனிப்பட்ட தகவல்',
      contactInfo: 'தொடர்பு தகவல்',
      professionalInfo: 'தொழில்முறை தகவல்',
      additionalInfo: 'கூடுதல் தகவல்',
      required: 'தேவையானது',
      optional: 'விருப்பமானது',
    },

    actions: {
      showSlots: 'இடங்களைக் காட்டு',
      hideSlots: 'இடங்களை மறை',
      bookNow: 'இப்போது பதிவு செய்',
      cancelNow: 'இப்போது ரத்து செய்',
      saveChanges: 'மாற்றங்களை சேமி',
      discardChanges: 'மாற்றங்களை நிராகரி',
      confirmBooking: 'பதிவை உறுதி செய்',
      confirmCancellation: 'ரத்தை உறுதி செய்',
      confirmDeletion: 'நீக்குதலை உறுதி செய்',
    },

    ui: {
      availableSlots: 'கிடைக்கும் இடங்கள்',
      selectDateToView: 'கிடைக்கும் சந்திப்பு இடங்களைக் காண தேதியைத் தேர்ந்தெடுக்கவும்',
      selectDate: 'தேதியைத் தேர்ந்தெடு',
      availableTimeSlots: 'கிடைக்கும் நேர இடங்கள்',
      noSlotsForDate: 'இந்த தேதிக்கு இடங்கள் இல்லை',
      doctorOnLeave: 'இந்த நாளில் மருத்துவர் விடுப்பில் உள்ளார் — பதிவு முடக்கப்பட்டுள்ளது.',
      loadingSlots: 'இடங்கள் ஏற்றப்படுகின்றன...',
      bookAppointment: 'சந்திப்பை பதிவு செய்',
      bookYourAppointment: 'உங்கள் சந்திப்பை பதிவு செய்யவும்',
      appointeeInformation: 'சந்திப்பாளர் தகவல்',
      fullName: 'முழு பெயர்',
      age: 'வயது',
      phoneNumber: 'தொலைபேசி எண்',
      gender: 'பாலினம்',
      male: 'ஆண்',
      female: 'பெண்',
      other: 'மற்றவை',
      selectGender: 'பாலினத்தை தேர்ந்தெடு',
      namePlaceholder: 'ராஜ் குமார்',
      agePlaceholder: '25',
      phonePlaceholder: '9876543210',
      invalidPhone: 'தவறான தொலைபேசி எண்',
      on: 'அன்று',
      for: 'க்கு',
    },

    messages: MESSAGES_TA, // Tamil translations
  },
};

export function getTranslation(locale: Locale): Translations {
  return translations[locale];
}
