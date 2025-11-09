import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Calendar, ChevronLeft, ChevronRight, Search, X, User, Clock, Phone, FileText } from 'lucide-react';
import { updateAppointmentStatusApi } from '../../api/appointments';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { InlineMessage } from '../ui/inline-message';

interface Appointment {
  id: string | number;
  doctorName: string;
  appointmentDateTime: string;
  status: string;
  appointeeName?: string;
  appointeeAge?: string | number;
  appointeePhone?: string;
  appointeeGender?: string;
  notes?: string | null;
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
  const [followUpDate, setFollowUpDate] = useState('');
  const [completeMsg, setCompleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [completing, setCompleting] = useState(false);
  
  // Additional filters
  const [doctorNameFilter, setDoctorNameFilter] = useState('');
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [patientPhoneFilter, setPatientPhoneFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const handleComplete = async (appt: Appointment) => {
    setCompleteDialog({ open: true, appt });
    setCompleteNotes('');
    setFollowUpDate('');
  };

  const confirmComplete = async () => {
    if (!completeDialog.appt) return;
    setCompleting(true);
    try {
      await updateAppointmentStatusApi(
        completeDialog.appt.id, 
        'COMPLETED', 
        completeNotes,
        followUpDate || undefined
      );
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

  const shiftRange = (days: number) => {
    // shift both start and end by `days`. If empty, use today as base.
    const parse = (s: string) => (s ? new Date(s) : new Date());
    const startDate = parse(dateRange.start);
    const endDate = parse(dateRange.end || dateRange.start || dateRange.start);
    const ns = new Date(startDate);
    ns.setDate(ns.getDate() + days);
    const ne = new Date(endDate);
    ne.setDate(ne.getDate() + days);
    const a = ns.toISOString().slice(0, 10);
    const b = ne.toISOString().slice(0, 10);
    setDateRange({ start: a, end: b });
    fetchAppointments({ start: a, end: b });
  };

  // Apply additional filters
  const applyAdditionalFilters = (appointments: Appointment[]) => {
    return appointments.filter((appt) => {
      const matchesDoctorName = !doctorNameFilter || 
        appt.doctorName?.toLowerCase().includes(doctorNameFilter.toLowerCase());
      const matchesPatientName = !patientNameFilter || 
        appt.appointeeName?.toLowerCase().includes(patientNameFilter.toLowerCase());
      const matchesPatientPhone = !patientPhoneFilter || 
        appt.appointeePhone?.includes(patientPhoneFilter);
      
      return matchesDoctorName && matchesPatientName && matchesPatientPhone;
    });
  };

  const displayedAppointments = applyAdditionalFilters(filteredAppointments);

  return (
    <div className="space-y-6">
      {/* Messages */}
      {(cancelMsg || completeMsg) && (
        <InlineMessage 
          type={(cancelMsg?.type === 'success' || completeMsg?.type === 'success') ? 'success' : 'error'} 
          message={cancelMsg?.text || completeMsg?.text || ''} 
        />
      )}

      {/* Filters Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Filter Appointments</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-2"
                onClick={() => shiftRange(-1)}
                title="Previous day"
              >
                <ChevronLeft className="w-4 h-4 bg-transparent" />
              </Button>

              <Input
                type="date"
                className="flex-1"
                value={dateRange.start}
                max={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />

              <span className="text-gray-500 text-sm">to</span>

              <Input
                type="date"
                className="flex-1"
                value={dateRange.end}
                min={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />

              <Button
                variant="outline"
                size="sm"
                className="px-2"
                onClick={() => shiftRange(1)}
                title="Next day"
              >
                <ChevronRight className="w-4 h-4 bg-transparent" />
              </Button>
            </div>
          </div>

          {/* Status Filter & Actions */}
          <div className="space-y-2">
            <Label htmlFor="statusFilter" className="text-sm font-medium">Status</Label>
            <div className="flex items-center gap-2">
              <select
                id="statusFilter"
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {statusOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppointments(dateRange)}
                disabled={appointmentsLoading}
                title="Search appointments"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4 bg-transparent" />
                <span className="hidden sm:inline">Search</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => { 
                  setStatusFilter('ALL');
                  setDoctorNameFilter('');
                  setPatientNameFilter('');
                  setPatientPhoneFilter('');
                  const today = new Date();
                  const start = today.toISOString().slice(0, 10);
                  const end = new Date(today.setDate(today.getDate() + 2)).toISOString().slice(0, 10);
                  setDateRange({ start, end }); 
                  fetchAppointments({ start, end }); 
                }}
                title="Clear filters"
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4 bg-transparent" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>
        </div>

        {/* More Filters Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="text-xs"
          >
            {showMoreFilters ? 'Hide' : 'Show'} More Filters
          </Button>
        </div>

        {/* Additional Filters */}
        {showMoreFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="doctorNameFilter" className="text-sm font-medium">Doctor Name</Label>
              <Input
                id="doctorNameFilter"
                type="text"
                placeholder="Search by doctor name..."
                value={doctorNameFilter}
                onChange={(e) => setDoctorNameFilter(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientNameFilter" className="text-sm font-medium">Patient Name</Label>
              <Input
                id="patientNameFilter"
                type="text"
                placeholder="Search by patient name..."
                value={patientNameFilter}
                onChange={(e) => setPatientNameFilter(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientPhoneFilter" className="text-sm font-medium">Patient Phone</Label>
              <Input
                id="patientPhoneFilter"
                type="text"
                placeholder="Search by phone number..."
                value={patientPhoneFilter}
                onChange={(e) => setPatientPhoneFilter(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Appointments List Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          Appointments {!appointmentsLoading && displayedAppointments.length > 0 && `(${displayedAppointments.length})`}
        </h3>

        {/* Loading / Error / Empty */}
        {appointmentsLoading && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="animate-spin">⏳</span>
              Loading appointments...
            </div>
          </div>
        )}

        {appointmentsError && (
          <InlineMessage type="error" message={appointmentsError} />
        )}

        {!appointmentsLoading &&
          !appointmentsError &&
          displayedAppointments.length === 0 && (
            <div className="p-6 text-center text-gray-600">
              <div className="flex flex-col items-center gap-3">
                <Calendar className="w-12 h-12 text-gray-400 bg-transparent" />
                <p className="font-medium">No appointments found</p>
                <p className="text-sm">
                  {filteredAppointments.length === 0 ? (
                    <>
                      No appointments between <span className="font-semibold">{dateRange.start}</span> and{' '}
                      <span className="font-semibold">{dateRange.end}</span>
                    </>
                  ) : (
                    'No appointments match your filter criteria'
                  )}
                </p>
              </div>
            </div>
          )}

        {/* Appointment Cards */}
        {!appointmentsLoading &&
          !appointmentsError &&
          displayedAppointments.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedAppointments.map((appt: Appointment) => {
                const statusStyles: Record<
                  string,
                  { text: string }
                > = {
                  SCHEDULED: {
                    text: 'text-blue-600',
                  },
                  CANCELLED: {
                    text: 'text-red-600',
                  },
                  COMPLETED: {
                    text: 'text-green-600',
                  },
                  PENDING: {
                    text: 'text-yellow-600',
                  },
                  RESCHEDULED: {
                    text: 'text-purple-600',
                  },
                  DEFAULT: {
                    text: 'text-gray-600',
                  },
                };

                const { text } =
                  statusStyles[appt.status] || statusStyles.DEFAULT;

                return (
                  <div
                    key={appt.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Patient Name - Highlighted at top */}
                          {appt.appointeeName && (
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-blue-500 bg-transparent flex-shrink-0" />
                              <span className="font-semibold text-gray-900 truncate">
                                {appt.appointeeName}
                                {appt.appointeeAge && <span className="ml-2 text-gray-600 font-normal">({appt.appointeeAge} yrs)</span>}
                              </span>
                            </div>
                          )}
                          {/* Patient Phone - Highlighted */}
                          {appt.appointeePhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-blue-500 bg-transparent flex-shrink-0" />
                              <span className="font-semibold text-gray-900 break-all">{appt.appointeePhone}</span>
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${text} whitespace-nowrap`}>
                          {getStatusLabel(appt.status)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-gray-400 bg-transparent flex-shrink-0 mt-0.5" />
                          <span className="break-words">
                            {new Date(appt.appointmentDateTime).toLocaleString()}
                          </span>
                        </div>

                        {appt.appointeeGender && (
                          <div className="text-xs">
                            <span className="font-medium">Gender:</span> {appt.appointeeGender}
                          </div>
                        )}

                        {appt.notes !== undefined && appt.notes !== null && appt.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 bg-transparent flex-shrink-0 mt-0.5" />
                            <span className="break-words text-xs italic">{appt.notes}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 bg-transparent flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">Doctor:</span> {appt.doctorName}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {appt.status === 'SCHEDULED' && (
                        <div className="pt-3 mt-3 border-t border-gray-300">
                          {isDoctor ? (
                            <Button
                              size="sm"
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => handleComplete(appt)}
                            >
                              Mark as Complete
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full font-medium"
                              onClick={() => setCancelDialog({ open: true, appt })}
                            >
                              Cancel Appointment
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={cancelDialog.open}
        title="Cancel Appointment"
        message={
          cancelDialog.appt
            ? `Are you sure you want to cancel your appointment with ${cancelDialog.appt.doctorName} on ${new Date(
                cancelDialog.appt.appointmentDateTime
              ).toLocaleString()}? This action cannot be undone.`
            : ''
        }
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        onConfirm={() => cancelDialog.appt && onCancel(cancelDialog.appt)}
        onCancel={() => setCancelDialog({ open: false })}
      />

      {/* Complete Dialog for Doctor */}
      <Dialog open={completeDialog.open} onOpenChange={(open) => !open && setCompleteDialog({ open: false })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-900">Complete Appointment</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Mark the appointment with <span className="font-semibold text-gray-900">{completeDialog.appt?.doctorName}</span> on{' '}
              <span className="font-semibold text-gray-900">{completeDialog.appt && new Date(completeDialog.appt.appointmentDateTime).toLocaleString()}</span> as completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Appointment Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Appointment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Patient Name</p>
                  <p className="text-sm font-semibold text-gray-900">{completeDialog.appt?.appointeeName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase">Appointment Time</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {completeDialog.appt && new Date(completeDialog.appt.appointmentDateTime).toLocaleString()}
                  </p>
                </div>
                {completeDialog.appt?.appointeeAge && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Age</p>
                    <p className="text-sm font-semibold text-gray-900">{completeDialog.appt.appointeeAge}</p>
                  </div>
                )}
                {completeDialog.appt?.appointeeGender && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Gender</p>
                    <p className="text-sm font-semibold text-gray-900">{completeDialog.appt.appointeeGender}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Follow-up Information</h3>
              <div className="space-y-2">
                <Label htmlFor="followUpDate" className="text-sm font-medium text-gray-700">
                  Follow-up Date <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  disabled={completing}
                  className="w-full h-10"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">Schedule a follow-up appointment if needed</p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Completion Notes</h3>
              <div className="space-y-2">
                <Label htmlFor="completeNotes" className="text-sm font-medium text-gray-700">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <textarea
                  id="completeNotes"
                  className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Add diagnosis, treatment details, or any other relevant notes..."
                  value={completeNotes}
                  onChange={e => setCompleteNotes(e.target.value)}
                  disabled={completing}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Provide details about the completed appointment</p>
                  <p className="text-xs text-gray-400">{completeNotes.length}/500</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6 mt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setCompleteDialog({ open: false })}
                disabled={completing}
                className="w-full h-11 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmComplete}
                disabled={completing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {completing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Completing...
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsList;
