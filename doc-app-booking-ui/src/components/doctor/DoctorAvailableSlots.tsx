import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchSlotsByDoctorIdAndDate } from '../../api/appointments';
import { Button } from '../ui/button';
import { Trash2, LayoutTemplate } from 'lucide-react';

interface Slot {
  slotId: string | number;
  start: string;
  end: string;
  available: boolean;
  status?: 'AVAILABLE' | 'SCHEDULED';
}

interface DoctorAvailableSlotProps {
  doctorId: string | number;
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

const DoctorAvailableSlot: React.FC<DoctorAvailableSlotProps> = ({
  doctorId,
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [appointeeName, setAppointeeName] = useState('');
  const [appointeeAge, setAppointeeAge] = useState('');
  const [appointeePhone, setAppointeePhone] = useState('');
  const [appointeeGender, setAppointeeGender] = useState('');
  const [appointeeNameError, setAppointeeNameError] = useState('');
  const [appointeeAgeError, setAppointeeAgeError] = useState('');
  const [appointeePhoneError, setAppointeePhoneError] = useState('');
  const [appointeeGenderError, setAppointeeGenderError] = useState('');

  useEffect(() => {
    if (successMsg && successMsg.toLowerCase().includes('booked')) {
      const timeout = setTimeout(() => {
        fetchSlotsByDoctorIdAndDate(doctorId, todayStr).then(res => setSlots(res.data));
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [successMsg, doctorId, todayStr]);

  useEffect(() => {
    const loadSlots = async () => {
      setLoadingSlots(true);
      setSlotsError('');
      try {
        const userId = window.localStorage.getItem('userId') || doctorId;
        const res = await fetchSlotsByDoctorIdAndDate(userId, todayStr);
        setSlots(res.data);
      } catch (err: any) {
        setSlotsError(err.message || 'Failed to load slots');
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [doctorId, todayStr]);

  const slotsByDate = { [todayStr]: slots };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl mx-auto flex flex-col items-center border border-blue-100 overflow-y-auto no-scrollbar">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Today's Slots ({todayStr})</h3>
      <div className="overflow-y-auto flex-1 w-full pr-1 pb-2 no-scrollbar">
        {loadingSlots && <div>Loading...</div>}
        {slotsError && <div className="text-red-500">{slotsError}</div>}
        {!loadingSlots && !slotsError && (
          <>
            {successMsg && (
              <div className="text-center text-green-700 text-xs font-semibold py-1">
                {successMsg}
              </div>
            )}
            {/* Slots Grid */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={todayStr}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    {(!slotsByDate[todayStr] || slotsByDate[todayStr].length === 0) ? (
                      <div className="text-gray-500 italic text-center py-2 text-xs">
                        No slots for today
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar"
                        style={{ maxHeight: '62vh', minHeight: '80px', justifyContent: 'center', alignItems: 'center', padding: '3px' }}
                      >
                        {slotsByDate[todayStr]
                          .slice()
                          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                          .map((slot) => {
                            let status: 'AVAILABLE' | 'SCHEDULED' = slot.available ? 'AVAILABLE' : 'SCHEDULED';
                            const statusMap = {
                              AVAILABLE: { color: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Available' },
                              SCHEDULED: { color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Scheduled' },
                            };
                            const isSelected = typeof selectedSlot !== 'undefined' && selectedSlot !== null && selectedSlot.slotId === slot.slotId;
                            const statusInfo = statusMap[status];
                            return (
                              <div key={slot.slotId} className="relative flex flex-col items-center group">
                                <button
                                  disabled={status !== 'AVAILABLE' || booking}
                                  onClick={() => handleBookSlot(slot)}
                                  className={[
                                    'relative', 'p-[1px]', 'rounded-md', 'border', 'flex', 'flex-col', 'items-center', 'justify-center',
                                    'min-w-[20px]', 'min-h-[14px]', 'max-w-[26px]', 'max-h-[16px]',
                                    'transition-all', 'duration-200', 'ease-in-out', 'text-center',
                                    'backdrop-blur-sm', 'shadow-sm',
                                    statusInfo.color,
                                    isSelected ? 'ring-2 ring-blue-300/60 scale-[1.05]' : '',
                                    status !== 'AVAILABLE' ? 'cursor-not-allowed opacity-60' : 'hover:bg-green-100 hover:shadow-md hover:scale-[1.02]'
                                  ].join(' ')}
                                >
                                  <LayoutTemplate className="w-3 h-3 mb-0.5 text-blue-400" />
                                  <span className={[
                                    'font-semibold', 'text-[5.5px]', 'leading-tight',
                                    isSelected ? 'text-blue-700' : statusInfo.text
                                  ].join(' ')}>
                                    {formatTime(slot.start)}
                                  </span>
                                  <span className={[
                                    'text-[4px]', 'leading-tight',
                                    isSelected ? 'text-blue-600' : statusInfo.text
                                  ].join(' ')}>
                                    {(() => {
                                      const start = new Date(slot.start);
                                      const end = new Date(slot.end);
                                      const diff = Math.round((end.getTime() - start.getTime()) / 60000);
                                      return `${diff}m`;
                                    })()}
                                  </span>
                                  <span className={[
                                    'mt-[0.5px]', 'text-[3.5px]', 'font-medium', 'rounded-full', 'px-[1px]', 'py-[0.5px]', 'transition-colors',
                                    statusInfo.text,
                                    isSelected ? 'bg-blue-100/60' : ''
                                  ].join(' ')}>
                                    {statusInfo.label}
                                  </span>
                                  {isSelected && (
                                    <span className="absolute inset-0 rounded-md ring-2 ring-blue-300/60 animate-pulse pointer-events-none" />
                                  )}
                                </button>
                                {/* Delete icon for slot (visible on hover or always, as needed) */}
                                <button
                                  className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow hover:bg-red-100"
                                  title="Delete Slot"
                                  // onClick={() => handleDeleteSlot(slot)} // Implement this handler as needed
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </motion.div>
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
                      } else if (!/^\+\d{7,}$/.test(appointeePhone)) {
                        setAppointeePhoneError('Phone must start with + and be a valid number (at least 7 digits).');
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
          </>
        )}
      </div>
    </div>
	);
};

export default DoctorAvailableSlot;
