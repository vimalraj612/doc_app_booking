import { useState, useEffect } from 'react';
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
}

export function AddDoctorForm({ 
  onSuccess, 
  onAddDoctor, 
  onUpdateDoctor, 
  initialDoctor = null, 
  hospital, 
  user 
}: AddDoctorFormProps) {
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
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

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
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const phoneValidation = validateAndFormatPhone(phoneNumber);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.error || 'Invalid phone number');
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
        hospitalId: Number(hospital?.id),
      };

      if (initialDoctor && 'id' in initialDoctor && initialDoctor.id) {
        if (onUpdateDoctor) {
          await onUpdateDoctor(String(initialDoctor.id), doctorData);
        }
      } else {
        await onAddDoctor(doctorData);
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error submitting doctor:', err);
      setErrors({ submit: err.message || 'Failed to save doctor' });
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
      {/* Personal Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_PERSONAL_INFO}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">{t.messages.LABELS.FIRST_NAME} {t.messages.LABELS.REQUIRED}</Label>
            <Input 
              id="firstName" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
              placeholder={t.messages.LABELS.PLACEHOLDER_FIRST_NAME} 
            />
            {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">{t.messages.LABELS.LAST_NAME} {t.messages.LABELS.REQUIRED}</Label>
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
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_CONTACT_INFO}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">{t.messages.LABELS.EMAIL} {t.messages.LABELS.REQUIRED}</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder={t.messages.LABELS.PLACEHOLDER_EMAIL} 
            />
            {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
          </div>
          <PhoneInput 
            id="phone" 
            label={t.messages.LABELS.PHONE_NUMBER}
            value={phoneNumber} 
            onChange={(value) => setPhoneNumber(value)} 
            placeholder={t.messages.LABELS.PLACEHOLDER_PHONE}
            error={errors.phoneNumber}
            required
          />
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_PROFESSIONAL_INFO}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-sm font-medium">{t.messages.LABELS.SPECIALIZATION} {t.messages.LABELS.REQUIRED}</Label>
            <select 
              id="specialization"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">{t.messages.LABELS.DEPARTMENT}</Label>
            <Input 
              id="department" 
              value={department} 
              onChange={e => setDepartment(e.target.value)} 
              placeholder={t.messages.LABELS.PLACEHOLDER_DEPARTMENT} 
            />
            {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
          </div>
          <div className="space-y-2">
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
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.SECTION_ADDITIONAL_INFO}</h3>
        <div className="space-y-2">
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
        <div className="space-y-2">
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

      {errors.submit && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
          {errors.submit}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-6 mt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
          className="w-full"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          {submitting ? 'Saving...' : (initialDoctor ? 'Update Doctor' : 'Add Doctor')}
        </Button>
      </div>
    </form>
  );
}
