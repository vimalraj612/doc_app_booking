import React, { useState, useEffect } from 'react';
import { User, Appointment, TimeSlot, Doctor } from '../../App';
import { getTodayAppointmentCount, getTodayFreeSlotsCount } from '../../api/doctor';
import { Card, CardContent } from '../ui/card';
import DoctorAvailableSlot from './DoctorAvailableSlots';
import { Calendar as CalendarIcon, Clock, LogOut, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DoctorAppointmentsTab } from './DoctorAppointmentsTab';
import { DoctorMessages } from '../../constants/messages';
import { useLocale } from '../../contexts/LocaleContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

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
  timeSlots,
  onLogout,
  onAddSlot,
  onUpdateAppointmentStatus,
  onAddPrescription,
}: DoctorDashboardProps) {
  const { t } = useLocale();
  
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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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
        setStatsError(DoctorMessages.LOADING_FAILED);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [doctor.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-green-500" />
            <h1 className="text-lg sm:text-xl">{t.portals.doctorPortal}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            <LanguageSwitcher />
            <button
              onClick={() => {
                localStorage.clear();
                onLogout();
                window.location.href = '/login/doctor';
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
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
              <p className="text-2xl">{loadingStats ? '...' : statsError ? '--' : todayCount}</p>
              <p className="text-xs text-gray-500">{t.dateTime.today}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Clock className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl">{loadingStats ? '...' : statsError ? '--' : freeSlotsCount}</p>
              <p className="text-xs text-gray-500">{t.doctor.freeSlots}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">{t.appointments.appointments}</TabsTrigger>
            <TabsTrigger value="slots">{t.doctor.mySlots}</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-3 mt-4">
            <DoctorAppointmentsTab doctorId={doctor.id} />
          </TabsContent>

          <TabsContent value="slots" className="space-y-3 mt-4">
            <DoctorAvailableSlot
              doctorId={doctor.id}
              selectedSlot={null}
              booking={false}
              handleBookSlot={() => {}}
              confirmOpen={false}
              pendingSlot={null}
              handleConfirmBook={() => {}}
              handleCancelBook={() => {}}
              successMsg={''}
              formatTime={(t) => t.slice(11, 16)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
