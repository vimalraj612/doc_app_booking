/**
 * Centralized Dropdown Options
 * 
 * This file contains all dropdown options used across the application.
 * Each option has a KEY (stored in database) and a LABEL (translation key for display)
 * 
 * Usage:
 * 1. Save the KEY to the database
 * 2. Use the translation key to display localized label
 * 3. Use helper functions to get labels or keys
 */

import { Translations } from './locales';

// ==================== GENDER OPTIONS ====================
export const GENDER_KEYS = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type GenderKey = typeof GENDER_KEYS[keyof typeof GENDER_KEYS];

export const GENDER_OPTIONS = [
  { key: GENDER_KEYS.MALE, translationKey: 'gender.male' as const },
  { key: GENDER_KEYS.FEMALE, translationKey: 'gender.female' as const },
  { key: GENDER_KEYS.OTHER, translationKey: 'gender.other' as const },
];

/**
 * Get gender label from translations
 */
export const getGenderLabel = (key: string | null | undefined, t: Translations): string => {
  if (!key) return '';
  const upperKey = key.toUpperCase();
  const option = GENDER_OPTIONS.find(opt => opt.key === upperKey);
  if (!option) return key;
  
  // Navigate the translation path
  const parts = option.translationKey.split('.');
  let result: any = t;
  for (const part of parts) {
    result = result[part];
  }
  return result || key;
};

// ==================== APPOINTMENT STATUS OPTIONS ====================
export const APPOINTMENT_STATUS_KEYS = {
  ALL: 'ALL',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
} as const;

export type AppointmentStatusKey = typeof APPOINTMENT_STATUS_KEYS[keyof typeof APPOINTMENT_STATUS_KEYS];

export const APPOINTMENT_STATUS_OPTIONS = [
  { key: APPOINTMENT_STATUS_KEYS.ALL, translationKey: 'status.all' as const },
  { key: APPOINTMENT_STATUS_KEYS.SCHEDULED, translationKey: 'status.scheduled' as const },
  { key: APPOINTMENT_STATUS_KEYS.COMPLETED, translationKey: 'status.completed' as const },
  { key: APPOINTMENT_STATUS_KEYS.CANCELLED, translationKey: 'status.cancelled' as const },
  { key: APPOINTMENT_STATUS_KEYS.RESCHEDULED, translationKey: 'status.rescheduled' as const },
  { key: APPOINTMENT_STATUS_KEYS.PENDING, translationKey: 'status.pending' as const },
  { key: APPOINTMENT_STATUS_KEYS.CONFIRMED, translationKey: 'status.confirmed' as const },
];

/**
 * Get appointment status label from translations
 */
export const getAppointmentStatusLabel = (key: string | null | undefined, t: Translations): string => {
  if (!key) return '';
  const upperKey = key.toUpperCase();
  const option = APPOINTMENT_STATUS_OPTIONS.find(opt => opt.key === upperKey);
  if (!option) return key;
  
  const parts = option.translationKey.split('.');
  let result: any = t;
  for (const part of parts) {
    result = result[part];
  }
  return result || key;
};

/**
 * Get status options with localized labels for dropdowns
 * @param t - Translations object
 * @param includeAll - Whether to include "All" option
 */
export const getAppointmentStatusOptions = (t: Translations, includeAll: boolean = false) => {
  const options = APPOINTMENT_STATUS_OPTIONS
    .filter(opt => includeAll || opt.key !== APPOINTMENT_STATUS_KEYS.ALL)
    .map(opt => {
      const parts = opt.translationKey.split('.');
      let label: any = t;
      for (const part of parts) {
        label = label[part];
      }
      return {
        key: opt.key,
        value: opt.key,
        label: label || opt.key,
      };
    });
  
  return options;
};

/**
 * Get gender options with localized labels for dropdowns
 */
export const getGenderOptions = (t: Translations) => {
  return GENDER_OPTIONS.map(opt => {
    const parts = opt.translationKey.split('.');
    let label: any = t;
    for (const part of parts) {
      label = label[part];
    }
    return {
      key: opt.key,
      value: opt.key,
      label: label || opt.key,
    };
  });
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Generic helper to get label from translation key
 */
export const getLabelFromTranslationKey = (translationKey: string, t: Translations): string => {
  const parts = translationKey.split('.');
  let result: any = t;
  for (const part of parts) {
    if (result && typeof result === 'object') {
      result = result[part];
    } else {
      return translationKey;
    }
  }
  return result || translationKey;
};
