import AppointmentsList from '../common/AppointmentsList';
import { cancelAppointmentApi } from '../../api/appointments';
import { AppointmentMessages } from '../../constants/messages';

interface PatientAppointmentsTabProps {
  appointments: any[];
  filteredAppointments: any[];
  statusOptions: any[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  appointmentsLoading: boolean;
  appointmentsError: string;
  cancelMsg: { type: 'success' | 'error'; text: string } | null;
  setCancelMsg: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  cancelDialog: { open: boolean; appointment?: any };
  setCancelDialog: (dialog: { open: boolean; appointment?: any }) => void;
  getStatusLabel: (status: string) => string;
  fetchAppointments: (params: { start: string; end: string }) => Promise<void>;
}

export function PatientAppointmentsTab({
  appointments,
  filteredAppointments,
  statusOptions,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  appointmentsLoading,
  appointmentsError,
  cancelMsg,
  setCancelMsg,
  cancelDialog,
  setCancelDialog,
  getStatusLabel,
  fetchAppointments,
}: PatientAppointmentsTabProps) {
  const handleCancelAppointment = async (appt: any) => {
    try {
      await cancelAppointmentApi(appt.id);
      setCancelMsg({ type: 'success', text: AppointmentMessages.CANCEL_SUCCESS });
      setCancelDialog({ open: false });
      fetchAppointments({ start: dateRange.start, end: dateRange.end });
    } catch (e: any) {
      setCancelMsg({ type: 'error', text: e?.message || AppointmentMessages.CANCEL_FAILED });
      setCancelDialog({ open: false });
    }
    setTimeout(() => setCancelMsg(null), 2500);
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
      onCancel={handleCancelAppointment}
      cancelDialog={cancelDialog}
      setCancelDialog={setCancelDialog}
      getStatusLabel={getStatusLabel}
      fetchAppointments={fetchAppointments}
    />
  );
}
