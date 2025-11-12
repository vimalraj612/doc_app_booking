import { useState, useRef, useEffect } from 'react';
import { User, Doctor, Appointment, Hospital } from '../../App';
import { Card, CardContent } from '../ui/card';
import { LogOut, Stethoscope, CalendarCheck, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ConfirmDialog from '../ui/ConfirmDialog';

import { fetchDoctorsByHospitalId, addDoctor, updateDoctor, SlotTemplateDTO, DoctorDTO } from '../../api/doctor';
import { fetchHospitalAppointmentsByDateRange, fetchHospitalTodaysAppointmentCount } from '../../api/appointments';
import DoctorsTab from './DoctorsTab';
import { AppointmentsTab } from './AppointmentsTab';
import { SlotTemplatesDialog } from './SlotTemplatesDialog';
import DoctorAvailableSlot from './DoctorAvailableSlot';
import DoctorLeaves from './DoctorLeaves';
import { useLocale } from '../../contexts/LocaleContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { getAppointmentStatusOptions } from '../../constants/dropdownOptions';

interface HospitalDashboardProps {
  user: User;
  appointments: Appointment[];
  hospitals: Hospital[];
  onLogout: () => void;
  onDeleteDoctor: (doctorId: string) => void;
}

export function HospitalDashboard({
  user,
  appointments,
  hospitals,
  onLogout,
  onDeleteDoctor
}: HospitalDashboardProps) {
  const { t } = useLocale();
  
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<DoctorDTO> | Partial<Doctor> | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string | null>(null);
  const hospital = hospitals.find(h => h.id === user.id);
  
  // Slot template modal state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [slotsDoctorId, setSlotsDoctorId] = useState<string | number | null>(null);
  const [lastClickedDoctor, setLastClickedDoctor] = useState<string | null>(null);
  
  // Hospital appointments state
  const [hospitalAppointments, setHospitalAppointments] = useState<any[]>([]);
  const [hospitalAppointmentsLoading, setHospitalAppointmentsLoading] = useState(false);
  const [hospitalAppointmentsError, setHospitalAppointmentsError] = useState('');
  
  // Today's appointments count
  const [hospitalTodayCount, setHospitalTodayCount] = useState<number | null>(null);
  const [hospitalTodayLoading, setHospitalTodayLoading] = useState(false);
  const [hospitalTodayError, setHospitalTodayError] = useState('');
  
  // Appointments filter state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate());
    const end = new Date(today);
    end.setDate(today.getDate() + 2);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  });
  
  const statusOptions = getAppointmentStatusOptions(t, true).map(opt => ({
    key: opt.key,
    label: opt.label,
  })).filter(opt =>
    opt.key === 'ALL' || ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'PENDING'].includes(opt.key)
  );
  
  const [cancelMsg, setCancelMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appt?: any }>({ open: false });
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);
  
  // Doctor delete confirmation
  const [doctorConfirmOpen, setDoctorConfirmOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);
  
  // Doctor slots & leaves modal state
  const [doctorSlotsOpen, setDoctorSlotsOpen] = useState(false);
  const [leavesOpen, setLeavesOpen] = useState(false);
  const [leavesDoctorId, setLeavesDoctorId] = useState<string | number | null>(null);
  const [leavesDoctorName, setLeavesDoctorName] = useState<string | null>(null);

  const extractErrorMessage = (err: any) => {
    try {
      if (!err) return 'Unknown error';
      const m = err?.message || err;
      if (!m) return 'Unknown error';
      try {
        const parsed = JSON.parse(m);
        if (parsed && parsed.message) return String(parsed.message);
      } catch (_) { }
      if (typeof m === 'object' && m.message) return String(m.message);
      return String(m);
    } catch (_e) {
      return 'Unknown error';
    }
  };

  const fetchDoctors = async () => {
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
    setSlotsDoctorId(doctorId);
    setSlotDialogOpen(true);
  };

  useEffect(() => {
    fetchDoctors();
  }, [user?.id]);

  // Fetch hospital appointments when Appointments tab is selected
  useEffect(() => {
    const loadAppointments = async () => {
      if (activeTab !== 'appointments') return;
      if (!user?.id) return;
      await fetchAppointments();
    };
    void loadAppointments();
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
        setHospitalTodayError(extractErrorMessage(e) || t.messages.DOCTOR.TODAY_COUNT_FAILED);
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
      setHospitalAppointmentsError(extractErrorMessage(e));
      setHospitalAppointments([]);
    } finally {
      setHospitalAppointmentsLoading(false);
    }
  };

  // Add doctor handler
  const handleAddDoctor = async (doctor: Partial<DoctorDTO>) => {
    await addDoctor({
      ...doctor,
      hospitalId: Number(doctor.hospitalId),
    });
    await fetchDoctors();
  };

  const handleUpdateDoctor = async (id: string, doctor: Partial<DoctorDTO>) => {
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
            <h1 className="text-lg sm:text-xl">{t.portals.hospitalPortal}</h1>
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
            <LanguageSwitcher />
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
              <p className="text-xs text-gray-500">{t.doctor.doctors}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CalendarCheck className="w-8 h-8 text-purple-500 mb-2 bg-transparent" />
              <p className="text-2xl">{hospitalTodayLoading ? '...' : (hospitalTodayCount !== null ? hospitalTodayCount : appointments.length)}</p>
              <p className="text-xs text-gray-500">{t.appointments.appointments}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">{t.doctor.doctors}</TabsTrigger>
            <TabsTrigger value="appointments">{t.appointments.appointments}</TabsTrigger>
          </TabsList>

          <DoctorsTab
            doctors={doctors}
            hospital={hospital}
            user={user}
            isAddDoctorOpen={isAddDoctorOpen}
            setIsAddDoctorOpen={setIsAddDoctorOpen}
            editingDoctor={editingDoctor}
            setEditingDoctor={setEditingDoctor}
            onAddDoctor={handleAddDoctor}
            onUpdateDoctor={handleUpdateDoctor}
            onSlotTemplatesClick={handleSlotTemplateClick}
            onSlotsClick={(doctorId) => {
              setSlotsDoctorId(doctorId);
              setDoctorSlotsOpen(true);
            }}
            onLeavesClick={(doctorId, doctorName) => {
              setLeavesDoctorId(doctorId);
              setLeavesDoctorName(doctorName);
              setLeavesOpen(true);
            }}
            onViewAppointments={(doctorName) => {
              setSelectedDoctorFilter(doctorName);
              setActiveTab('appointments');
            }}
            onDeleteClick={(doctorId) => {
              setDoctorToDelete(doctorId);
              setDoctorConfirmOpen(true);
            }}
            setLastClickedDoctor={setLastClickedDoctor}
          />

          <AppointmentsTab
            hospitalAppointments={hospitalAppointments}
            statusOptions={statusOptions}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            hospitalAppointmentsLoading={hospitalAppointmentsLoading}
            hospitalAppointmentsError={hospitalAppointmentsError}
            cancelMsg={cancelMsg}
            setCancelMsg={setCancelMsg}
            cancelDialog={cancelDialog}
            setCancelDialog={setCancelDialog}
            fetchAppointments={fetchAppointments}
            selectedDoctorFilter={selectedDoctorFilter}
            setSelectedDoctorFilter={setSelectedDoctorFilter}
          />
        </Tabs>
      </div>

      {/* Slot Templates Dialog */}
      <SlotTemplatesDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        doctorId={slotsDoctorId}
      />

      {/* Doctor slots modal */}
      <DoctorAvailableSlot 
        open={doctorSlotsOpen} 
        onOpenChange={(open) => { 
          setDoctorSlotsOpen(open); 
          if (!open) setSlotsDoctorId(null); 
        }} 
        doctorId={slotsDoctorId} 
      />

      {/* Doctor leaves modal */}
      <DoctorLeaves
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

      {/* Delete doctor confirmation */}
      <ConfirmDialog
        open={doctorConfirmOpen}
        title={t.messages.LABELS.DELETE_DOCTOR}
        message={doctorToDelete ? t.messages.CONFIRM.DELETE_DOCTOR : ''}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        onConfirm={async () => {
          if (doctorToDelete) {
            try {
              await onDeleteDoctor(doctorToDelete);
              await fetchDoctors();
            } catch (e) {
              console.error('Failed to delete doctor', e);
            }
          }
          setDoctorConfirmOpen(false);
          setDoctorToDelete(null);
        }}
        onCancel={() => { 
          setDoctorConfirmOpen(false); 
          setDoctorToDelete(null); 
        }}
      />
    </div>
  );
}
