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
                              AVAILABLE: { label: 'Available' },
                              SCHEDULED: { label: 'Scheduled' },
                              RESERVED: { label: 'Reserved' },
                              COMPLETED: { label: 'Completed' },
                              CANCELLED: { label: 'Cancelled' },
                            };

                            const colorHexMap: Record<string, { bg: string; border: string; text: string }> = {
                              AVAILABLE: { bg: '#ecfdf5', border: '#bbf7d0', text: '#166534' },
                              SCHEDULED: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
                              RESERVED: { bg: '#fff7ed', border: '#fed7aa', text: '#b45309' },
                              COMPLETED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                              CANCELLED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                            };
                            const hex = colorHexMap[status] || colorHexMap['SCHEDULED'];

                            const isClickable = status === 'AVAILABLE' && !booking;

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
                                <span className={`mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors`} style={{ color: hex.text }}>{statusMap[status].label}</span>
                              </button>
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
