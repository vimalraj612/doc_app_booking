import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import AppointmentsList from '../common/AppointmentsList';
import { updateAppointmentStatusApi } from '../../api/appointments';
import { getAppointmentStatusLabel } from '../../constants/dropdownOptions';
import { useLocale } from '../../contexts/LocaleContext';

interface AppointmentsTabProps {
  hospitalAppointments: any[];
  statusOptions: Array<{ key: string; label: string }>;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  hospitalAppointmentsLoading: boolean;
  hospitalAppointmentsError: string;
  cancelMsg: { type: 'success' | 'error'; text: string } | null;
  setCancelMsg: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  cancelDialog: { open: boolean };
  setCancelDialog: (dialog: { open: boolean }) => void;
  fetchAppointments: (range?: { start: string; end: string }) => Promise<void>;
  selectedDoctorFilter: string | null;
  setSelectedDoctorFilter: (doctor: string | null) => void;
}

export function AppointmentsTab({
  hospitalAppointments,
  statusOptions,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  hospitalAppointmentsLoading,
  hospitalAppointmentsError,
  cancelMsg,
  setCancelMsg,
  cancelDialog,
  setCancelDialog,
  fetchAppointments,
  selectedDoctorFilter,
  setSelectedDoctorFilter,
}: AppointmentsTabProps) {
  const { t } = useLocale();

  // Reload appointments whenever the tab is activated
  // This assumes parent controls tab value and remounts, but for safety, useEffect on mount
  React.useEffect(() => {
    fetchAppointments({ start: dateRange.start, end: dateRange.end });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
            setCancelMsg({ type: 'success', text: t.messages.APPOINTMENT.COMPLETE_SUCCESS });
            setCancelDialog({ open: false });
            await fetchAppointments({ start: dateRange.start, end: dateRange.end });
          } catch (e: any) {
            setCancelMsg({ type: 'error', text: e?.message || t.messages.APPOINTMENT.COMPLETE_FAILED });
            setCancelDialog({ open: false });
          }
          setTimeout(() => setCancelMsg(null), 2500);
        }}
        cancelDialog={cancelDialog}
        setCancelDialog={setCancelDialog}
        getStatusLabel={(key: string) => getAppointmentStatusLabel(key, t)}
        fetchAppointments={fetchAppointments}
        isDoctor={true}
      />
    </TabsContent>
  );
}
