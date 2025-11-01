import React, { useState } from 'react';
import { Button } from '../ui/button';
import { updateAppointmentStatusApi } from '../../api/appointments';
import ConfirmDialog from '../ui/ConfirmDialog';

interface Appointment {
  id: string | number;
  doctorName: string;
  appointmentDateTime: string;
  status: string;
  appointeeName?: string;
  appointeeAge?: string | number;
  appointeePhone?: string;
  appointeeGender?: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  statusOptions: { key: string; label: string }[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  appointmentsLoading: boolean;
  appointmentsError: string;
  cancelMsg: { type: 'success' | 'error'; text: string } | null;
  onCancel: (appt: Appointment) => void;
  cancelDialog: { open: boolean; appt?: Appointment };
  setCancelDialog: (dialog: { open: boolean; appt?: Appointment }) => void;
  getStatusLabel: (key: string) => string;
  fetchAppointments: (range: { start: string; end: string }) => void;
  isDoctor?: boolean;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  filteredAppointments,
  statusOptions,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  appointmentsLoading,
  appointmentsError,
  cancelMsg,
  onCancel,
  cancelDialog,
  setCancelDialog,
  getStatusLabel,
  fetchAppointments,
  isDoctor,
}) => {
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; appt?: Appointment }>({ open: false });
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeMsg, setCompleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [completing, setCompleting] = useState(false);

  const handleComplete = async (appt: Appointment) => {
    setCompleteDialog({ open: true, appt });
    setCompleteNotes('');
  };

  const confirmComplete = async () => {
    if (!completeDialog.appt) return;
    setCompleting(true);
    try {
      await updateAppointmentStatusApi(completeDialog.appt.id, 'COMPLETED', completeNotes);
      setCompleteMsg({ type: 'success', text: 'Appointment marked as completed.' });
      setCompleteDialog({ open: false });
      fetchAppointments(dateRange);
    } catch (e: any) {
      setCompleteMsg({ type: 'error', text: e?.message || 'Failed to complete appointment.' });
      setCompleteDialog({ open: false });
    } finally {
      setCompleting(false);
      setTimeout(() => setCompleteMsg(null), 2500);
    }
  };

  return (
  <div className="max-w-3xl mx-auto">
    <div className="bg-white rounded-xl border shadow p-6">

      {/* Cancel/Complete message */}
      {(cancelMsg || completeMsg) && (
        <div
          className={`mb-2 text-center text-sm font-semibold ${
            (cancelMsg?.type === 'success' || completeMsg?.type === 'success') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {cancelMsg?.text || completeMsg?.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        {/* Date Range */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium">Date Range:</label>
          <input
            type="date"
            className="border rounded px-1 py-0.5 text-xs h-7 w-28"
            value={dateRange.start}
            max={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="date"
            className="border rounded px-1 py-0.5 text-xs h-7 w-28"
            value={dateRange.end}
            min={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <button
            className="ml-1 p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-60 h-7 w-7"
            onClick={() => fetchAppointments(dateRange)}
            disabled={appointmentsLoading}
            title="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <label htmlFor="statusFilter" className="text-xs font-medium">
            Status:
          </label>
          <select
            id="statusFilter"
            className="border rounded px-1 py-0.5 text-xs h-7"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error / Empty */}
      {appointmentsLoading && (
        <div className="py-8 text-center text-gray-500">
          Loading appointments...
        </div>
      )}

      {appointmentsError && (
        <div className="py-8 text-center text-red-500">
          {appointmentsError}
        </div>
      )}

      {!appointmentsLoading &&
        !appointmentsError &&
        filteredAppointments.length === 0 && (
          <div className="py-8 text-center text-gray-500 italic text-xs">
            No appointments found for{' '}
            <span className="font-semibold">{dateRange.start}</span> to{' '}
            <span className="font-semibold">{dateRange.end}</span>.
          </div>
        )}

      {/* Appointment Cards */}
      {!appointmentsLoading &&
        !appointmentsError &&
        filteredAppointments.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredAppointments.map((appt: Appointment) => {
              const statusStyles: Record<
                string,
                { text: string; bg: string; dot: string }
              > = {
                SCHEDULED: {
                  text: 'text-blue-900',
                  bg: 'bg-blue-200',
                  dot: 'bg-blue-600',
                },
                CANCELLED: {
                  text: 'text-red-900',
                  bg: 'bg-red-200',
                  dot: 'bg-red-600',
                },
                COMPLETED: {
                  text: 'text-green-900',
                  bg: 'bg-green-200',
                  dot: 'bg-green-600',
                },
                DEFAULT: {
                  text: 'text-gray-700',
                  bg: 'bg-gray-200',
                  dot: 'bg-gray-400',
                },
              };

              const { text, bg, dot } =
                statusStyles[appt.status] || statusStyles.DEFAULT;

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-xl border shadow p-4 flex flex-col gap-2 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-blue-700 text-sm truncate max-w-[90px]">
                      {appt.doctorName}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${text} ${bg}`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
                        {getStatusLabel(appt.status)}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Dialog */}
                  <ConfirmDialog
                    open={
                      cancelDialog.open && cancelDialog.appt?.id === appt.id
                    }
                    title="Cancel Appointment"
                    message={
                      cancelDialog.appt
                        ? `Are you sure you want to cancel your appointment with ${cancelDialog.appt.doctorName} on ${new Date(
                            cancelDialog.appt.appointmentDateTime
                          ).toLocaleString()}?`
                        : ''
                    }
                    confirmText="Yes, Cancel"
                    cancelText="No"
                    onConfirm={() => onCancel(appt)}
                    onCancel={() => setCancelDialog({ open: false })}
                  />

                  {/* Appointment Date */}
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(appt.appointmentDateTime).toLocaleString()}

                    {appt.appointeeName && (
                      <div><span className="font-medium">Name:</span> {appt.appointeeName}</div>
                    )}
                    {appt.appointeeAge && (
                      <div><span className="font-medium">Age:</span> {appt.appointeeAge}</div>
                    )}
                    {appt.appointeePhone && (
                      <div><span className="font-medium">Phone:</span> {appt.appointeePhone}</div>
                    )}

                    {appt.appointeeGender && (
                      <div><span className="font-medium">Gender:</span> {appt.appointeeGender}</div>
                    )}
                  </div>
                  {/* Action buttons fixed to bottom-left of the card */}
                  <div className="mt-2 flex items-center justify-start gap-2">
                    {appt.status === 'SCHEDULED' && isDoctor && (
                      <Button
                        variant="default"
                        size="sm"
                        className="px-2 py-1 text-xs min-w-[80px]"
                        onClick={() => handleComplete(appt)}
                      >
                        Complete
                      </Button>
                    )}
                    {appt.status === 'SCHEDULED' && !isDoctor && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="px-2 py-1 text-xs min-w-[80px]"
                        onClick={() => setCancelDialog({ open: true, appt })}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Complete Dialog for Doctor */}
      {completeDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-2 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              <div className="text-lg font-bold mb-2 text-gray-800">Complete Appointment</div>
              <div className="text-sm text-gray-600 mb-4">
                Are you sure you want to mark the appointment with <span className="font-semibold text-blue-700">{completeDialog.appt?.doctorName}</span><br />
                on <span className="font-semibold">{completeDialog.appt && new Date(completeDialog.appt.appointmentDateTime).toLocaleString()}</span> as <span className="font-semibold text-green-700">completed</span>?
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
                rows={3}
                placeholder="Add notes (optional)"
                value={completeNotes}
                onChange={e => setCompleteNotes(e.target.value)}
                disabled={completing}
              />
              <div className="flex gap-3 justify-center w-full mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCompleteDialog({ open: false })}
                  disabled={completing}
                >Cancel</Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={confirmComplete}
                  disabled={completing}
                >{completing ? 'Completing...' : 'Complete'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default AppointmentsList;
