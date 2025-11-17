import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Calendar, ChevronLeft, ChevronRight, Search, X, User, Clock, Phone, FileText, Filter } from 'lucide-react';
import { updateAppointmentStatusApi } from '../../api/appointments';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { InlineMessage } from '../ui/inline-message';
import { useLocale } from '../../contexts/LocaleContext';

// Helper to safely map gender string to localized value
function getLocalizedGender(gender: string, t: any): string {
  const key = gender.trim().toLowerCase();
  if (key === 'male') return t.gender.male;
  if (key === 'female') return t.gender.female;
  if (key === 'other') return t.gender.other;
  return gender;
}

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
  followUpDate?: string | null;
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
  const { t } = useLocale();

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
        followUpDate ? `${followUpDate}T00:00:00` : undefined
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
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.filters.filterAppointments}</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0 rounded-lg bg-gray-50 p-4 border border-gray-200">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t.filters.dateRange}</Label>
            <div className="flex flex-wrap items-center gap-2 w-full min-w-0">
              <Button
                variant="outline"
                size="sm"
                className="px-2 h-10"
                onClick={() => shiftRange(-1)}
                title={t.filters.previousDay}
              >
                <span>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="sr-only">{t.filters.previousDay}</span>
                </span>
              </Button>

              {/* Today Button for quick access */}
              <Button
                variant="outline"
                size="sm"
                className="px-2 h-10 text-sm"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setDateRange({ start: today, end: today });
                  fetchAppointments({ start: today, end: today });
                }}
                title={t.dateTime.today}
              >
                {t.dateTime.today}
              </Button>

              <Input
                type="date"
                className="flex-1 min-w-0 max-w-[110px] h-10 text-sm"
                value={dateRange.start}
                max={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />

              <span className="text-gray-500 text-sm">{t.filters.to}</span>

              <Input
                type="date"
                className="flex-1 min-w-0 max-w-[110px] h-10 text-sm"
                value={dateRange.end}
                min={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />

              <Button
                variant="outline"
                size="sm"
                className="px-2 h-10"
                onClick={() => shiftRange(1)}
                title={t.filters.nextDay}
              >
                <span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="sr-only">{t.filters.nextDay}</span>
                </span>
              </Button>
            </div>
          </div>

          {/* Status Filter & Actions */}
          <div className="space-y-2">
            <Label htmlFor="statusFilter" className="text-sm font-medium">{t.filters.status}</Label>
            <div className="flex items-center gap-2">
              <select
                id="statusFilter"
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAppointments(dateRange)}
                disabled={appointmentsLoading}
                title={t.filters.search}
                className="flex items-center gap-2 h-10"
              >
                <span>
                  <Search className="w-4 h-4" />
                  <span className="sr-only">{t.filters.search}</span>
                </span>
                <span className="hidden sm:inline text-sm">{t.filters.search}</span>
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
                title={t.filters.clear}
                className="flex items-center gap-1 h-10"
              >
                <span>
                  <X className="w-4 h-4" />
                  <span className="sr-only">{t.filters.clear}</span>
                </span>
                <span className="hidden sm:inline text-sm">{t.filters.clear}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="text-sm h-10"
                title={showMoreFilters ? t.filters.hideMoreFilters : t.filters.showMoreFilters}
              >
                <span>
                  <Filter className="w-4 h-4 sm:mr-1" />
                  <span className="sr-only">{showMoreFilters ? t.filters.hideMoreFilters : t.filters.showMoreFilters}</span>
                </span>
                <span className="hidden sm:inline text-sm">{showMoreFilters ? t.filters.hideMoreFilters : t.filters.showMoreFilters}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        {showMoreFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="doctorNameFilter" className="text-sm font-medium">{t.filters.doctorName}</Label>
              <Input
                id="doctorNameFilter"
                type="text"
                placeholder={t.filters.searchByDoctorName}
                value={doctorNameFilter}
                onChange={(e) => setDoctorNameFilter(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientNameFilter" className="text-sm font-medium">{t.filters.patientName}</Label>
              <Input
                id="patientNameFilter"
                type="text"
                placeholder={t.filters.searchByPatientName}
                value={patientNameFilter}
                onChange={(e) => setPatientNameFilter(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientPhoneFilter" className="text-sm font-medium">{t.filters.patientPhone}</Label>
              <Input
                id="patientPhoneFilter"
                type="text"
                placeholder={t.filters.searchByPhoneNumber}
                value={patientPhoneFilter}
                onChange={(e) => setPatientPhoneFilter(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Appointments List Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
          {t.appointments.appointments} {!appointmentsLoading && displayedAppointments.length > 0 && `(${displayedAppointments.length})`}
        </h3>

        {/* Loading / Error / Empty */}
        {appointmentsLoading && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="animate-spin">⏳</span>
              {t.common.loading} {t.appointments.appointments.toLowerCase()}...
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
                <span>
                  <Calendar className="w-12 h-12 text-gray-400" />
                  <span className="sr-only">{t.appointments.noAppointments}</span>
                </span>
                <p className="font-medium text-sm">{t.appointments.noAppointments}</p>
                <p className="text-sm">
                  {filteredAppointments.length === 0 ? (
                    <>
                      {t.appointments.noAppointmentsBetween} <span className="font-semibold">{dateRange.start}</span> {t.filters.to}{' '}
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
            <div className="space-y-4">
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
                              <span>
                                <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="sr-only">{t.patient.appointeeName}</span>
                              </span>
                              <span className="font-semibold text-gray-900 truncate text-sm">
                                {appt.appointeeName}
                                {appt.appointeeAge && <span className="ml-2 text-gray-600 font-normal">({appt.appointeeAge} {t.appointments.yrs})</span>}
                              </span>
                            </div>
                          )}
                          {/* Patient Phone - Highlighted */}
                          {appt.appointeePhone && (
                            <div className="flex items-center gap-2">
                              <span>
                                <Phone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="sr-only">{t.filters.patientPhone}</span>
                              </span>
                              <span className="font-semibold text-gray-900 break-all text-sm">{appt.appointeePhone}</span>
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
                          <span>
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="sr-only">{t.dateTime.time}</span>
                          </span>
                          <span className="break-words text-sm">
                            {new Date(appt.appointmentDateTime).toLocaleString()}
                          </span>
                        </div>

                        {appt.appointeeGender && (
                          <div className="text-sm">
                            <span className="font-medium">{t.profileFields.gender}:</span> {getLocalizedGender(appt.appointeeGender, t)}
                          </div>
                        )}

                        {appt.followUpDate && (
                          <div className="flex items-start gap-2">
                            <span>
                              <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                              <span className="sr-only">{t.appointments.followUpDate}</span>
                            </span>
                            <div>
                              <span className="font-medium text-purple-700 text-sm">{t.appointments.followUpDate}:</span>
                              <span className="ml-2 text-sm">{new Date(appt.followUpDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {appt.notes !== undefined && appt.notes !== null && appt.notes && (
                          <div className="flex items-start gap-2">
                            <span>
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="sr-only">{t.appointments.notes || 'Notes'}</span>
                            </span>
                            <span className="break-words text-sm italic">{appt.notes}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <span>
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="sr-only">{t.doctor.doctor}</span>
                          </span>
                          <div className="flex-1 min-w-0 text-sm">
                            <span className="font-medium">{t.doctor.doctor}:</span> {appt.doctorName}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      {appt.status === 'SCHEDULED' && (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          {isDoctor ? (
                            <Button
                              size="sm"
                              className="w-full h-10 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => handleComplete(appt)}
                            >
                              {t.appointments.markAsComplete}
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full h-10 text-sm font-medium"
                              onClick={() => setCancelDialog({ open: true, appt })}
                            >
                              {t.appointments.cancelAppointment}
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
        title={t.appointments.cancelAppointment}
        message={
          cancelDialog.appt
            ? `${t.appointments.cancelConfirmMessage} ${cancelDialog.appt.doctorName} ${t.ui.on} ${new Date(
                cancelDialog.appt.appointmentDateTime
              ).toLocaleString()}? This action cannot be undone.`
            : ''
        }
        confirmText={t.appointments.yesCancel}
        cancelText={t.appointments.noKeepIt}
        onConfirm={() => cancelDialog.appt && onCancel(cancelDialog.appt)}
        onCancel={() => setCancelDialog({ open: false })}
      />

      {/* Complete Dialog for Doctor */}
      <Dialog open={completeDialog.open} onOpenChange={(open) => !open && setCompleteDialog({ open: false })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-900">{t.appointments.completeAppointment}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {t.appointments.markAppointmentComplete} <span className="font-semibold text-gray-900">{completeDialog.appt?.doctorName}</span> {t.ui.on}{' '}
              <span className="font-semibold text-gray-900">{completeDialog.appt && new Date(completeDialog.appt.appointmentDateTime).toLocaleString()}</span> as completed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Appointment Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.appointments.appointmentDetails}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">{t.appointments.patientName}</p>
                  <p className="text-sm font-semibold text-gray-900">{completeDialog.appt?.appointeeName || t.appointments.notAvailable}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">{t.appointments.appointmentTime}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {completeDialog.appt && new Date(completeDialog.appt.appointmentDateTime).toLocaleString()}
                  </p>
                </div>
                {completeDialog.appt?.appointeeAge && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{t.profileFields.age}</p>
                    <p className="text-sm font-semibold text-gray-900">{completeDialog.appt.appointeeAge}</p>
                  </div>
                )}
                {completeDialog.appt?.appointeeGender && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{t.profileFields.gender}</p>
                    <p className="text-sm font-semibold text-gray-900">{completeDialog.appt.appointeeGender}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.appointments.followUpInformation}</h3>
              <div className="space-y-2">
                <Label htmlFor="followUpDate" className="text-sm font-medium">
                  {t.appointments.followUpDate} <span className="text-gray-400 font-normal">({t.forms.optional})</span>
                </Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  disabled={completing}
                  className="h-10 text-sm"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-gray-500">{t.appointments.scheduleFollowUp}</p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.appointments.completionNotes}</h3>
              <div className="space-y-2">
                <Label htmlFor="completeNotes" className="text-sm font-medium">
                  {t.appointments.notes} <span className="text-gray-400 font-normal">({t.forms.optional})</span>
                </Label>
                <textarea
                  id="completeNotes"
                  className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder={t.appointments.diagnosisPlaceholder}
                  value={completeNotes}
                  onChange={e => setCompleteNotes(e.target.value)}
                  disabled={completing}
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{t.appointments.provideDetails}</p>
                  <p className="text-sm text-gray-400">{completeNotes.length}/500</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-6 mt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCompleteDialog({ open: false })}
                disabled={completing}
                className="w-full h-10 text-sm"
              >
                {t.common.cancel}
              </Button>
              <Button
                onClick={confirmComplete}
                disabled={completing}
                className="w-full h-10 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {completing ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t.appointments.completing}
                  </>
                ) : (
                  t.appointments.markAsComplete
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