import React, { useState, useEffect } from 'react';
import { User, Appointment, TimeSlot, Doctor } from '../../App';
import { getTodayAppointmentCount, getTodayFreeSlotsCount } from '../../api/doctor';
import { fetchDoctorAppointmentsByDateRange } from '../../api/appointments';
import AppointmentsList from '../common/AppointmentsList';
import { Card, CardContent } from '../ui/card';
import { Calendar as CalendarIcon, Clock, LogOut, Plus, User as UserIcon, Stethoscope, FileText, Check, UserCheck, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DoctorDashboardProps {
  user: User;
  doctor: Doctor;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  onLogout: () => void;
  onAddSlot: (slot: TimeSlot) => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  onAddPrescription: (appointmentId: string, prescription: string, notes: string) => void;
}

export function DoctorDashboard({
  user,
  doctor,
  // appointments prop is ignored for doctor, will fetch via API
  timeSlots,
  onLogout,
  onAddSlot,
  onUpdateAppointmentStatus,
  onAddPrescription,
}: DoctorDashboardProps) {
  // Clear localStorage on window/tab close
  useEffect(() => {
    const handleUnload = () => {
      localStorage.clear();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [prescriptionAppointmentId, setPrescriptionAppointmentId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  // Stats from API
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [freeSlotsCount, setFreeSlotsCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      setStatsError(null);
      try {
        const [todayRes, freeRes] = await Promise.all([
          getTodayAppointmentCount(doctor.id),
          getTodayFreeSlotsCount(doctor.id),
        ]);
        // Type guard for backend response shape
        function extractData(val: any): number {
          if (val && typeof val === 'object' && 'data' in val && typeof val.data === 'number') {
            return val.data;
          }
          if (typeof val === 'number') {
            return val;
          }
          return 0;
        }
        setTodayCount(extractData(todayRes));
        setFreeSlotsCount(extractData(freeRes));
      } catch (err: any) {
        setStatsError('Failed to load stats');
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [doctor.id]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !time) return;

    const newSlot: TimeSlot = {
      id: '',
      doctorId: user.id,
      date: selectedDate.toISOString().split('T')[0],
      time,
      isBooked: false,
    };

    onAddSlot(newSlot);
    setIsAddSlotOpen(false);
    setTime('');
  };

// (stray button removed)


  // AppointmentsList state (mirroring patient dashboard)
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
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


  // Fetch doctor appointments for date range
  const fetchAppointments = (customRange?: { start: string; end: string }) => {
    setAppointmentsLoading(true);
    setAppointmentsError('');
    const doctorId = localStorage.getItem('userId');
    const start = customRange?.start || dateRange.start;
    const end = customRange?.end || dateRange.end;
    fetchDoctorAppointmentsByDateRange({
      doctorId: String(doctorId),
      start: start + 'T00:00:00',
      end: end + 'T23:59:59',
    })
      .then((result) => {
        let appts = Array.isArray(result)
          ? result
          : result && typeof result === 'object' && 'data' in result && Array.isArray((result as any).data)
          ? (result as any).data
          : [];
        setAppointments(appts);
        setAppointmentsFetched(true);
      })
      .catch(() => {
        setAppointmentsError('Failed to load appointments');
        setAppointments([]);
      })
      .finally(() => setAppointmentsLoading(false));
  };

  // Filtering
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((appt) => appt.status === statusFilter));
    }
  }, [appointments, statusFilter]);

  // Fetch on mount or date range change
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end, doctor.id]);

  // Status label helper
  const getStatusLabel = (key: string) => {
    const found = statusOptions.find((opt) => opt.key === key);
    return found ? found.label : key;
  };

  // Cancel handler (dummy for now)
  const onCancel = (appt: any) => {
    setCancelMsg({ type: 'success', text: 'Appointment cancelled (demo)' });
    setCancelDialog({ open: false });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-green-500" />
            <h1 className="text-lg sm:text-xl">Doctor Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Remove profile pic, show only name */}
            <span className="text-sm">{user.name}</span>
            <button onClick={() => { localStorage.clear(); onLogout(); window.location.href = '/login/doctor'; }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 w-full max-w-lg mx-auto">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl">
                {loadingStats ? '...' : statsError ? '--' : todayCount}
              </p>
              <p className="text-xs text-gray-500">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Clock className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl">
                {loadingStats ? '...' : statsError ? '--' : freeSlotsCount}
              </p>
              <p className="text-xs text-gray-500">Free Slots</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Slot Button removed as requested */}

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="slots">My Slots</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-3 mt-4">
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
              onCancel={onCancel}
              cancelDialog={cancelDialog}
              setCancelDialog={setCancelDialog}
              getStatusLabel={getStatusLabel}
              fetchAppointments={fetchAppointments}
              isDoctor={true}
            />
          </TabsContent>

          <TabsContent value="slots" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeSlots.filter(slot => !slot.isBooked).length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center text-gray-500">
                    No available slots
                  </CardContent>
                </Card>
              ) : (
                timeSlots
                  .filter(slot => !slot.isBooked)
                  .sort((a, b) => {
                    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                    if (dateCompare !== 0) return dateCompare;
                    return a.time.localeCompare(b.time);
                  })
                  .map(slot => (
                    <Card key={slot.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default">Available</Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <span>{slot.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{slot.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
