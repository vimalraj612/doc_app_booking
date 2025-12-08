import { useState, useEffect } from 'react';
import { InlineMessage } from '../ui/inline-message';
import { User, Doctor, Hospital } from '../../App';
import { Input } from '../ui/input';
import { PhoneInput } from '../ui/phone-input';
import SPECIALIZATION_OPTIONS from '../../constants/specializations';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useLocale } from '../../contexts/LocaleContext';
import { validateAndFormatPhone, removeCountryCode } from '../../utils/phoneUtils';
import { DoctorDTO } from '../../api/doctor';

interface AddDoctorFormProps {
  onSuccess: () => void;
  onAddDoctor: (doctor: Partial<DoctorDTO>) => Promise<void>;
  onUpdateDoctor?: (id: string, doctor: Partial<DoctorDTO>) => Promise<void>;
  initialDoctor?: Partial<DoctorDTO> | Partial<Doctor> | null;
  hospital?: Hospital;
  user: User;
  onSubmitError?: (message: string) => void;
}

export function AddDoctorForm({
  onSuccess,
  onAddDoctor,
  onUpdateDoctor,
  initialDoctor = null,
  hospital,
  user,
  onSubmitError,
}: AddDoctorFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    // Only show/dismiss error banner for backend (submit) errors
    if (!errors.submit && !formError) return;
    if (errors.submit) setFormError(errors.submit);
    if (formError && errors.submit) {
      const timeout = setTimeout(() => setFormError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [errors.submit, formError]);
  const { t } = useLocale();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [qualifications, setQualifications] = useState('');
  const [profileBase64, setProfileBase64] = useState<string | null>(null);
  const [imageContentType, setImageContentType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // ...existing code...

  const namePattern = /^[a-zA-Z\s\-.']+$/;
  const departmentPattern = /^$|^[a-zA-Z\s\-.'&]+$/;

  const validate = () => {
    const errs: { [k: string]: string } = {};

    if (!firstName || !firstName.trim()) errs.firstName = t.messages.VALIDATION.FIRST_NAME_REQUIRED;
    else if (firstName.length > 100) errs.firstName = t.messages.VALIDATION.FIRST_NAME_MAX;
    else if (!namePattern.test(firstName)) errs.firstName = t.messages.VALIDATION.FIRST_NAME_INVALID;

    if (!lastName || !lastName.trim()) errs.lastName = t.messages.VALIDATION.LAST_NAME_REQUIRED;
    else if (lastName.length > 100) errs.lastName = t.messages.VALIDATION.LAST_NAME_MAX;
    else if (!namePattern.test(lastName)) errs.lastName = t.messages.VALIDATION.LAST_NAME_INVALID;

    if (!email || !email.trim()) errs.email = t.messages.VALIDATION.EMAIL_REQUIRED;
    else if (email.length > 200) errs.email = t.messages.VALIDATION.EMAIL_MAX;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t.messages.VALIDATION.EMAIL_INVALID;

    if (!phoneNumber || !phoneNumber.trim()) {
      errs.phoneNumber = t.messages.VALIDATION.PHONE_REQUIRED;
    } else {
      const validation = validateAndFormatPhone(phoneNumber);
      if (!validation.isValid) {
        errs.phoneNumber = validation.error || t.messages.VALIDATION.PHONE_INVALID;
      }
    }

    if (!specialization || !specialization.trim()) errs.specialization = t.messages.VALIDATION.SPECIALIZATION_REQUIRED;
    else if (specialization.length > 200) errs.specialization = t.messages.VALIDATION.SPECIALIZATION_MAX;
    else if (!SPECIALIZATION_OPTIONS.find(o => o.value === specialization)) errs.specialization = t.messages.VALIDATION.SPECIALIZATION_INVALID;

    if (department && department.length > 200) errs.department = t.messages.VALIDATION.DEPARTMENT_MAX;
    else if (department && !departmentPattern.test(department)) errs.department = t.messages.VALIDATION.DEPARTMENT_INVALID;

    if (experienceYears !== '' && (Number(experienceYears) < 0 || Number(experienceYears) > 70)) errs.experienceYears = t.messages.VALIDATION.EXPERIENCE_RANGE;

    if (qualifications && qualifications.length > 1000) errs.qualifications = t.messages.VALIDATION.QUALIFICATIONS_MAX;

    if (imageContentType && imageContentType.length > 100) errs.imageContentType = t.messages.VALIDATION.IMAGE_TYPE_MAX;

    // Image size validation is handled in handleImage function

    return errs;
  };

  const handleImage = (file?: File) => {
    if (!file) {
      setProfileBase64(null);
      setImageContentType(null);
      return;
    }

    const maxSize = 1024 * 1024 * 2; // 2MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        profileBase64: 'Image size must be less than 2MB'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;
      const parts = result.split(',');
      if (parts.length !== 2) return;
      const meta = parts[0] || '';
      const base64 = parts[1] || '';
      const m = meta.match(/data:(.*);base64/);
      if (m && m[1]) {
        setImageContentType(m[1]);
        setProfileBase64(base64);
        setErrors(prev => {
          const { profileBase64, ...rest } = prev;
          return rest;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Do NOT show top-level error banner for input validation errors
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const phoneValidation = validateAndFormatPhone(phoneNumber);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.error || 'Invalid phone number');
      }

      // Get hospital ID from the user prop (already passed from parent)
      if (!user || !user.id) {
        const message = 'No user found. Please log in again.';
        setErrors({ submit: message });
        onSubmitError?.(message);
        setSubmitting(false);
        return;
      }

      const hospitalId = Number(user.id);
      if (isNaN(hospitalId) || hospitalId <= 0) {
        const message = `Invalid hospital ID format: "${user.id}". Expected a numeric ID.`;
        setErrors({ submit: message });
        onSubmitError?.(message);
        setSubmitting(false);
        return;
      }

      const doctorData: Partial<DoctorDTO> = {
        firstName,
        lastName,
        email,
        phoneNumber: phoneValidation.formattedPhone,
        specialization,
        department: department || undefined,
        experienceYears: experienceYears !== '' ? Number(experienceYears) : undefined,
        qualifications: qualifications || undefined,
        profileImage: profileBase64 || undefined,
        imageContentType: imageContentType || undefined,
        hospitalId: hospitalId,
      };

      console.log('User from props:', user);
      console.log('Hospital ID (string):', user.id);
      console.log('Hospital ID (number):', hospitalId);
      console.log('Doctor data before submit:', doctorData);

      let response: any = undefined;
      if (initialDoctor && 'id' in initialDoctor && initialDoctor.id) {
        if (onUpdateDoctor) {
          response = await onUpdateDoctor(String(initialDoctor.id), doctorData);
        }
      } else {
        response = await onAddDoctor(doctorData);
      }

      // Always extract only the error message string from backend response
      if (response && typeof response === 'object' && 'success' in response && response.success === false) {
        let message = 'Failed to save doctor';
        // Try to extract message string from various possible payload shapes
        if (typeof response.message === 'string') {
          message = response.message;
        } else if (response.message && typeof response.message === 'object') {
          // If message is an object, look for a 'message' property
          if (typeof response.message.message === 'string') {
            message = response.message.message;
          } else {
            // If message is not a string, fallback to generic
            message = 'Failed to save doctor';
          }
        } else if (typeof response === 'string') {
          // If response itself is a string, use it
          message = response;
        }
        // Remove any JSON or object formatting if present
        if (typeof message !== 'string') message = 'Failed to save doctor';
        // Defensive: strip out any curly braces or JSON formatting
        message = String(message);
        if (message.startsWith('{') && message.includes('message')) {
          try {
            const parsed = JSON.parse(message);
            if (parsed && typeof parsed.message === 'string') message = parsed.message;
          } catch { }
        }
        setErrors({ submit: message });
        setFormError(message);
        onSubmitError?.(message);
        setSubmitting(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error submitting doctor:', err);
      const message = err.message || 'Failed to save doctor';
      setErrors({ submit: message });
      setFormError(message);
      onSubmitError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!initialDoctor) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setSpecialization('');
      setDepartment('');
      setExperienceYears('');
      setQualifications('');
      setProfileBase64(null);
      setImageContentType(null);
      return;
    }

    const hasPhoto = 'photo' in initialDoctor;
    const isDTO = 'firstName' in initialDoctor || 'lastName' in initialDoctor;

    if (isDTO) {
      const dto = initialDoctor as Partial<DoctorDTO>;
      setFirstName(dto.firstName || dto.name?.split(' ')?.[0] || '');
      setLastName(dto.lastName || (dto.name ? dto.name.split(' ').slice(1).join(' ') : ''));
      setEmail(dto.email || '');
      setPhoneNumber(dto.phoneNumber ? removeCountryCode(dto.phoneNumber) : '');
      setSpecialization(dto.specialization || '');
      setDepartment(dto.department || '');
      setExperienceYears(dto.experienceYears ?? '');
      setQualifications(dto.qualifications || '');
      if (dto.profileImage && dto.imageContentType) {
        setProfileBase64(dto.profileImage as string);
        setImageContentType(dto.imageContentType as string);
      } else {
        setProfileBase64(null);
        setImageContentType(null);
      }
    } else {
      const ui = initialDoctor as Partial<Doctor>;
      setFirstName(ui.name?.split(' ')?.[0] || '');
      setLastName(ui.name ? ui.name.split(' ').slice(1).join(' ') : '');
      setEmail(ui.email || '');
      setPhoneNumber(ui.phoneNumber ? removeCountryCode(ui.phoneNumber) : '');
      setSpecialization(ui.specialization || '');
      setDepartment(ui.department || '');
      setExperienceYears(ui.experienceYears ?? '');
      setQualifications(ui.qualifications || '');

      if (hasPhoto && ui.photo && ui.photo.startsWith('data:')) {
        const parts = ui.photo.split(',');
        if (parts.length === 2) {
          const meta = parts[0] || '';
          const base64 = parts[1] || '';
          const m = meta.match(/data:(.*);base64/);
          if (m && m[1]) {
            setImageContentType(m[1]);
            setProfileBase64(base64);
          }
        }
      } else {
        setProfileBase64(null);
        setImageContentType(null);
      }
    }
  }, [initialDoctor]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Only show error banner for backend (submit) errors */}
      {formError && errors.submit && (
        <InlineMessage type="error" message={formError} />
      )}
      {/* Personal Information Section */}
      <div className="heading_wrap space-y-4">
        <h3 className="heading text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_PERSONAL_INFO}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <Label htmlFor="firstName" className="text-sm font-medium">{t.messages.LABELS.FIRST_NAME} <span style={{ color: "red" }}>{t.messages.LABELS.REQUIRED}</span></Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder={t.messages.LABELS.PLACEHOLDER_FIRST_NAME}
            />
            {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
          </div>
          <div className="field">
            <Label htmlFor="lastName" className="text-sm font-medium">{t.messages.LABELS.LAST_NAME}<span style={{ color: "red" }}> {t.messages.LABELS.REQUIRED}</span></Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder={t.messages.LABELS.PLACEHOLDER_LAST_NAME}
            />
            {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="heading text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_CONTACT_INFO}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <Label htmlFor="email" className="text-sm font-medium">{t.messages.LABELS.EMAIL} <span style={{ color: "red" }}>{t.messages.LABELS.REQUIRED}</span></Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.messages.LABELS.PLACEHOLDER_EMAIL}
            />
            {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
          </div>
          <div className="field">
            <Label htmlFor="phone" className="text-sm font-medium">{t.messages.LABELS.PHONE_NUMBER}<span style={{ color: "red" }}>{t.messages.LABELS.REQUIRED}</span></Label>
            <PhoneInput
              id="phone"
              label=""
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              placeholder={t.messages.LABELS.PLACEHOLDER_PHONE}
              required
            />
            {errors.phoneNumber && (
              <div className="text-red-500 text-xs">{errors.phoneNumber}</div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="space-y-4">
        <h3 className="heading text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_PROFESSIONAL_INFO}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <Label htmlFor="specialization" className="text-sm font-medium">{t.messages.LABELS.SPECIALIZATION} <span style={{ color: "red" }}>{t.messages.LABELS.REQUIRED}</span></Label>
            <select
              id="specialization"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 8px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
            >
              <option value="">{t.messages.LABELS.PLACEHOLDER_SELECT_SPECIALIZATION}</option>
              {SPECIALIZATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.specialization && <div className="text-red-500 text-xs">{errors.specialization}</div>}
          </div>
          <div className="field">
            <Label htmlFor="department" className="text-sm font-medium">{t.messages.LABELS.DEPARTMENT}</Label>
            <Input
              id="department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder={t.messages.LABELS.PLACEHOLDER_DEPARTMENT}
            />
            {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
          </div>
          <div className="field">
            <Label htmlFor="experienceYears" className="text-sm font-medium">{t.messages.LABELS.EXPERIENCE_YEARS}</Label>
            <Input
              id="experienceYears"
              type="number"
              value={experienceYears}
              onChange={e => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={t.messages.LABELS.PLACEHOLDER_EXPERIENCE}
            />
            {errors.experienceYears && <div className="text-red-500 text-xs">{errors.experienceYears}</div>}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="heading text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_ADDITIONAL_INFO}</h3>
        <div className="field">
          <Label htmlFor="qualifications" className="text-sm font-medium">{t.messages.LABELS.QUALIFICATIONS}</Label>
          <textarea
            id="qualifications"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={qualifications}
            onChange={e => setQualifications(e.target.value)}
            placeholder={t.messages.LABELS.PLACEHOLDER_QUALIFICATIONS}
          />
          {errors.qualifications && <div className="text-red-500 text-xs">{errors.qualifications}</div>}
        </div>
        <div className="field">
          <Label htmlFor="profileImage" className="text-sm font-medium">{t.messages.LABELS.PROFILE_IMAGE}</Label>
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={e => handleImage(e.target.files?.[0])}
          />
          {errors.profileBase64 && <div className="text-red-500 text-xs">{errors.profileBase64}</div>}
          {profileBase64 && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <img
                src={`data:${imageContentType};base64,${profileBase64}`}
                alt="Profile preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{t.messages.LABELS.PROFILE_IMAGE_UPLOADED}</p>
                <p className="text-xs text-gray-500 mt-1">{t.messages.LABELS.PREVIEW_DESCRIPTION}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 mt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="w-full btn_theme_secondary"
        >
          {t.messages.LABELS.CANCEL}
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white btn_theme"
        >
          {submitting ? t.messages.LABELS.SAVE : (initialDoctor ? t.messages.LABELS.EDIT_DOCTOR : t.messages.LABELS.ADD_NEW_DOCTOR)}
        </Button>
      </div>
    </form>
  );
}
