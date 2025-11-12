import { useState, useEffect } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { fetchDoctorByPhone } from '../../api/doctor';
import { fetchPatientAppointmentsByDateRange } from '../../api/appointments';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import PatientProfile from './PatientProfile';
import { BookAppointmentTab } from './BookAppointmentTab';
import { PatientAppointmentsTab } from './PatientAppointmentsTab';
import { getPatientUserProfile, updatePatientProfile, PatientProfile as PatientProfileType } from '../../api/user';
import { ProfileMessages, AppointmentMessages } from '../../constants/messages';

export interface PatientDashboardProps {
  onLogout: () => void;
}

export function PatientDashboard({ onLogout }: PatientDashboardProps) {
  // Clear localStorage on logout
  const handleLogout = () => {
    window.localStorage.removeItem('userId');
    window.localStorage.removeItem('patientName');
    window.localStorage.removeItem('name');
    window.localStorage.removeItem('phoneNumber');
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('docPhoneNumber');
    onLogout();
    window.location.href = '/login/patient';
  };

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
      setProfile(resp && resp.data ? resp.data : null);
    } catch (e) {
      setProfileMsg(ProfileMessages.LOADING_FAILED);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileOpen = () => {
    setProfileMsg(null);
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
      setProfileMsg(ProfileMessages.UPDATED_SUCCESS);
      setTimeout(() => setProfileMsg(null), 2000);
    } catch (e) {
      setProfileMsg(ProfileMessages.UPDATE_FAILED);
    } finally {
      setProfileLoading(false);
    }
  };

  // Get user name
  const getUserName = () => {
    const patientName = window.localStorage.getItem('name');
    if (patientName && patientName.trim()) return patientName;
    const phone = window.localStorage.getItem('phoneNumber');
    if (phone && phone.trim()) return phone;
    return 'Patient';
  };
  const [user, setUser] = useState<{ name: string; profileImage?: string }>({ name: getUserName() });

  useEffect(() => {
    setUser({ name: getUserName() });
  }, []);

  // Doctor state (for booking tab)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');

  // Fetch doctor by phone number
  const getPhoneNumberFromQuery = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('docPhoneNumber');
  };

  const getStoredPhoneNumber = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('docPhoneNumber');
  };

  const docPhoneNumber = getPhoneNumberFromQuery() || getStoredPhoneNumber() || '';

  useEffect(() => {
    if (docPhoneNumber) {
      setDoctorLoading(true);
      setDoctorError('');
      fetchDoctorByPhone(docPhoneNumber)
        .then((doctor) => {
          if (doctor) {
            setSelectedDoctor(doctor);
            setDoctorError('');
          } else {
            setSelectedDoctor(null);
            setDoctorError('Doctor not found');
          }
        })
        .catch((e: any) => {
          setDoctorError(e?.message || 'Failed to load doctor details');
          setSelectedDoctor(null);
        })
        .finally(() => setDoctorLoading(false));
    }
  }, [docPhoneNumber]);

  // Appointments state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Yesterday
    return {
      start: yesterday.toISOString().slice(0, 10),
      end: today.toISOString().slice(0, 10),
    };
  });
  const [cancelMsg, setCancelMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointment?: any }>({ open: false });
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);

  const fetchAppointments = async (params: { start: string; end: string }) => {
    const patientPhone = window.localStorage.getItem('phoneNumber');
    const patientId = window.localStorage.getItem('userId');
    if (!patientId) return;
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      const result = await fetchPatientAppointmentsByDateRange({
        patientId,
        start: params.start + 'T00:00:00',
        end: params.end + 'T23:59:59',
      });
      if (result && result.data) {
        setAppointments(result.data);
        setAppointmentsError('');
      } else {
        setAppointments([]);
        setAppointmentsError('');
      }
    } catch (e: any) {
      setAppointmentsError(e?.message || AppointmentMessages.LOADING_FAILED);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      BOOKED: 'Booked',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
      NO_SHOW: 'No Show',
    };
    return map[status] || status;
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];

  const filteredAppointments =
    statusFilter === 'all' ? appointments : appointments.filter((a) => a.status === statusFilter);

  // Tab state
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Patient icon */}
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span className="font-semibold text-blue-600">Patient Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600 bg-transparent" />
            </button>
            <button onClick={handleProfileOpen} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <UserIcon className="w-5 h-5 text-gray-600 bg-transparent" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
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

        <Tabs
          value={activeTab}
          onValueChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'appointments' && !appointmentsFetched) {
              fetchAppointments({
                start: dateRange.start,
                end: dateRange.end,
              });
              setAppointmentsFetched(true);
            }
          }}
        >
          <TabsList className="w-full flex">
            <TabsTrigger value="details" className="flex-1">
              Doctor Details
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex-1">
              Appointments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <BookAppointmentTab
              selectedDoctor={selectedDoctor}
              doctorLoading={doctorLoading}
              doctorError={doctorError}
              docPhoneNumber={docPhoneNumber}
            />
          </TabsContent>

          <TabsContent value="appointments" className="mt-4">
            <PatientAppointmentsTab
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
              setCancelMsg={setCancelMsg}
              cancelDialog={cancelDialog}
              setCancelDialog={setCancelDialog}
              getStatusLabel={getStatusLabel}
              fetchAppointments={fetchAppointments}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
