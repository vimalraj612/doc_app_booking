import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';
import { fetchSlotsByDoctorIdAndDate } from '../../api/appointments';
import { fetchDoctorLeavesForDoctor } from '../../api/doctorLeaves';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { PhoneInput } from '../ui/phone-input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { InlineMessage } from '../ui/inline-message';
import { ValidationMessages, SlotMessages } from '../../constants/messages';
import { validateAndFormatPhone, sanitizePhoneInput } from '../../utils/phoneUtils';

interface Slot {
  slotId: string | number;
  start: string;
  end: string;
  available: boolean;
  status?: 'AVAILABLE' | 'SCHEDULED';
}

interface PatientAvailableSlotsProps {
  open: boolean;
  onClose: () => void;
  doctorId: string | number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSlot: Slot | null;
  booking: boolean;
  handleBookSlot: (slot: Slot) => void;
  confirmOpen: boolean;
  pendingSlot: Slot | null;
  handleConfirmBook: (appointeeData: { appointeeName: string; appointeeAge: string; appointeePhone: string; appointeeGender: string }) => void;
  handleCancelBook: () => void;
  successMsg: string;
  formatTime: (time: string) => string;
}

const PatientAvailableSlots: React.FC<PatientAvailableSlotsProps> = ({
  open,
  onClose,
  doctorId,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  booking,
  handleBookSlot,
  confirmOpen,
  pendingSlot,
  handleConfirmBook,
  handleCancelBook,
  successMsg,
  formatTime,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [leaveDates, setLeaveDates] = useState<Set<string>>(new Set());
  const [leaveLoading, setLeaveLoading] = useState(true);
  // Appointee fields
  const [appointeeName, setAppointeeName] = useState('');
  const [appointeeAge, setAppointeeAge] = useState('');
  const [appointeePhone, setAppointeePhone] = useState('');
  const [appointeeGender, setAppointeeGender] = useState('');
  const [appointeeNameError, setAppointeeNameError] = useState('');
  const [appointeeAgeError, setAppointeeAgeError] = useState('');
  const [appointeePhoneError, setAppointeePhoneError] = useState('');
  const [appointeeGenderError, setAppointeeGenderError] = useState('');

  // Reload slots only when appointment is booked successfully (avoid infinite reloads)
  useEffect(() => {
    if (successMsg && successMsg.toLowerCase().includes('booked')) {
      const timeout = setTimeout(() => {
        if (selectedDate) {
          fetchSlotsByDoctorIdAndDate(doctorId, selectedDate).then(res => setSlots(res.data));
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [successMsg, doctorId, selectedDate]);

  // Default date when modal opens
  useEffect(() => {
    if (open && !selectedDate) {
      setSelectedDate(new Date().toISOString().slice(0, 10));
    }
    // eslint-disable-next-line
  }, [open]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const loadSlots = async () => {
      setLoadingSlots(true);
      setSlotsError('');
      try {
        const res = await fetchSlotsByDoctorIdAndDate(doctorId, selectedDate);
        setSlots(res.data);
      } catch (err: any) {
        setSlotsError(err.message || SlotMessages.LOADING_FAILED);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, doctorId]);

  // Load leaves for the selected doctor/date so we can disable booking when on leave
  useEffect(() => {
    if (!selectedDate || !doctorId) {
      setLeaveDates(new Set());
      setLeaveLoading(false);
      return;
    }
    let mounted = true;
    setLeaveLoading(true);
    const loadLeaves = async () => {
      try {
        const res = await fetchDoctorLeavesForDoctor(doctorId as any);
        if (!mounted) return;
        // Normalize leave dates to YYYY-MM-DD to match the date picker value
        const normalized = (res || []).map((d: any) => {
          try {
            // If API already returns YYYY-MM-DD, this will still work.
            return new Date(d.date).toISOString().slice(0, 10);
          } catch (_) {
            return String(d.date).slice(0, 10);
          }
        });
        setLeaveDates(new Set<string>(normalized));
      } catch (err) {
        // ignore
        if (mounted) setLeaveDates(new Set());
      } finally {
        if (mounted) setLeaveLoading(false);
      }
    };
    void loadLeaves();
    return () => { mounted = false; };
  }, [selectedDate, doctorId]);

  if (!open) return null;

  const slotsByDate = { [selectedDate]: slots };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-900">Available Slots</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Select a date to view available appointment slots
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {loadingSlots && (
              <div className="flex items-center justify-center py-8">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <span className="animate-spin">⏳</span>
                  Loading slots...
                </div>
              </div>
            )}
            {slotsError && <InlineMessage type="error" message={slotsError} />}

            {!loadingSlots && !slotsError && (
              <div className="space-y-4">
                {/* Date Picker Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Select Date</h3>
                  <div className="flex justify-center">
                    <Input
                      id="slot-date-picker"
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      className="h-10 max-w-xs"
                    />
                  </div>
                </div>

                {successMsg && (
                  <InlineMessage type="success" message={successMsg} />
                )}

                {/* Slots Grid Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Available Time Slots</h3>
                  <div className="flex justify-center">
                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        {selectedDate && (
                          <motion.div
                            key={selectedDate}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                          >
                            {(!slotsByDate[selectedDate] || slotsByDate[selectedDate].length === 0) ? (
                              <div className="text-gray-500 italic text-center py-2 text-xs">No slots for this date</div>
                            ) : (
                              <>
                                {leaveDates.has(selectedDate) ? (
                                  <div className="text-center py-2 w-full">
                                    <div className="text-orange-700 bg-orange-50 border border-orange-100 rounded p-2 text-sm">Doctor is on leave this day — booking disabled.</div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar" style={{ maxHeight: '62vh', minHeight: '80px', justifyContent: 'center', alignItems: 'center', padding: '3px' }}>
                                {slotsByDate[selectedDate]
                                  .slice()
                                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                                  .map((slot) => {
                                    const anySlot: any = slot as any;
                                    const appointmentStatus = anySlot.hasOwnProperty('appointmentStatus') ? anySlot.appointmentStatus : undefined;

                                    let statusValue: string;
                                    if (appointmentStatus !== undefined) {
                                      statusValue = appointmentStatus === null ? 'AVAILABLE' : String(appointmentStatus);
                                    } else if (slot.available) {
                                      statusValue = 'AVAILABLE';
                                    } else if (anySlot.status) {
                                      statusValue = String(anySlot.status);
                                    } else {
                                      statusValue = 'SCHEDULED';
                                    }

                                    const isReserved = statusValue === 'RESERVED' || anySlot.reserved === true || anySlot.isReserved === true || !!anySlot.reservedBy;

                                    let status: string;
                                    switch (String(statusValue).toUpperCase()) {
                                      case 'AVAILABLE':
                                        status = 'AVAILABLE';
                                        break;
                                      case 'RESERVED':
                                        status = 'RESERVED';
                                        break;
                                      case 'SCHEDULED':
                                        status = 'SCHEDULED';
                                        break;
                                      case 'COMPLETED':
                                        status = 'COMPLETED';
                                        break;
                                      case 'CANCELLED':
                                        status = 'CANCELLED';
                                        break;
                                      default:
                                        status = slot.available ? 'AVAILABLE' : 'SCHEDULED';
                                    }

                                    if (isReserved) status = 'RESERVED';

                                    const statusMap: any = {
                                      AVAILABLE: { color: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Available' },
                                      SCHEDULED: { color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Scheduled' },
                                      RESERVED: { color: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Reserved' },
                                      COMPLETED: { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Completed' },
                                      CANCELLED: { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Cancelled' },
                                    };
                                    const statusInfo = statusMap[status] || statusMap['SCHEDULED'];
                                    const isClickable = status === 'AVAILABLE' && !booking && !leaveLoading && !leaveDates.has(selectedDate);

                                    const colorHexMap: Record<string, { bg: string; border: string; text: string }> = {
                                      AVAILABLE: { bg: '#ecfdf5', border: '#bbf7d0', text: '#166534' },
                                      SCHEDULED: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
                                      RESERVED: { bg: '#fff7ed', border: '#fed7aa', text: '#b45309' },
                                      COMPLETED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                                      CANCELLED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                                    };
                                    const hex = colorHexMap[status] || colorHexMap['SCHEDULED'];

                                    return (
                                      <button
                                        key={String(slot.slotId)}
                                        disabled={!isClickable}
                                        onClick={() => isClickable && handleBookSlot(slot)}
                                        className={`relative p-[1px] rounded-md border flex flex-col items-center justify-center min-w-[20px] min-h-[14px] max-w-[26px] max-h-[16px] transition-all duration-200 ease-in-out text-center backdrop-blur-sm shadow-sm ${!isClickable ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}`}
                                        style={{ backgroundColor: hex.bg, borderColor: hex.border, color: hex.text, borderStyle: 'solid' }}
                                      >
                                        <span className={`font-semibold text-[5.5px] leading-tight`} style={{ color: hex.text }}>{formatTime(slot.start)}</span>
                                        <span className={`text-[4px] leading-tight`} style={{ color: hex.text }}>{(() => { const s = new Date(slot.start); const e = new Date(slot.end); const diff = Math.round((e.getTime() - s.getTime()) / 60000); return `${diff}m`; })()}</span>
                                        <span className={`mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors`} style={{ color: hex.text }}>{statusInfo.label}</span>
                                      </button>
                                    );
                                  })}
                                  </div>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Appointment Dialog */}
      {confirmOpen && (
        <Dialog open={confirmOpen} onOpenChange={(open) => !open && handleCancelBook()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold text-gray-900">Book Appointment</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {pendingSlot && (
                  <>
                    Book your appointment for <span className="font-semibold text-gray-900">{formatTime(pendingSlot.start)} - {formatTime(pendingSlot.end)}</span> on{' '}
                    <span className="font-semibold text-gray-900">{selectedDate}</span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={e => {
                e.preventDefault();
                let valid = true;
                if (!appointeeName.trim()) {
                  setAppointeeNameError(ValidationMessages.NAME_REQUIRED);
                  valid = false;
                } else {
                  setAppointeeNameError('');
                }
                if (!appointeeAge.trim()) {
                  setAppointeeAgeError(ValidationMessages.AGE_REQUIRED);
                  valid = false;
                } else {
                  const ageNum = Number(appointeeAge);
                  if (!Number.isInteger(ageNum) || ageNum <= 0) {
                    setAppointeeAgeError(ValidationMessages.AGE_POSITIVE_INTEGER);
                    valid = false;
                  } else {
                    setAppointeeAgeError('');
                  }
                }
                if (!appointeePhone.trim()) {
                  setAppointeePhoneError(ValidationMessages.PHONE_REQUIRED);
                  valid = false;
                } else {
                  const validation = validateAndFormatPhone(appointeePhone);
                  if (!validation.isValid) {
                    setAppointeePhoneError(validation.error || ValidationMessages.PHONE_INVALID);
                    valid = false;
                  } else {
                    setAppointeePhoneError('');
                  }
                }
                if (!appointeeGender.trim()) {
                  setAppointeeGenderError(ValidationMessages.GENDER_REQUIRED);
                  valid = false;
                } else if (!['Male', 'Female', 'Other'].includes(appointeeGender)) {
                  setAppointeeGenderError(ValidationMessages.GENDER_INVALID);
                  valid = false;
                } else {
                  setAppointeeGenderError('');
                }
                if (!valid) return;
                // Format phone number with +91 prefix
                const validation = validateAndFormatPhone(appointeePhone);
                handleConfirmBook({
                  appointeeName,
                  appointeeAge,
                  appointeePhone: validation.formattedPhone || appointeePhone,
                  appointeeGender,
                });
              }}
              className="space-y-6 py-4"
            >
              {/* Appointee Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Appointee Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointeeName" className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="appointeeName"
                      type="text"
                      placeholder="John Doe"
                      value={appointeeName}
                      onChange={e => {
                        setAppointeeName(e.target.value);
                        if (appointeeNameError) setAppointeeNameError('');
                      }}
                      className={`h-10 ${appointeeNameError ? 'border-red-500' : ''}`}
                    />
                    {appointeeNameError && (
                      <p className="text-xs text-red-500">{appointeeNameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointeeAge" className="text-sm font-medium text-gray-700">
                      Age <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="appointeeAge"
                      type="number"
                      placeholder="30"
                      value={appointeeAge}
                      onChange={e => {
                        setAppointeeAge(e.target.value);
                        if (appointeeAgeError) setAppointeeAgeError('');
                      }}
                      min={0}
                      className={`h-10 ${appointeeAgeError ? 'border-red-500' : ''}`}
                    />
                    {appointeeAgeError && (
                      <p className="text-xs text-red-500">{appointeeAgeError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <PhoneInput
                      id="appointeePhone"
                      label="Phone Number"
                      value={appointeePhone}
                      onChange={(value) => {
                        setAppointeePhone(value);
                        if (appointeePhoneError) setAppointeePhoneError('');
                      }}
                      error={appointeePhoneError}
                      placeholder="Enter 10 digit mobile number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointeeGender" className="text-sm font-medium text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="appointeeGender"
                      value={appointeeGender}
                      onChange={e => {
                        setAppointeeGender(e.target.value);
                        if (appointeeGenderError) setAppointeeGenderError('');
                      }}
                      className={`flex h-10 w-full rounded-md border ${appointeeGenderError ? 'border-red-500' : 'border-gray-300'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2`}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {appointeeGenderError && (
                      <p className="text-xs text-red-500">{appointeeGenderError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-6 mt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAppointeeNameError('');
                    setAppointeeAgeError('');
                    setAppointeePhoneError('');
                    setAppointeeGenderError('');
                    handleCancelBook();
                  }}
                  className="w-full h-11 text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Book Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PatientAvailableSlots;