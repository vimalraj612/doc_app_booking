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
          </>
        )}
      </div>
    </div>
	);
};

export default DoctorAvailableSlot;
