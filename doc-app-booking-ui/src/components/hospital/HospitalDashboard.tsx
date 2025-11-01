import { useState } from 'react';
import { useRef } from 'react';
import { User, Doctor, Appointment, Hospital } from '../../App';
import { Card, CardContent } from '../ui/card';
import { LogOut, Plus, User as UserIcon, Stethoscope, Calendar, Building2, LayoutTemplate, CalendarDays, Trash2, Edit } from 'lucide-react';
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

import { useEffect } from 'react';
import { fetchDoctorsByHospitalId, addDoctor, updateDoctor, fetchSlotTemplatesByDoctorId, createOrUpdateSlotTemplate, deleteSlotTemplate, SlotTemplateDTO, DoctorDTO } from '../../api/doctor';
import { fetchHospitalAppointmentsByDateRange, cancelAppointmentApi, fetchHospitalTodaysAppointmentCount } from '../../api/appointments';
import AppointmentsList from '../common/AppointmentsList';
import DoctorAvailableSlot from './DoctorAvailableSlot';
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
    if (!firstName || !firstName.trim()) errs.firstName = 'First name is required';
    else if (firstName.length > 100) errs.firstName = 'First name must not exceed 100 characters';
    else if (!namePattern.test(firstName)) errs.firstName = 'First name contains invalid characters';

    if (!lastName || !lastName.trim()) errs.lastName = 'Last name is required';
    else if (lastName.length > 100) errs.lastName = 'Last name must not exceed 100 characters';
    else if (!namePattern.test(lastName)) errs.lastName = 'Last name contains invalid characters';

    if (!email || !email.trim()) errs.email = 'Email is required';
    else if (email.length > 200) errs.email = 'Email must not exceed 200 characters';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please provide a valid email address';

    if (!phoneNumber || !phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    else if (phoneNumber.length > 20) errs.phoneNumber = 'Phone number must not exceed 20 characters';
    else if (!phonePattern.test(phoneNumber)) errs.phoneNumber = 'Please provide a valid phone number';

    if (!specialization || !specialization.trim()) errs.specialization = 'Specialization is required';
    else if (specialization.length > 200) errs.specialization = 'Specialization must not exceed 200 characters';
    else if (!SPECIALIZATION_OPTIONS.find(o => o.value === specialization)) errs.specialization = 'Please select a valid specialization';

    if (department && department.length > 200) errs.department = 'Department must not exceed 200 characters';
    else if (department && !departmentPattern.test(department)) errs.department = 'Department contains invalid characters';

    if (experienceYears !== '' && (Number(experienceYears) < 0 || Number(experienceYears) > 70)) errs.experienceYears = 'Experience must be between 0 and 70';

    if (qualifications && qualifications.length > 1000) errs.qualifications = 'Qualifications must not exceed 1000 characters';

    if (imageContentType && imageContentType.length > 100) errs.imageContentType = 'Image content type must not exceed 100 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImage = (file?: File) => {
    if (!file) return;
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
    // Narrow union type: check for backend DTO fields first
    const isDTO = (d: any): d is Partial<DoctorDTO> => d && (typeof d.firstName !== 'undefined' || typeof d.profileImage !== 'undefined' || typeof d.imageContentType !== 'undefined');

    if (isDTO(initialDoctor)) {
      setFirstName(initialDoctor.firstName || initialDoctor.name?.split(' ')?.[0] || '');
      setLastName(initialDoctor.lastName || (initialDoctor.name ? initialDoctor.name.split(' ').slice(1).join(' ') : ''));
      setEmail(initialDoctor.email || '');
      setPhoneNumber(initialDoctor.phoneNumber || '');
      setSpecialization(initialDoctor.specialization || '');
      setDepartment(initialDoctor.department || '');
      setExperienceYears(initialDoctor.experienceYears ?? '');
      setQualifications(initialDoctor.qualifications || '');
      if (initialDoctor.profileImage && initialDoctor.imageContentType) {
        setProfileBase64(initialDoctor.profileImage as string);
        setImageContentType(initialDoctor.imageContentType as string);
      }
    } else {
      // Assume UI Doctor shape
      const ui = initialDoctor as Partial<Doctor>;
      setFirstName(ui.name?.split(' ')?.[0] || '');
      setLastName(ui.name ? ui.name.split(' ').slice(1).join(' ') : '');
      setEmail(ui.email || '');
      setPhoneNumber(ui.phoneNumber || '');
      setSpecialization(ui.specialization || '');
      setDepartment('');
      setExperienceYears('');
      setQualifications(ui.qualifications || '');
      setProfileBase64(null);
      setImageContentType(null);
    }
  }, [initialDoctor]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
          {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
          {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
          {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="E.164, e.g. +919876543210" />
          {errors.phoneNumber && <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <select id="specialization" className="form-input w-full border rounded px-2 py-1" value={specialization} onChange={e => setSpecialization(e.target.value)}>
            <option value="">Select specialization</option>
            {SPECIALIZATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.specialization && <div className="text-red-500 text-xs mt-1">{errors.specialization}</div>}
        </div>
        <div>
          <Label htmlFor="department">Department (optional)</Label>
          <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" />
          {errors.department && <div className="text-red-500 text-xs mt-1">{errors.department}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="experience">Experience (years)</Label>
          <Input id="experience" type="number" min={0} max={70} value={experienceYears} onChange={e => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))} />
          {errors.experienceYears && <div className="text-red-500 text-xs mt-1">{errors.experienceYears}</div>}
        </div>
        <div>
          <Label htmlFor="qualifications">Qualifications (optional)</Label>
          <Input id="qualifications" value={qualifications} onChange={e => setQualifications(e.target.value)} placeholder="e.g. MBBS, MD" />
          {errors.qualifications && <div className="text-red-500 text-xs mt-1">{errors.qualifications}</div>}
        </div>
      </div>

      <div>
        <Label htmlFor="profile">Profile image (optional)</Label>
        <input id="profile" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
        {imageContentType && <div className="text-xs text-gray-600 mt-1">Detected: {imageContentType}</div>}
        {errors.imageContentType && <div className="text-red-500 text-xs mt-1">{errors.imageContentType}</div>}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => {
          setFirstName(''); setLastName(''); setEmail(''); setPhoneNumber(''); setSpecialization(''); setDepartment(''); setExperienceYears(''); setQualifications(''); setProfileBase64(null); setImageContentType(null); setErrors({});
        }}>Reset</Button>
        <Button type="submit" disabled={submitting}>{submitting ? (initialDoctor ? 'Updating...' : 'Adding...') : (initialDoctor ? 'Update Doctor' : 'Add Doctor')}</Button>
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
    if (!templateForm.startTime) errs.startTime = 'Start time is required';
    if (!templateForm.endTime) errs.endTime = 'End time is required';
    if (templateForm.startTime && templateForm.endTime) {
      const s = toMinutes(templateForm.startTime);
      const e = toMinutes(templateForm.endTime);
      if (e <= s) errs.endTime = 'End time must be after start time';
      if (e - s < templateForm.slotDurationMinutes) errs.endTime = 'Slot duration must fit within start/end range';
    }
    if (!templateForm.slotDurationMinutes || templateForm.slotDurationMinutes < 5) errs.slotDurationMinutes = 'Duration must be at least 5 minutes';
    setTemplateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveSlotTemplate = async (doctorId?: string) => {
    const docId = doctorId || slotTemplatesDoctor;
    if (!docId) {
      setSlotTemplatesError('No doctor selected for slot template');
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
      await createOrUpdateSlotTemplate(docId, payload);
      // refresh list
      const data = await fetchSlotTemplatesByDoctorId(docId);
      setSlotTemplates(data);
      resetTemplateForm();
      setTemplateErrors({});
      setSuccessMessage('Slot template saved');
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to save slot template', e);
      setSlotTemplatesError(extractErrorMessage(e) || 'Failed to save slot template');
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
      setSlotTemplatesError('No doctor selected for slot template');
      setConfirmOpen(false);
      setConfirmTargetId(null);
      return;
    }
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    try {
      await deleteSlotTemplate(templateId);
      const data = await fetchSlotTemplatesByDoctorId(slotTemplatesDoctor);
      setSlotTemplates(data);
      setSuccessMessage('Slot template deleted');
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to delete slot template', e);
      setSlotTemplatesError(extractErrorMessage(e) || 'Failed to delete slot template');
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
      setSlotTemplatesError(extractErrorMessage(e) || 'Failed to load slot templates');
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
        setHospitalTodayError(extractErrorMessage(e) || 'Failed to load today\'s count');
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
      setHospitalAppointmentsError(extractErrorMessage(e) || 'Failed to load appointments');
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
            <Building2 className="w-6 h-6 text-purple-500" />
            <h1 className="text-lg sm:text-xl">Hospital Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={hospital?.photo} alt={hospital?.name} />
                <AvatarFallback><Building2 className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name}</span>
            </div>
            <Avatar className="sm:hidden w-8 h-8">
              <AvatarImage src={hospital?.photo} alt={hospital?.name} />
              <AvatarFallback><Building2 className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Stethoscope className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl">{doctors.length}</p>
              <p className="text-xs text-gray-500">Doctors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <UserIcon className="w-8 h-8 text-purple-500 mb-2" />
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
                  <Plus className="w-5 h-5" />
                  Add New Doctor
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-full sm:rounded-lg">
                <DialogHeader>
                  <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                  <DialogDescription>{editingDoctor ? 'Edit doctor details' : 'Add a new doctor to your hospital'}</DialogDescription>
                </DialogHeader>
                  <AddDoctorForm 
                    onSuccess={() => { setIsAddDoctorOpen(false); setEditingDoctor(null); }} 
                    onAddDoctor={handleAddDoctor}
                    onUpdateDoctor={handleUpdateDoctor}
                    initialDoctor={editingDoctor}
                    hospital={hospital}
                    user={user}
                  />
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
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 items-center">
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
                          <span className="sm:hidden"><LayoutTemplate className="w-5 h-5" /></span>
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
                            <span className="sm:hidden"><CalendarDays className="w-5 h-5" /></span>
                            <span className="hidden sm:inline">Slots</span>
                          </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" title="View appointments" onClick={() => { setSelectedDoctorFilter(doctor.name); setActiveTab('appointments'); }}>
                          <span className="sm:hidden"><CalendarDays className="w-5 h-5" /></span>
                          <span className="hidden sm:inline">Appointments</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" title="Edit" onClick={() => { setEditingDoctor(doctor); setIsAddDoctorOpen(true); }}>
                          <span className="sm:hidden"><Edit className="w-5 h-5" /></span>
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => { setDoctorToDelete(doctor.id); setDoctorConfirmOpen(true); }} className="flex items-center justify-center" title="Delete">
                          <span className="sm:hidden"><Trash2 className="w-5 h-5" /></span>
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
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{slotTemplatesError}</AlertDescription>
                    </Alert>
                    <div className="flex gap-2 justify-end mt-3">
                      <Button variant="outline" onClick={() => setSlotTemplatesError('')}>Dismiss</Button>
                    </div>
                  </div>
                )}

                {slotTemplates !== null && !slotTemplatesLoading && (
                  <div className="space-y-4 p-2">
                    {successMessage && (
                      <Alert>
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                      </Alert>
                    )}
                    {/* Add / Edit form */}
                    <div className="mb-1 border rounded p-3 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <Label>Day of Week</Label>
                          <select className="form-input w-full border rounded px-2 py-1" value={templateForm.dayOfWeek} onChange={e => setTemplateForm(f => ({ ...f, dayOfWeek: e.target.value }))}>
                            <option>MONDAY</option>
                            <option>TUESDAY</option>
                            <option>WEDNESDAY</option>
                            <option>THURSDAY</option>
                            <option>FRIDAY</option>
                            <option>SATURDAY</option>
                            <option>SUNDAY</option>
                          </select>
                        </div>
                        <div>
                          <Label>Start Time</Label>
                          <Input type="time" value={templateForm.startTime} onChange={e => setTemplateForm(f => ({ ...f, startTime: e.target.value }))} />
                          {templateErrors.startTime && <div className="text-red-500 text-xs mt-1">{templateErrors.startTime}</div>}
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input type="time" value={templateForm.endTime} onChange={e => setTemplateForm(f => ({ ...f, endTime: e.target.value }))} />
                          {templateErrors.endTime && <div className="text-red-500 text-xs mt-1">{templateErrors.endTime}</div>}
                        </div>
                        <div>
                          <Label>Duration (min)</Label>
                          <Input type="number" min={5} value={templateForm.slotDurationMinutes} onChange={e => setTemplateForm(f => ({ ...f, slotDurationMinutes: Number(e.target.value || 0) }))} />
                          {templateErrors.slotDurationMinutes && <div className="text-red-500 text-xs mt-1">{templateErrors.slotDurationMinutes}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="tpl-active" type="checkbox" checked={templateForm.active} onChange={e => setTemplateForm(f => ({ ...f, active: e.target.checked }))} />
                          <label htmlFor="tpl-active" className="text-sm">Active</label>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => resetTemplateForm()}>Reset</Button>
                          <Button onClick={() => saveSlotTemplate()}>{templateForm.id ? 'Update' : 'Create'}</Button>
                        </div>
                      </div>
                    </div>

                    {slotTemplates.length === 0 ? (
                      <div className="p-6 text-center text-gray-600">
                        <div className="flex flex-col items-center gap-3">
                          <LayoutTemplate className="w-12 h-12 text-blue-500" />
                          <p className="font-medium">No slot templates yet</p>
                          <p className="text-sm">Create a recurring availability template to let patients book predictable slots.</p>
                          <div className="mt-3">
                            <Button onClick={() => { resetTemplateForm(); }}><Plus className="w-4 h-4 mr-2" />Create template</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Desktop & tablet: table view (md and up) */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="p-2 border">Day</th>
                                <th className="p-2 border">Start</th>
                                <th className="p-2 border">End</th>
                                <th className="p-2 border">Duration (min)</th>
                                <th className="p-2 border">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {slotTemplates.map(tpl => (
                                <tr key={tpl.id} className="border-b">
                                  <td className="p-2 border">{tpl.dayOfWeek}</td>
                                  <td className="p-2 border">{tpl.startTime}</td>
                                  <td className="p-2 border">{tpl.endTime}</td>
                                  <td className="p-2 border text-center">{tpl.slotDurationMinutes}</td>
                                  <td className="p-2 border text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="p-2"
                                        title="Edit template"
                                        aria-label={`Edit template ${tpl.id}`}
                                        onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="p-2"
                                        title="Delete template"
                                        aria-label={`Delete template ${tpl.id}`}
                                        onClick={() => handleDeleteTemplate(tpl.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
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
                            <div key={`mobile-${tpl.id}`} className="border rounded p-3 bg-white shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium">{tpl.dayOfWeek}</div>
                                  <div className="text-xs text-gray-600">{tpl.startTime} – {tpl.endTime}</div>
                                  <div className="text-xs text-gray-600 mt-1">Duration: {tpl.slotDurationMinutes} min</div>
                                </div>
                                <div className="flex flex-col items-end gap-2 w-28">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center"
                                    title="Edit template"
                                    aria-label={`Edit template ${tpl.id}`}
                                    onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    <span className="text-sm">Edit</span>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full flex items-center justify-center"
                                    title="Delete template"
                                    aria-label={`Delete template ${tpl.id}`}
                                    onClick={() => handleDeleteTemplate(tpl.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    <span className="text-sm">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
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
                  await cancelAppointmentApi(appt.id);
                  setCancelMsg({ type: 'success', text: 'Appointment cancelled successfully.' });
                  setCancelDialog({ open: false });
                  await fetchAppointments({ start: dateRange.start, end: dateRange.end });
                } catch (e: any) {
                  setCancelMsg({ type: 'error', text: e?.message || 'Failed to cancel appointment.' });
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
              isDoctor={false}
            />
          </TabsContent>
        </Tabs>
      </div>
  {/* Doctor slots modal (hospital admin reserve) */}
  <DoctorAvailableSlot open={doctorSlotsOpen} onOpenChange={(open) => { setDoctorSlotsOpen(open); if (!open) setSlotsDoctorId(null); }} doctorId={slotsDoctorId} />

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


