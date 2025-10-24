import { useState, useEffect } from 'react';
import { fetchDoctorByPhone } from '../../api/doctor';
import { fetchSlotsByDoctorId, fetchPatientAppointmentsByDateRange, cancelAppointmentApi } from '../../api/appointments';
import { apiFetch } from '../../api/http';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import Header from '../common/Header';
import DoctorDetails from '../common/DoctorDetails';
import AppointmentsList from '../common/AppointmentsList';
import AvailableSlots from '../common/AvailableSlots';
import PatientProfile from './PatientProfile';
import { getPatientUserProfile, updatePatientProfile, PatientProfile as PatientProfileType } from '../../api/user';

const mockUser = {
  name: 'Jane Patient',
  profileImage: '',
};

export interface PatientDashboardProps {
  onLogout: () => void;
}

export function PatientDashboard({ onLogout }: PatientDashboardProps) {
  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<PatientProfileType | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Fetch profile from backend/localStorage
  const fetchProfile = async () => {
    const userId = window.localStorage.getItem('userId');
    if (!userId) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const resp = await getPatientUserProfile(userId);
      // Use resp.data for the profile object
      setProfile(resp && resp.data ? resp.data : null);
    } catch (e) {
      setProfileMsg('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
    fetchProfile();
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
    setProfileMsg(null);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    const userId = window.localStorage.getItem('userId');
    if (!userId || !profile) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updatePatientProfile(userId, profile);
      setProfileMsg('Profile updated successfully!');
    } catch (e) {
      setProfileMsg('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const [user] = useState(mockUser);

  function getPhoneNumberFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('docPhoneNumber') || '';
  }
  function getStoredPhoneNumber() {
    return window.localStorage.getItem('docPhoneNumber') || '';
  }
  function getDocPhoneNumber() {
    const fromQuery = getPhoneNumberFromQuery();
    if (fromQuery) {
      window.localStorage.setItem('docPhoneNumber', fromQuery);
      return fromQuery;
    }
    return getStoredPhoneNumber();
  }
  const docPhoneNumber = getDocPhoneNumber();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState('');
  const [showSlots, setShowSlots] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const statusOptions = [
    { key: 'ALL', label: 'All' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'COMPLETED', label: 'Completed' },
  ];
  const getStatusLabel = (key: string) => {
    const found = statusOptions.find(opt => opt.key === key);
    return found ? found.label : key;
  };
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const next7 = new Date();
    next7.setDate(today.getDate() + 7);
    return {
      start: today.toISOString().slice(0, 10),
      end: next7.toISOString().slice(0, 10),
    };
  });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appt?: any }>({ open: false });
  const [cancelMsg, setCancelMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const filteredAppointments = statusFilter === 'ALL'
    ? appointments
    : appointments.filter(appt => appt.status === statusFilter);
  const [activeTab, setActiveTab] = useState('details');
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);
  const fetchAppointments = (customRange?: { start: string; end: string }) => {
    const patientId = window.localStorage.getItem('userId');
    if (!patientId) return;
    const start = customRange?.start || dateRange.start;
    const end = customRange?.end || dateRange.end;
    setAppointmentsLoading(true);
    setAppointmentsError('');
    fetchPatientAppointmentsByDateRange({
      patientId,
      start: new Date(start).toISOString(),
      end: new Date(new Date(end).setHours(23,59,59,999)).toISOString(),
    })
      .then(resp => setAppointments(resp.data || []))
      .catch(() => setAppointmentsError('Failed to fetch appointments.'))
      .finally(() => setAppointmentsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'appointments' && appointmentsFetched) {
      fetchAppointments({ start: dateRange.start, end: dateRange.end });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  useEffect(() => {
    if (!docPhoneNumber) return;
    const fetchDoctor = async () => {
      setDoctorLoading(true);
      setDoctorError('');
      try {
        const doctor = await fetchDoctorByPhone(docPhoneNumber);
        setSelectedDoctor(doctor);
      } catch (e) {
        setDoctorError('Failed to fetch doctor details.');
      } finally {
        setDoctorLoading(false);
      }
    };
    fetchDoctor();
  }, [docPhoneNumber]);

  const fetchSlots = async () => {
    if (!selectedDoctor) return;
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const slotsResp = await fetchSlotsByDoctorId(selectedDoctor.id);
      setSlots(slotsResp.data);
    } catch (e) {
      setSlotsError('Failed to fetch slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<any>(null);

  const slotsByDate: { [date: string]: any[] } = {};
  slots.forEach(slot => {
    const date = new Date(slot.start).toISOString().slice(0, 10);
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  });
  const allDates = Object.keys(slotsByDate).sort();

  useEffect(() => {
    if (allDates.length > 0 && !selectedDate) setSelectedDate(allDates[0]);
  }, [allDates, selectedDate]);

  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleBookSlot = (slot: any) => {
    if (!slot.available || booking) return;
    setPendingSlot(slot);
    setConfirmOpen(true);
  };

  const handleConfirmBook = async () => {
    if (!pendingSlot) return;
    setBooking(true);
    setSuccessMsg('');
    setConfirmOpen(false);
    try {
      const patientPhone = window.localStorage.getItem('phoneNumber') || '';
      const patientName = window.localStorage.getItem('patientName') || 'Patient';
      const doctorId = pendingSlot.doctorId || (selectedDoctor && selectedDoctor.id);
      const appointmentDateTime = pendingSlot.start;
      const slotId = pendingSlot.slotId;
      const payload = {
        doctorId,
        patientPhone,
        patientName,
        appointmentDateTime,
        slotId,
      };
      const token = window.localStorage.getItem('accessToken') || '';
      const rawResp = await apiFetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      let resp: any = rawResp;
      if (typeof window !== 'undefined' && rawResp instanceof Response) {
        resp = await rawResp.json();
      }
      if (resp && typeof resp === 'object' && 'success' in resp) {
        if (resp.success) {
          setSuccessMsg('Appointment booked successfully!');
          setSlots(prev => prev.map(s => s.slotId === pendingSlot.slotId ? { ...s, available: false } : s));
        } else {
          setSuccessMsg(resp.message || 'Booking failed.');
        }
      } else {
        setSuccessMsg('Booking failed.');
      }
    } catch (e) {
      setSuccessMsg('Booking failed.');
    } finally {
      setBooking(false);
      setTimeout(() => setSuccessMsg(''), 2500);
      setPendingSlot(null);
    }
  };

  const handleCancelBook = () => {
    setConfirmOpen(false);
    setPendingSlot(null);
  };

  return (
    <div>
      <div className="space-y-4">
        {/* Header */}
        <Header
          user={user}
          onLogout={onLogout}
          onProfileOpen={handleProfileOpen}
        />
        {profileOpen && (
          <PatientProfile
            profile={profile}
            loading={profileLoading}
            error={profileMsg}
            onChange={handleProfileChange}
            onSave={handleProfileSave}
            onClose={handleProfileClose}
            msg={profileMsg}
          />
        )}
        <Tabs value={activeTab} onValueChange={tab => {
          setActiveTab(tab);
          if (tab === 'appointments' && !appointmentsFetched) {
            fetchAppointments({
              start: dateRange.start,
              end: dateRange.end,
            });
            setAppointmentsFetched(true);
          }
        }}>
          <TabsList className="w-full flex">
            <TabsTrigger value="details" className="flex-1">Doctor Details</TabsTrigger>
            <TabsTrigger value="appointments" className="flex-1">Appointments</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4 mt-4">
            <DoctorDetails
              selectedDoctor={selectedDoctor}
              loading={doctorLoading}
              error={doctorError}
              onShowSlots={() => { setShowSlots(true); fetchSlots(); }}
              docPhoneNumber={docPhoneNumber}
            />
          </TabsContent>
          <TabsContent value="appointments" className="mt-4">
            <AppointmentsList
              appointments={appointments}
              filteredAppointments={filteredAppointments}
              statusOptions={statusOptions}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              appointmentsLoading={appointmentsLoading}
              appointmentsError={appointmentsError}
              cancelMsg={cancelMsg}
              onCancel={async (appt) => {
                try {
                  await cancelAppointmentApi(appt.id);
                  setCancelMsg({ type: 'success', text: 'Appointment cancelled successfully.' });
                  setCancelDialog({ open: false });
                  fetchAppointments({ start: dateRange.start, end: dateRange.end });
                } catch (e: any) {
                  setCancelMsg({ type: 'error', text: e?.message || 'Failed to cancel appointment.' });
                  setCancelDialog({ open: false });
                }
                setTimeout(() => setCancelMsg(null), 2500);
              }}
              cancelDialog={cancelDialog}
              setCancelDialog={setCancelDialog}
              getStatusLabel={getStatusLabel}
              fetchAppointments={fetchAppointments}
            />
          </TabsContent>
        </Tabs>
        {/* Book Appointment Modal/Section */}
        <AvailableSlots
          open={showSlots}
          onClose={() => setShowSlots(false)}
          loadingSlots={loadingSlots}
          slotsError={slotsError}
          allDates={allDates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          slotsByDate={slotsByDate}
          selectedSlot={selectedSlot}
          booking={booking}
          handleBookSlot={handleBookSlot}
          successMsg={successMsg}
          confirmOpen={confirmOpen}
          pendingSlot={pendingSlot}
          handleConfirmBook={handleConfirmBook}
          handleCancelBook={handleCancelBook}
          formatTime={formatTime}
        />
      </div>
    </div>
  );
}