import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';
import { fetchSlotsByDoctorIdAndDate } from '../../api/appointments';
import { Button } from '../ui/button';

interface Slot {
  slotId: string | number;
  start: string;
  end: string;
  available: boolean;
  status?: 'AVAILABLE' | 'SCHEDULED';
}

interface AvailableSlotsProps {
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

const AvailableSlots: React.FC<AvailableSlotsProps> = ({
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
        setSlotsError(err.message || 'Failed to load slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, doctorId]);

  if (!open) return null;

  const slotsByDate = { [selectedDate]: slots };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30">
      <div
        className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md relative flex flex-col items-center border border-blue-100 overflow-y-auto no-scrollbar"
        style={{ marginTop: '115px', maxHeight: '500px', minHeight: '380px' }}
      >
        {/* Close & Title */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            className="text-gray-500 hover:text-gray-800 p-1 text-xl"
            onClick={onClose}
            title="Close"
          >
            &times;
          </button>
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Available Slots</h3>
        <div className="overflow-y-auto flex-1 w-full pr-1 pb-2 no-scrollbar">
          {loadingSlots && <div>Loading...</div>}
          {slotsError && <div className="text-red-500">{slotsError}</div>}

          {!loadingSlots && !slotsError && (
            <>
              {/* Date Picker */}
              <div className="flex gap-2 items-center justify-center mb-3">
                <input
                  id="slot-date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border rounded px-2 py-1 text-xs w-32 sm:w-40 md:w-48 lg:w-56 focus:ring-2 focus:ring-blue-200 transition-all"
                  min={new Date().toISOString().slice(0, 10)}
                  style={{ fontSize: '13px', maxWidth: '100%' }}
                />
              </div>

              {successMsg && (
                <div className="text-center text-green-700 text-xs font-semibold py-1">
                  {successMsg}
                </div>
              )}

              {/* Slots Grid */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center">
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
                          <div className="text-gray-500 italic text-center py-2 text-xs">
                            No slots for this date
                          </div>
                        ) : (
                          <div
                            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar"
                            style={{ maxHeight: '62vh', minHeight: '80px', justifyContent: 'center', alignItems: 'center', padding: '3px' }}
                          >
                            {slotsByDate[selectedDate].map((slot) => {
                              let status: 'AVAILABLE' | 'SCHEDULED' = slot.available ? 'AVAILABLE' : 'SCHEDULED';

                              const statusMap = {
                                AVAILABLE: { color: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Available' },
                                SCHEDULED: { color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Scheduled' },
                              };

                              const isSelected = selectedSlot?.slotId === slot.slotId;
                              const statusInfo = statusMap[status];

                              return (
                                <button
                                  key={slot.slotId}
                                  disabled={status !== 'AVAILABLE' || booking}
                                  onClick={() => handleBookSlot(slot)}
                                  className={`
                                    relative p-[1px] rounded-md border flex flex-col items-center justify-center
                                    min-w-[20px] min-h-[14px] max-w-[26px] max-h-[16px]
                                    transition-all duration-200 ease-in-out text-center
                                    backdrop-blur-sm shadow-sm
                                    ${statusInfo.color}
                                    ${isSelected ? 'ring-2 ring-blue-300/60 scale-[1.05]' : ''}
                                    ${status !== 'AVAILABLE' ? 'cursor-not-allowed opacity-60' : 'hover:bg-green-100 hover:shadow-md hover:scale-[1.02]'}
                                  `}
                                >
                                  <span className={`font-semibold text-[5.5px] leading-tight ${isSelected ? 'text-blue-700' : statusInfo.text}`}>
                                    {formatTime(slot.start)}
                                  </span>
                                  <span className={`text-[4px] leading-tight ${isSelected ? 'text-blue-600' : statusInfo.text}`}>
                                    {(() => {
                                      const start = new Date(slot.start);
                                      const end = new Date(slot.end);
                                      const diff = Math.round((end.getTime() - start.getTime()) / 60000);
                                      return `${diff}m`;
                                    })()}
                                  </span>
                                  <span className={`mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors ${statusInfo.text} ${isSelected ? 'bg-blue-100/60' : ''}`}>
                                    {statusInfo.label}
                                  </span>
                                  {isSelected && (
                                    <span className="absolute inset-0 rounded-md ring-2 ring-blue-300/60 animate-pulse pointer-events-none" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md relative flex flex-col items-center border border-blue-100 overflow-y-auto no-scrollbar" style={{ marginTop: '115px', maxHeight: '500px', minHeight: '380px' }}>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        className="text-gray-500 hover:text-gray-800 p-1 text-xl"
                        onClick={() => {
                          setAppointeeNameError('');
                          setAppointeeAgeError('');
                          setAppointeePhoneError('');
                          setAppointeeGenderError('');
                          handleCancelBook();
                        }}
                        title="Close"
                      >
                        &times;
                      </button>
                    </div>
                    <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
                    <form
                      className="w-full"
                      onSubmit={e => {
                        e.preventDefault();
                        let valid = true;
                        if (!appointeeName.trim()) {
                          setAppointeeNameError('Name is required.');
                          valid = false;
                        } else {
                          setAppointeeNameError('');
                        }
                        if (!appointeeAge.trim()) {
                          setAppointeeAgeError('Age is required.');
                          valid = false;
                        } else {
                          const ageNum = Number(appointeeAge);
                          if (!Number.isInteger(ageNum) || ageNum <= 0) {
                            setAppointeeAgeError('Age must be a positive integer.');
                            valid = false;
                          } else {
                            setAppointeeAgeError('');
                          }
                        }
                        if (!appointeePhone.trim()) {
                          setAppointeePhoneError('Phone is required.');
                          valid = false;
                        } else if (!/^\d{7,}$/.test(appointeePhone)) {
                          setAppointeePhoneError('Phone must be a valid number (at least 7 digits).');
                          valid = false;
                        } else {
                          setAppointeePhoneError('');
                        }
                        if (!appointeeGender.trim()) {
                          setAppointeeGenderError('Gender is required.');
                          valid = false;
                        } else if (!['Male', 'Female', 'Other'].includes(appointeeGender)) {
                          setAppointeeGenderError('Please select a valid gender.');
                          valid = false;
                        } else {
                          setAppointeeGenderError('');
                        }
                        if (!valid) return;
                        handleConfirmBook({
                          appointeeName,
                          appointeeAge,
                          appointeePhone,
                          appointeeGender,
                        });
                      }}
                    >
                      <div className="mb-2 text-center text-sm text-gray-700">
                        {pendingSlot ? `Book appointment for ${formatTime(pendingSlot.start)} - ${formatTime(pendingSlot.end)}?` : ''}
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium">Appointee Name</label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1"
                          placeholder="Example: John Doe"
                          value={appointeeName}
                          onChange={e => {
                            setAppointeeName(e.target.value);
                            if (appointeeNameError) setAppointeeNameError('');
                          }}
                          // required removed to prevent browser popup
                        />
                        <div className="text-red-500 text-xs mt-1 min-h-[18px]">{appointeeNameError || '\u00A0'}</div>
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium">Appointee Age</label>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1"
                          placeholder="Example: 30"
                          value={appointeeAge}
                          onChange={e => {
                            setAppointeeAge(e.target.value);
                            if (appointeeAgeError) setAppointeeAgeError('');
                          }}
                          min={0}
                          // required removed to prevent browser popup
                        />
                        <div className="text-red-500 text-xs mt-1 min-h-[18px]">{appointeeAgeError || '\u00A0'}</div>
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium">Appointee Phone</label>
                        <input
                          type="tel"
                          className="w-full border rounded px-2 py-1"
                          placeholder="Example: +9876543210"
                          value={appointeePhone}
                          onChange={e => {
                            setAppointeePhone(e.target.value);
                            if (appointeePhoneError) setAppointeePhoneError('');
                          }}
                          // required removed to prevent browser popup
                        />
                        <div className="text-red-500 text-xs mt-1 min-h-[18px]">{appointeePhoneError || '\u00A0'}</div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium">Appointee Gender</label>
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={appointeeGender}
                          onChange={e => {
                            setAppointeeGender(e.target.value);
                            if (appointeeGenderError) setAppointeeGenderError('');
                          }}
                          // required removed to prevent browser popup
                        >
                          <option value="">Example: Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="text-red-500 text-xs mt-1 min-h-[18px]">{appointeeGenderError || '\u00A0'}</div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                       <Button type="button" variant="secondary"
                          onClick={() => {
                            setAppointeeNameError('');
                            setAppointeeAgeError('');
                            setAppointeePhoneError('');
                            setAppointeeGenderError('');
                            handleCancelBook();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="secondary"
                        >
                          Book
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <style>{`
                .no-scrollbar {
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableSlots;
