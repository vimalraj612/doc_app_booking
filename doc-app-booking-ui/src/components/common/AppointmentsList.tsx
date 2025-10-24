import React from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';

interface Appointment {
  id: string | number;
  doctorName: string;
  appointmentDateTime: string;
  status: string;
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
}) => (
  <div className="max-w-3xl mx-auto">
    <div className="bg-white rounded-xl border shadow p-6">

      {/* Cancel message */}
      {cancelMsg && (
        <div
          className={`mb-2 text-center text-sm font-semibold ${
            cancelMsg.type === 'success' ? 'text-green-700' : 'text-red-600'
          }`}
        >
          {cancelMsg.text}
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
          <div className="py-8 text-center text-gray-500 italic">
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
            {filteredAppointments.map((appt) => {
              const statusStyles: Record<
                string,
                { text: string; bg: string; dot: string }
              > = {
                SCHEDULED: {
                  text: 'text-blue-800',
                  bg: 'bg-blue-100',
                  dot: 'bg-blue-500',
                },
                CANCELLED: {
                  text: 'text-red-800',
                  bg: 'bg-red-100',
                  dot: 'bg-red-500',
                },
                COMPLETED: {
                  text: 'text-green-800',
                  bg: 'bg-green-100',
                  dot: 'bg-green-500',
                },
                PENDING: {
                  text: 'text-amber-800',
                  bg: 'bg-amber-100',
                  dot: 'bg-amber-500',
                },
                RESCHEDULED: {
                  text: 'text-purple-800',
                  bg: 'bg-purple-100',
                  dot: 'bg-purple-500',
                },
                DEFAULT: {
                  text: 'text-gray-700',
                  bg: 'bg-gray-100',
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
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-700 text-sm">
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

                      {/* Fixed-width cancel button container */}
                      <div className="w-6 h-6 flex items-center justify-center">
                        {appt.status === 'SCHEDULED' && (
                          <button
                            className="p-1 rounded-full hover:bg-red-100 text-red-600 transition"
                            title="Cancel Appointment"
                            onClick={() => setCancelDialog({ open: true, appt })}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="red"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
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
                    </div>
                  </div>

                  {/* Appointment Date */}
                  <div className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(appt.appointmentDateTime).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  </div>
);

export default AppointmentsList;
