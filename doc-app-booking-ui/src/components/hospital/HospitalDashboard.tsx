import { useState } from 'react';
import { useRef } from 'react';
import { User, Doctor, Appointment, Hospital } from '../../App';
import { Card, CardContent } from '../ui/card';
import { LogOut, Plus, User as UserIcon, Stethoscope, Calendar, Building2, LayoutTemplate, CalendarDays, CalendarCheck, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import SPECIALIZATION_OPTIONS from '../../constants/specializations';
import { Label } from '../ui/label';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { InlineMessage } from '../ui/inline-message';
import { ValidationMessages, DoctorMessages, SlotTemplateMessages, AppointmentMessages } from '../../constants/messages';

import { useEffect } from 'react';
import { fetchDoctorsByHospitalId, addDoctor, updateDoctor, fetchSlotTemplatesByDoctorId, createOrUpdateSlotTemplate, deleteSlotTemplate, SlotTemplateDTO, DoctorDTO } from '../../api/doctor';
import { fetchHospitalAppointmentsByDateRange, updateAppointmentStatusApi, fetchHospitalTodaysAppointmentCount } from '../../api/appointments';
import AppointmentsList from '../common/AppointmentsList';
import DoctorAvailableSlot from './DoctorAvailableSlot';
import DoctorLeaves from './DoctorLeaves';
interface HospitalDashboardProps {
  user: User;
  appointments: Appointment[];
  hospitals: Hospital[];
  onLogout: () => void;
  onDeleteDoctor: (doctorId: string) => void;
}

// Inline AddDoctorForm component definition
interface AddDoctorFormProps {
  onSuccess: () => void;
  onAddDoctor: (doctor: Partial<DoctorDTO>) => Promise<void>;
  onUpdateDoctor?: (id: string, doctor: Partial<DoctorDTO>) => Promise<void>;
  // initialDoctor may be a backend DTO or the simpler UI Doctor shape
  initialDoctor?: Partial<DoctorDTO> | Partial<Doctor> | null;
  hospital?: Hospital;
  user: User;
}


function AddDoctorForm({ onSuccess, onAddDoctor, onUpdateDoctor, initialDoctor = null, hospital, user }: AddDoctorFormProps) {
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
  // Specialization is selected from a canonical list; validate against that list instead of a regex
  const departmentPattern = /^$|^[a-zA-Z\s\-.'&]+$/;
  const phonePattern = /^[+]?([1-9]\d{1,14})$/;

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!firstName || !firstName.trim()) errs.firstName = ValidationMessages.FIRST_NAME_REQUIRED;
    else if (firstName.length > 100) errs.firstName = ValidationMessages.FIRST_NAME_MAX;
    else if (!namePattern.test(firstName)) errs.firstName = ValidationMessages.FIRST_NAME_INVALID;

    if (!lastName || !lastName.trim()) errs.lastName = ValidationMessages.LAST_NAME_REQUIRED;
    else if (lastName.length > 100) errs.lastName = ValidationMessages.LAST_NAME_MAX;
    else if (!namePattern.test(lastName)) errs.lastName = ValidationMessages.LAST_NAME_INVALID;

    if (!email || !email.trim()) errs.email = ValidationMessages.EMAIL_REQUIRED;
    else if (email.length > 200) errs.email = ValidationMessages.EMAIL_MAX;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = ValidationMessages.EMAIL_INVALID;

    if (!phoneNumber || !phoneNumber.trim()) errs.phoneNumber = ValidationMessages.PHONE_REQUIRED;
    else if (phoneNumber.length > 20) errs.phoneNumber = ValidationMessages.PHONE_MAX;
    else if (!phonePattern.test(phoneNumber)) errs.phoneNumber = ValidationMessages.PHONE_INVALID;

    if (!specialization || !specialization.trim()) errs.specialization = ValidationMessages.SPECIALIZATION_REQUIRED;
    else if (specialization.length > 200) errs.specialization = ValidationMessages.SPECIALIZATION_MAX;
    else if (!SPECIALIZATION_OPTIONS.find(o => o.value === specialization)) errs.specialization = ValidationMessages.SPECIALIZATION_INVALID;

    if (department && department.length > 200) errs.department = ValidationMessages.DEPARTMENT_MAX;
    else if (department && !departmentPattern.test(department)) errs.department = ValidationMessages.DEPARTMENT_INVALID;

    if (experienceYears !== '' && (Number(experienceYears) < 0 || Number(experienceYears) > 70)) errs.experienceYears = ValidationMessages.EXPERIENCE_RANGE;

    if (qualifications && qualifications.length > 1000) errs.qualifications = ValidationMessages.QUALIFICATIONS_MAX;

    if (imageContentType && imageContentType.length > 100) errs.imageContentType = ValidationMessages.IMAGE_TYPE_MAX;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    
    // Check file size (3MB = 3 * 1024 * 1024 bytes)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ 
        ...prev, 
        imageContentType: `Image size must be less than 3MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      }));
      return;
    }
    
    // Clear any previous image error
    setErrors(prev => {
      const { imageContentType, ...rest } = prev;
      return rest;
    });
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is data:<mime>;base64,...
      const parts = result.split(',');
      const meta = parts[0] || '';
      const base64 = parts[1] || '';
      const m = meta.match(/data:(.*);base64/);
      setImageContentType(m ? m[1] : null);
      setProfileBase64(base64 || null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const doctorPayload: any = {
      name,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      specialization: specialization.trim(),
      department: department.trim() || undefined,
      experienceYears: experienceYears === '' ? undefined : Number(experienceYears),
      qualifications: qualifications.trim() || undefined,
      hospitalId: user.id,
      hospitalName: hospital?.name || user.name,
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
    };
    if (profileBase64) {
      doctorPayload.profileImage = profileBase64;
      doctorPayload.imageContentType = imageContentType;
    }
    try {
      if (initialDoctor && 'id' in initialDoctor && initialDoctor.id && onUpdateDoctor) {
        await onUpdateDoctor(String((initialDoctor as any).id), doctorPayload);
      } else {
        await onAddDoctor(doctorPayload);
      }
      // reset
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
      setErrors({});
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  // Prefill when editing
  useEffect(() => {
    if (!initialDoctor) return;
    
    // Check if this looks like a backend DTO (has firstName/lastName or profileImage fields)
    // vs UI Doctor shape (has photo field as data URL)
    const hasFirstName = 'firstName' in initialDoctor && initialDoctor.firstName;
    const hasProfileImage = 'profileImage' in initialDoctor && initialDoctor.profileImage;
    const hasPhoto = 'photo' in initialDoctor && initialDoctor.photo;
    const isDTO = hasFirstName || hasProfileImage;

    if (isDTO) {
      // Backend DTO format
      const dto = initialDoctor as Partial<DoctorDTO>;
      setFirstName(dto.firstName || dto.name?.split(' ')?.[0] || '');
      setLastName(dto.lastName || (dto.name ? dto.name.split(' ').slice(1).join(' ') : ''));
      setEmail(dto.email || '');
      setPhoneNumber(dto.phoneNumber || '');
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
      // UI Doctor shape
      const ui = initialDoctor as Partial<Doctor>;
      setFirstName(ui.name?.split(' ')?.[0] || '');
      setLastName(ui.name ? ui.name.split(' ').slice(1).join(' ') : '');
      setEmail(ui.email || '');
      setPhoneNumber(ui.phoneNumber || '');
      setSpecialization(ui.specialization || '');
      setDepartment(ui.department || '');
      setExperienceYears(ui.experienceYears ?? '');
      setQualifications(ui.qualifications || '');
      
      // Parse photo data URL back to base64 and content type
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
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">First name *</Label>
            <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" />
            {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">Last name *</Label>
            <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter last name" />
            {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@example.com" />
            {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone *</Label>
            <Input id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+919876543210" />
            {errors.phoneNumber && <div className="text-red-500 text-xs">{errors.phoneNumber}</div>}
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Professional Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-sm font-medium">Specialization *</Label>
            <select 
              id="specialization" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2" 
              value={specialization} 
              onChange={e => setSpecialization(e.target.value)}
            >
              <option value="">Select specialization</option>
              {SPECIALIZATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.specialization && <div className="text-red-500 text-xs">{errors.specialization}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">Department</Label>
            <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Cardiology, Surgery" />
            {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="experience" className="text-sm font-medium">Experience (years)</Label>
            <Input id="experience" type="number" min={0} max={70} value={experienceYears} onChange={e => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            {errors.experienceYears && <div className="text-red-500 text-xs">{errors.experienceYears}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualifications" className="text-sm font-medium">Qualifications</Label>
            <Input id="qualifications" value={qualifications} onChange={e => setQualifications(e.target.value)} placeholder="e.g. MBBS, MD" />
            {errors.qualifications && <div className="text-red-500 text-xs">{errors.qualifications}</div>}
          </div>
        </div>
      </div>

      {/* Profile Image Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Profile Image</h3>
        <div className="space-y-3">
          <Label htmlFor="profile" className="text-sm font-medium">Profile image (optional, max 3MB)</Label>
          {profileBase64 && imageContentType && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <img 
                src={`data:${imageContentType};base64,${profileBase64}`} 
                alt="Profile preview" 
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Current profile image</p>
                <p className="text-xs text-gray-500 mt-1 truncate">Type: {imageContentType}</p>
              </div>
            </div>
          )}
          <input 
            id="profile" 
            type="file" 
            accept="image/*" 
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); }} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
          />
          {!profileBase64 && !errors.imageContentType && (
            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF (max 3MB)</p>
          )}
          {errors.imageContentType && <div className="text-red-500 text-xs">{errors.imageContentType}</div>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 items-stretch pt-6 border-t mt-2">
        <Button type="button" variant="outline" onClick={() => {
          setFirstName(''); setLastName(''); setEmail(''); setPhoneNumber(''); setSpecialization(''); setDepartment(''); setExperienceYears(''); setQualifications(''); setProfileBase64(null); setImageContentType(null); setErrors({});
        }} className="w-full">
          Reset
        </Button>
        <Button type="submit" disabled={submitting} className="w-full bg-purple-500 hover:bg-purple-600">
          {submitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {initialDoctor ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            initialDoctor ? 'Update Doctor' : 'Add Doctor'
          )}
        </Button>
      </div>
    </form>
  );
}

export function HospitalDashboard({
  user,
  appointments,
  hospitals,
  onLogout,
  onDeleteDoctor
}: HospitalDashboardProps) {
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<DoctorDTO> | Partial<Doctor> | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string | null>(null);
  const hospital = hospitals.find(h => h.id === user.id);
  // Slot template modal state (ensure Slot Templates button works)
  const [slotTemplates, setSlotTemplates] = useState<SlotTemplateDTO[] | null>(null);
  const [slotTemplatesDoctor, setSlotTemplatesDoctor] = useState<string | null>(null);
  const [slotTemplatesLoading, setSlotTemplatesLoading] = useState(false);
  const [slotTemplatesError, setSlotTemplatesError] = useState('');
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [hospitalAppointments, setHospitalAppointments] = useState<any[]>([]);
  const [hospitalAppointmentsLoading, setHospitalAppointmentsLoading] = useState(false);
  const [hospitalAppointmentsError, setHospitalAppointmentsError] = useState('');
  // Today's appointments count (use hospital-specific endpoint)
  const [hospitalTodayCount, setHospitalTodayCount] = useState<number | null>(null);
  const [hospitalTodayLoading, setHospitalTodayLoading] = useState(false);
  const [hospitalTodayError, setHospitalTodayError] = useState('');
  // AppointmentsList state (to match other pages)
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const start = new Date(today);
    // default start = today
    start.setDate(today.getDate());
    const end = new Date(today);
    // default end = today + 2 days
    end.setDate(today.getDate() + 2);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });
  const statusOptions = [
    { key: 'ALL', label: 'All' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'RESCHEDULED', label: 'Rescheduled' },
    { key: 'PENDING', label: 'Pending' },
  ];
  const [cancelMsg, setCancelMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appt?: any }>({ open: false });
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);
  // Doctor delete confirmation
  const [doctorConfirmOpen, setDoctorConfirmOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);
  // Doctor slots modal state
  const [doctorSlotsOpen, setDoctorSlotsOpen] = useState(false);
  const [slotsDoctorId, setSlotsDoctorId] = useState<string | number | null>(null);
  // Doctor leaves modal state
  const [leavesOpen, setLeavesOpen] = useState(false);
  const [leavesDoctorId, setLeavesDoctorId] = useState<string | number | null>(null);
  const [leavesDoctorName, setLeavesDoctorName] = useState<string | null>(null);
  const [lastClickedDoctor, setLastClickedDoctor] = useState<string | null>(null);
  const lastRequestAtRef = useRef<number | null>(null);

  const extractErrorMessage = (err: any) => {
    // err may be an Error whose message is a JSON string or plain text
    try {
      if (!err) return 'Unknown error';
      const m = err?.message || err;
      if (!m) return 'Unknown error';
      // try parse JSON
      try {
        const parsed = JSON.parse(m);
        if (parsed && parsed.message) return String(parsed.message);
      } catch (_) {
        // not JSON
      }
      // if it's already an object
      if (typeof m === 'object' && m.message) return String(m.message);
      return String(m);
    } catch (_e) {
      return 'Unknown error';
    }
  };

  // Form state for creating/updating a slot template
  const [templateForm, setTemplateForm] = useState<{
    id?: number | null;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    active: boolean;
  }>({
    id: null,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 15,
    active: true,
  });

  const resetTemplateForm = () => setTemplateForm({ id: null, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 15, active: true });

  const [templateErrors, setTemplateErrors] = useState<{ [k: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Confirm dialog state for delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  const validateTemplateForm = () => {
    const errs: { [k: string]: string } = {};
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    if (!templateForm.startTime) errs.startTime = ValidationMessages.START_TIME_REQUIRED;
    if (!templateForm.endTime) errs.endTime = ValidationMessages.END_TIME_REQUIRED;
    if (templateForm.startTime && templateForm.endTime) {
      const s = toMinutes(templateForm.startTime);
      const e = toMinutes(templateForm.endTime);
      if (e <= s) errs.endTime = ValidationMessages.END_TIME_AFTER_START;
      if (e - s < templateForm.slotDurationMinutes) errs.endTime = ValidationMessages.DURATION_MUST_FIT;
    }
    if (!templateForm.slotDurationMinutes || templateForm.slotDurationMinutes < 5) errs.slotDurationMinutes = ValidationMessages.DURATION_MIN_5;
    setTemplateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveSlotTemplate = async (doctorId?: string) => {
    const docId = doctorId || slotTemplatesDoctor;
    if (!docId) {
      setSlotTemplatesError(SlotTemplateMessages.NO_DOCTOR_SELECTED);
      window.setTimeout(() => setSlotTemplatesError(''), 3500);
      return;
    }
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    // validate first
    if (!validateTemplateForm()) {
      setSlotTemplatesLoading(false);
      return;
    }
    try {
      const payload: Partial<SlotTemplateDTO> = {
        id: templateForm.id ?? undefined as any,
        doctorId: Number(docId),
        dayOfWeek: templateForm.dayOfWeek,
        startTime: templateForm.startTime,
        endTime: templateForm.endTime,
        slotDurationMinutes: Number(templateForm.slotDurationMinutes),
      };
      const resp: any = await createOrUpdateSlotTemplate(docId, payload);
      // refresh list
      const data = await fetchSlotTemplatesByDoctorId(docId);
      setSlotTemplates(data);
      resetTemplateForm();
      setTemplateErrors({});
      const msg = (resp && (resp.message || (resp.data && (resp.data.message || undefined)))) || SlotTemplateMessages.SAVED_SUCCESS;
      setSuccessMessage(msg);
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to save slot template', e);
      setSlotTemplatesError(extractErrorMessage(e) || SlotTemplateMessages.SAVE_FAILED);
      window.setTimeout(() => setSlotTemplatesError(''), 3500);
    } finally {
      setSlotTemplatesLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId?: number) => {
    // legacy helper kept for compatibility; prefer using confirm dialog
    if (!templateId) return;
    setConfirmTargetId(templateId);
    setConfirmOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    const templateId = confirmTargetId;
    if (!templateId) return setConfirmOpen(false);
    if (!slotTemplatesDoctor) {
      setSlotTemplatesError(SlotTemplateMessages.NO_DOCTOR_SELECTED);
      window.setTimeout(() => setSlotTemplatesError(''), 3500);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      return;
    }
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    try {
      const resp: any = await deleteSlotTemplate(templateId);
      const data = await fetchSlotTemplatesByDoctorId(slotTemplatesDoctor);
      setSlotTemplates(data);
      const msg = (resp && resp.message) || SlotTemplateMessages.DELETED_SUCCESS;
      setSuccessMessage(msg);
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to delete slot template', e);
      setSlotTemplatesError(extractErrorMessage(e) || SlotTemplateMessages.DELETE_FAILED);
      window.setTimeout(() => setSlotTemplatesError(''), 3500);
    } finally {
      setSlotTemplatesLoading(false);
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  const fetchDoctors = async () => {
    if (!user?.id) return;
    try {
      const backendDoctors = await fetchDoctorsByHospitalId(user.id);
      setDoctors(backendDoctors.map(d => ({
        id: d.id?.toString?.() ?? '',
        name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
        specialization: d.specialization || '',
        hospitalId: d.hospitalId?.toString?.() ?? '',
        hospitalName: d.hospitalName || '',
        email: d.email || '',
        photo: d.profileImage || d.imageContentType ? `data:${d.imageContentType};base64,${d.profileImage}` : '',
        qualifications: d.qualifications || '',
        phoneNumber: d.phoneNumber || '',
        department: d.department || '',
        experienceYears: d.experienceYears || 0,
      })));
    } catch (e) {
      setDoctors([]);
    }
  };

  const handleSlotTemplateClick = async (doctorId: string) => {
    setLastClickedDoctor(doctorId);
    console.log('HospitalDashboard (top-level): fetching slot templates for doctor', doctorId);
    // open dialog immediately for consistent UX on all viewports
    setSlotDialogOpen(true);
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    setSlotTemplatesDoctor(doctorId);
    try {
      const data = await fetchSlotTemplatesByDoctorId(doctorId);
      console.log('HospitalDashboard (top-level): fetched slot templates', data);
      setSlotTemplates(data);
    } catch (e: any) {
      console.error('HospitalDashboard (top-level): failed to fetch slot templates', e);
      setSlotTemplatesError(extractErrorMessage(e) || SlotTemplateMessages.LOADING_FAILED);
      window.setTimeout(() => setSlotTemplatesError(''), 3500);
      setSlotTemplates(null);
    } finally {
      setSlotTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Fetch hospital appointments when Appointments tab is selected
  useEffect(() => {
    const loadAppointments = async () => {
      if (activeTab !== 'appointments') return;
      if (!user?.id) return;
      // Use fetchAppointments below to keep consistent behaviour with dateRange/status
      await fetchAppointments();
    };
    void loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.id]);

  // Fetch today's count for Total Appts stat
  useEffect(() => {
    const loadTodayCount = async () => {
      if (!user?.id) return;
      setHospitalTodayLoading(true);
      setHospitalTodayError('');
      try {
        const resp = await fetchHospitalTodaysAppointmentCount({ hospitalId: user.id });
        const count = resp && typeof resp === 'object' && 'data' in resp ? resp.data : (typeof resp === 'number' ? resp : 0);
        setHospitalTodayCount(Number(count || 0));
      } catch (e: any) {
        setHospitalTodayError(extractErrorMessage(e) || DoctorMessages.TODAY_COUNT_FAILED);
        setHospitalTodayCount(null);
      } finally {
        setHospitalTodayLoading(false);
      }
    };
    void loadTodayCount();
  }, [user?.id]);

  // Fetch hospital appointments for given date range
  const fetchAppointments = async (customRange?: { start: string; end: string }) => {
    setHospitalAppointmentsLoading(true);
    setHospitalAppointmentsError('');
    const start = (customRange?.start || dateRange.start) + 'T00:00:00';
    const end = (customRange?.end || dateRange.end) + 'T23:59:59';
    try {
      const resp = await fetchHospitalAppointmentsByDateRange({ hospitalId: user.id, start, end });
      const appts = Array.isArray(resp) ? resp : (resp && typeof resp === 'object' && 'data' in resp ? resp.data : []);
      setHospitalAppointments(appts || []);
      setAppointmentsFetched(true);
    } catch (e: any) {
      setHospitalAppointmentsError(extractErrorMessage(e) || AppointmentMessages.LOADING_FAILED);
      setHospitalAppointments([]);
    } finally {
      setHospitalAppointmentsLoading(false);
    }
  };

  // Add doctor handler for the form
  const handleAddDoctor = async (doctor: Partial<DoctorDTO>) => {
    await addDoctor({
      ...doctor,
      hospitalId: Number(doctor.hospitalId),
    });
    await fetchDoctors();
  };

  const handleUpdateDoctor = async (id: string, doctor: Partial<DoctorDTO>) => {
    // call API
    await updateDoctor(id, {
      ...doctor,
      hospitalId: Number(doctor.hospitalId),
    } as any);
    await fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-500 bg-transparent" />
            <h1 className="text-lg sm:text-xl">Hospital Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={hospital?.photo} alt={hospital?.name} />
                <AvatarFallback>{(hospital?.name || 'Hospital').split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name}</span>
            </div>
            <Avatar className="sm:hidden w-8 h-8">
              <AvatarImage src={hospital?.photo} alt={hospital?.name} />
              <AvatarFallback>{(hospital?.name || 'H').split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600 bg-transparent" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Stethoscope className="w-8 h-8 text-green-500 mb-2 bg-transparent" />
              <p className="text-2xl">{doctors.length}</p>
              <p className="text-xs text-gray-500">Doctors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CalendarCheck className="w-8 h-8 text-purple-500 mb-2 bg-transparent" />
              <p className="text-2xl">{hospitalTodayLoading ? '...' : (hospitalTodayCount !== null ? hospitalTodayCount : appointments.length)}</p>
              <p className="text-xs text-gray-500">Total Appts</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Doctor Button inside Doctors Tab */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-3 mt-4">
            <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
              <DialogTrigger asChild>
                <button className="mb-4 w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 bg-transparent" />
                  Add New Doctor
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">{editingDoctor ? 'Update doctor information below' : 'Fill in the details to add a new doctor to your hospital'}</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <AddDoctorForm 
                    onSuccess={() => { setIsAddDoctorOpen(false); setEditingDoctor(null); }} 
                    onAddDoctor={handleAddDoctor}
                    onUpdateDoctor={handleUpdateDoctor}
                    initialDoctor={editingDoctor}
                    hospital={hospital}
                    user={user}
                  />
                </div>
              </DialogContent>
            </Dialog>
            {doctors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No doctors added yet
                </CardContent>
              </Card>
            ) : (
              doctors.map(doctor => (
                <Card key={doctor.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={doctor.photo} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base md:truncate">{doctor.name}</h3>
                          <div className="flex flex-col gap-1 mt-1 text-sm">
                            <span className="text-gray-600"><span className="font-medium">Specialization:</span> {doctor.specialization}</span>
                            {doctor.qualifications && (
                              <span className="text-gray-600"><span className="font-medium">Qualifications:</span> {doctor.qualifications}</span>
                            )}
                            <span className="text-gray-600"><span className="font-medium">Email:</span> {doctor.email}</span>
                            {doctor.phoneNumber && (
                              <span className="text-gray-600"><span className="font-medium">Phone:</span> {doctor.phoneNumber}</span>
                            )}
                            {doctor.department && (
                              <span className="text-gray-600"><span className="font-medium">Department:</span> {doctor.department}</span>
                            )}
                            {(doctor.experienceYears ?? 0) > 0 && (
                              <span className="text-gray-600"><span className="font-medium">Experience:</span> {doctor.experienceYears ?? 0} years</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-start min-w-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center"
                          title="Slot Templates"
                          onPointerDown={() => setLastClickedDoctor(doctor.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSlotTemplateClick(doctor.id);
                          }}
                        >
                          <span className="sm:hidden"><LayoutTemplate className="w-5 h-5 bg-transparent" /></span>
                          <span className="hidden sm:inline">Slot Templates</span>
                        </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center"
                            title="Slots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSlotsDoctorId(doctor.id);
                              setDoctorSlotsOpen(true);
                            }}
                          >
                            <span className="sm:hidden"><CalendarDays className="w-5 h-5 bg-transparent" /></span>
                            <span className="hidden sm:inline">Slots</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center"
                            title="Leaves"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeavesDoctorId(doctor.id);
                              setLeavesDoctorName(doctor.name);
                              setLeavesOpen(true);
                            }}
                          >
                            <span className="sm:hidden"><Calendar className="w-5 h-5 bg-transparent" /></span>
                            <span className="hidden sm:inline">Leaves</span>
                          </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" title="View appointments" onClick={() => { setSelectedDoctorFilter(doctor.name); setActiveTab('appointments'); }}>
                          <span className="sm:hidden"><CalendarCheck className="w-5 h-5 bg-transparent" /></span>
                          <span className="hidden sm:inline">Appointments</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" title="Edit" onClick={() => { setEditingDoctor(doctor); setIsAddDoctorOpen(true); }}>
                          <span className="sm:hidden"><Edit className="w-5 h-5 bg-transparent" /></span>
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => { setDoctorToDelete(doctor.id); setDoctorConfirmOpen(true); }} className="flex items-center justify-center" title="Delete">
                          <span className="sm:hidden"><Trash2 className="w-5 h-5 bg-transparent" /></span>
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {/* Slot Templates Modal/Section (Dialog for consistent UX) */}
            <Dialog open={slotDialogOpen} onOpenChange={(open) => { setSlotDialogOpen(open); if (!open) { setSlotTemplates(null); setSlotTemplatesError(''); resetTemplateForm(); } }}>
              <DialogContent className="max-w-2xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Slot Templates</DialogTitle>
                  <DialogDescription>Manage recurring slot templates for the selected doctor.</DialogDescription>
                </DialogHeader>

                {slotTemplatesLoading && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="w-40 h-4" />
                          <Skeleton className="w-24 h-3" />
                        </div>
                      </div>
                      <div className="w-24">
                        <Skeleton className="w-full h-8 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <Skeleton className="h-8 rounded col-span-1" />
                      <Skeleton className="h-8 rounded col-span-1" />
                      <Skeleton className="h-8 rounded col-span-1" />
                      <Skeleton className="h-8 rounded col-span-1" />
                    </div>
                  </div>
                )}

                {slotTemplatesError && (
                  <div className="p-2">
                    <InlineMessage type="error" message={slotTemplatesError} />
                    <div className="flex gap-2 justify-end mt-3">
                      <Button variant="outline" onClick={() => setSlotTemplatesError('')}>Dismiss</Button>
                    </div>
                  </div>
                )}

                {slotTemplates !== null && !slotTemplatesLoading && (
                  <div className="mt-4 space-y-6">
                    {successMessage && (
                      <InlineMessage type="success" message={successMessage} />
                    )}
                    
                    {/* Add / Edit Template Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                        {templateForm.id ? 'Edit Template' : 'Add New Template'}
                      </h3>
                      
                      <form onSubmit={(e) => { e.preventDefault(); saveSlotTemplate(); }} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dayOfWeek" className="text-sm font-medium">Day of Week *</Label>
                            <select 
                              id="dayOfWeek"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2" 
                              value={templateForm.dayOfWeek} 
                              onChange={e => setTemplateForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                            >
                              <option value="MONDAY">Monday</option>
                              <option value="TUESDAY">Tuesday</option>
                              <option value="WEDNESDAY">Wednesday</option>
                              <option value="THURSDAY">Thursday</option>
                              <option value="FRIDAY">Friday</option>
                              <option value="SATURDAY">Saturday</option>
                              <option value="SUNDAY">Sunday</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="slotDuration" className="text-sm font-medium">Duration (minutes) *</Label>
                            <Input 
                              id="slotDuration"
                              type="number" 
                              min={5} 
                              value={templateForm.slotDurationMinutes} 
                              onChange={e => setTemplateForm(f => ({ ...f, slotDurationMinutes: Number(e.target.value || 0) }))}
                              placeholder="e.g. 15, 30, 60"
                            />
                            {templateErrors.slotDurationMinutes && <div className="text-red-500 text-xs">{templateErrors.slotDurationMinutes}</div>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startTime" className="text-sm font-medium">Start Time *</Label>
                            <Input 
                              id="startTime"
                              type="time" 
                              value={templateForm.startTime} 
                              onChange={e => setTemplateForm(f => ({ ...f, startTime: e.target.value }))}
                            />
                            {templateErrors.startTime && <div className="text-red-500 text-xs">{templateErrors.startTime}</div>}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="endTime" className="text-sm font-medium">End Time *</Label>
                            <Input 
                              id="endTime"
                              type="time" 
                              value={templateForm.endTime} 
                              onChange={e => setTemplateForm(f => ({ ...f, endTime: e.target.value }))}
                            />
                            {templateErrors.endTime && <div className="text-red-500 text-xs">{templateErrors.endTime}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <input 
                            id="tpl-active" 
                            type="checkbox" 
                            checked={templateForm.active} 
                            onChange={e => setTemplateForm(f => ({ ...f, active: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="tpl-active" className="text-sm font-medium text-gray-700">Active template</label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 items-stretch pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => resetTemplateForm()}
                            className="w-full"
                          >
                            Reset
                          </Button>
                          <Button 
                            type="submit"
                            className="w-full bg-purple-500 hover:bg-purple-600"
                          >
                            {templateForm.id ? 'Update Template' : 'Create Template'}
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Existing Templates Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Existing Templates</h3>
                      
                      {slotTemplates.length === 0 ? (
                        <div className="p-6 text-center text-gray-600">
                          <div className="flex flex-col items-center gap-3">
                            <LayoutTemplate className="w-12 h-12 text-purple-400 bg-transparent" />
                            <p className="font-medium">No slot templates yet</p>
                            <p className="text-sm">Create a recurring availability template to let patients book predictable slots.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop & tablet: table view (md and up) */}
                          <div className="hidden md:block overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-purple-50 border-b">
                                  <th className="p-3 text-left font-semibold text-gray-700">Day</th>
                                  <th className="p-3 text-left font-semibold text-gray-700">Start Time</th>
                                  <th className="p-3 text-left font-semibold text-gray-700">End Time</th>
                                  <th className="p-3 text-center font-semibold text-gray-700">Duration</th>
                                  <th className="p-3 text-right font-semibold text-gray-700">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {slotTemplates.map(tpl => (
                                  <tr key={tpl.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                      <span className="font-medium text-gray-900">{tpl.dayOfWeek}</span>
                                    </td>
                                    <td className="p-3 text-gray-600">{tpl.startTime}</td>
                                    <td className="p-3 text-gray-600">{tpl.endTime}</td>
                                    <td className="p-3 text-center">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {tpl.slotDurationMinutes} min
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-2 justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center gap-1"
                                          title="Edit template"
                                          aria-label={`Edit template ${tpl.id}`}
                                          onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                                        >
                                          <Edit className="w-4 h-4 bg-transparent" />
                                          <span>Edit</span>
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="flex items-center gap-1"
                                          title="Delete template"
                                          aria-label={`Delete template ${tpl.id}`}
                                          onClick={() => handleDeleteTemplate(tpl.id)}
                                        >
                                          <Trash2 className="w-4 h-4 bg-transparent" />
                                          <span>Delete</span>
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile & small tablet: stacked cards (below md) */}
                          <div className="block md:hidden space-y-3">
                            {slotTemplates.map(tpl => (
                              <div key={`mobile-${tpl.id}`} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <LayoutTemplate className="w-4 h-4 text-purple-500 bg-transparent flex-shrink-0" />
                                      <span className="font-semibold text-gray-900">{tpl.dayOfWeek}</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Time:</span>
                                        <span>{tpl.startTime} – {tpl.endTime}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Duration:</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {tpl.slotDurationMinutes} min
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 w-24 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full flex items-center justify-center gap-1"
                                      title="Edit template"
                                      aria-label={`Edit template ${tpl.id}`}
                                      onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                                    >
                                      <Edit className="w-4 h-4 bg-transparent" />
                                      <span className="text-xs">Edit</span>
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="w-full flex items-center justify-center gap-1"
                                      title="Delete template"
                                      aria-label={`Delete template ${tpl.id}`}
                                      onClick={() => handleDeleteTemplate(tpl.id)}
                                    >
                                      <Trash2 className="w-4 h-4 bg-transparent" />
                                      <span className="text-xs">Delete</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>


          <TabsContent value="appointments" className="space-y-3 mt-4">
            {/* Show a header when appointments are filtered by a doctor */}
            {selectedDoctorFilter && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Showing appointments for <span className="font-semibold">{selectedDoctorFilter}</span></div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDoctorFilter(null)}>Clear filter</Button>
                </div>
              </div>
            )}

            <AppointmentsList
              appointments={hospitalAppointments}
              filteredAppointments={(statusFilter === 'ALL' ? (selectedDoctorFilter ? hospitalAppointments.filter(a => String(a.doctorName) === selectedDoctorFilter) : hospitalAppointments) : hospitalAppointments.filter(a => a.status === statusFilter && (selectedDoctorFilter ? String(a.doctorName) === selectedDoctorFilter : true)))}
              statusOptions={statusOptions}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              appointmentsLoading={hospitalAppointmentsLoading}
              appointmentsError={hospitalAppointmentsError}
              cancelMsg={cancelMsg}
              onCancel={async (appt) => {
                try {
                  // mark appointment as completed from hospital view
                  await updateAppointmentStatusApi(appt.id, 'COMPLETED');
                  setCancelMsg({ type: 'success', text: AppointmentMessages.COMPLETE_SUCCESS });
                  setCancelDialog({ open: false });
                  await fetchAppointments({ start: dateRange.start, end: dateRange.end });
                } catch (e: any) {
                  setCancelMsg({ type: 'error', text: e?.message || AppointmentMessages.COMPLETE_FAILED });
                  setCancelDialog({ open: false });
                }
                setTimeout(() => setCancelMsg(null), 2500);
              }}
              cancelDialog={cancelDialog}
              setCancelDialog={setCancelDialog}
              getStatusLabel={(key: string) => {
                const found = statusOptions.find((opt) => opt.key === key);
                return found ? found.label : key;
              }}
              fetchAppointments={fetchAppointments}
              isDoctor={true}
            />
          </TabsContent>
        </Tabs>
      </div>
  {/* Doctor slots modal (hospital admin reserve) */}
            <DoctorAvailableSlot open={doctorSlotsOpen} onOpenChange={(open) => { setDoctorSlotsOpen(open); if (!open) setSlotsDoctorId(null); }} doctorId={slotsDoctorId} />  <DoctorLeaves
    doctorId={leavesDoctorId}
    doctorName={leavesDoctorName ?? undefined}
    open={leavesOpen}
    onOpenChange={(open) => {
      setLeavesOpen(open);
      if (!open) {
        setLeavesDoctorId(null);
        setLeavesDoctorName(null);
      }
    }}
  />

  {/* Global ConfirmDialog so it overlays above other dialogs */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete slot template"
        message={"Are you sure you want to delete this slot template? This action cannot be undone."}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => { void confirmDeleteTemplate(); }}
        onCancel={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
      />
      <ConfirmDialog
        open={doctorConfirmOpen}
        title="Delete doctor"
        message={doctorToDelete ? "Are you sure you want to delete this doctor and all related data?" : ''}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (doctorToDelete) {
            (async () => {
              try {
                await onDeleteDoctor(doctorToDelete);
              } catch (e) {
                console.error('Failed to delete doctor via parent handler', e);
              }
              // Refresh local doctor list after deletion
              try {
                await fetchDoctors();
              } catch (e) {
                console.error('Failed to refresh doctors after delete', e);
              }
            })();
          }
          setDoctorConfirmOpen(false);
          setDoctorToDelete(null);
        }}
        onCancel={() => { setDoctorConfirmOpen(false); setDoctorToDelete(null); }}
      />
    </div>
  );
}


