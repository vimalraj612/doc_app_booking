import { useState, useEffect } from 'react';
import AppointmentsList from '../common/AppointmentsList';
import { fetchDoctorAppointmentsByDateRange } from '../../api/appointments';
import { AppointmentMessages } from '../../constants/messages';
import { useLocale } from '../../contexts/LocaleContext';
import { getAppointmentStatusOptions, getAppointmentStatusLabel } from '../../constants/dropdownOptions';

interface DoctorAppointmentsTabProps {
  doctorId: string | number;
}

export function DoctorAppointmentsTab({ doctorId }: DoctorAppointmentsTabProps) {
  const { t } = useLocale();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Yesterday
    return {
      start: yesterday.toISOString().slice(0, 10),
      end: today.toISOString().slice(0, 10),
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

  // Fetch doctor appointments for date range
  const fetchAppointments = (customRange?: { start: string; end: string }) => {
    setAppointmentsLoading(true);
    setAppointmentsError('');
    const userId = window.localStorage.getItem('userId');
    if (!userId) {
      setAppointmentsError('User ID not found');
      setAppointmentsLoading(false);
      return;
    }
    const start = customRange?.start || dateRange.start;
    const end = customRange?.end || dateRange.end;
    fetchDoctorAppointmentsByDateRange({
      doctorId: userId,
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
        setAppointmentsError(AppointmentMessages.LOADING_FAILED);
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
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end, doctorId]);

  // Status label helper
  const getStatusLabel = (key: string) => {
    return getAppointmentStatusLabel(key, t);
  };

  // Cancel handler
  const onCancel = (appt: any) => {
    setCancelMsg({ type: 'success', text: AppointmentMessages.CANCEL_SUCCESS });
    setCancelDialog({ open: false });
  };

  return (
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
  );
}
