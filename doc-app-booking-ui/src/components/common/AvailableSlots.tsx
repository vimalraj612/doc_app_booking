import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ConfirmDialog from '../ui/ConfirmDialog';

interface Slot {
  slotId: string | number;
  start: string;
  end: string;
  available: boolean;
}

interface AvailableSlotsProps {
  open: boolean;
  onClose: () => void;
  loadingSlots: boolean;
  slotsError: string;
  allDates: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  slotsByDate: { [date: string]: Slot[] };
  selectedSlot: Slot | null;
  booking: boolean;
  handleBookSlot: (slot: Slot) => void;
  confirmOpen: boolean;
  pendingSlot: Slot | null;
  handleConfirmBook: () => void;
  handleCancelBook: () => void;
  successMsg: string;
  formatTime: (time: string) => string;
}

const AvailableSlots: React.FC<AvailableSlotsProps> = ({
  open,
  onClose,
  loadingSlots,
  slotsError,
  allDates,
  selectedDate,
  setSelectedDate,
  slotsByDate,
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md relative flex flex-col items-center border border-blue-100" style={{ marginTop: '115px' }}>
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-3">Available Slots</h3>
        <div className="overflow-y-auto max-h-[60vh] pr-1 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loadingSlots && <div>Loading...</div>}
          {slotsError && <div className="text-red-500">{slotsError}</div>}
          {!loadingSlots && !slotsError && (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-2 justify-center">
                {allDates.length === 0 && (
                  <span className="text-gray-500 italic text-xs">No slots available</span>
                )}
                {allDates.map(date => (
                  <button
                    key={date}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all whitespace-nowrap font-semibold
                      ${selectedDate === date
                        ? 'bg-blue-100 border-blue-600 shadow-sm ring-2 ring-blue-500 ring-offset-2'
                        : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-300 font-medium'}`}
                    onClick={() => setSelectedDate(date)}
                    style={selectedDate === date ? { fontWeight: 700, color: '#2563eb' } : {}}
                  >
                    <span className={selectedDate === date ? 'text-blue-700 font-bold' : 'text-gray-700 font-medium'}>
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </button>
                ))}
              </div>
              {successMsg && (
                <div className="text-center text-green-700 text-xs font-semibold py-1">{successMsg}</div>
              )}
              <div className="flex justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md" style={{ display: 'flex', justifyContent: 'center' }}>
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
                        {slotsByDate[selectedDate]?.length === 0 ? (
                          <div className="text-gray-500 italic text-center py-2 text-xs">
                            No slots for this date
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 mx-auto overflow-y-auto no-scrollbar" style={{ maxHeight: '180px', minHeight: '60px', justifyContent: 'center', alignItems: 'center', padding: '2px' }}>
                            {slotsByDate[selectedDate].map((slot: any) => {
                              const isSelected = selectedSlot?.slotId === slot.slotId;
                              const unavailable = !slot.available;
                              return (
                                <button
                                  key={slot.slotId}
                                  disabled={unavailable || booking}
                                  onClick={() => handleBookSlot(slot)}
                                  className={`p-0.5 rounded-md border text-[2px] leading-tight transition-all flex flex-col items-center justify-center min-w-[22px] min-h-[14px] max-w-[28px] max-h-[16px] m-[0.5px]
                                    ${unavailable
                                      ? 'text-red-400 border-red-300 cursor-not-allowed opacity-70 bg-transparent'
                                      : isSelected
                                        ? 'text-blue-700 border-blue-600 bg-transparent'
                                        : 'text-green-700 border-green-200 bg-transparent hover:bg-gray-100'}`}
                                >
                                  <span className={`block font-semibold text-[7px] leading-tight ${isSelected ? 'text-blue-700' : unavailable ? 'text-red-400' : 'text-green-700'}`}>{formatTime(slot.start)}</span>
                                  <span className={`text-[5px] leading-tight ${isSelected ? 'text-blue-700' : unavailable ? 'text-red-400' : 'text-green-700'}`}>{(() => {
                                    const start = new Date(slot.start);
                                    const end = new Date(slot.end);
                                    const diff = Math.round((end.getTime() - start.getTime()) / 60000);
                                    return `${diff} min`;
                                  })()}</span>
                                  <span className={`mt-0.5 text-[4px] font-medium ${unavailable ? 'text-red-500' : isSelected ? 'text-blue-700' : 'text-green-600'}`}>{unavailable ? 'Unavailable' : 'Available'}</span>
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
              <ConfirmDialog
                open={confirmOpen}
                title="Book Appointment"
                message={pendingSlot ? `Book appointment for ${formatTime(pendingSlot.start)} - ${formatTime(pendingSlot.end)}?` : ''}
                confirmText="Book"
                cancelText="Cancel"
                onConfirm={handleConfirmBook}
                onCancel={handleCancelBook}
              />
              <style>{`
                .no-scrollbar {
                  scrollbar-width: none; /* Firefox */
                  -ms-overflow-style: none; /* IE/Edge */
                }
                .no-scrollbar::-webkit-scrollbar {
                  display: none; /* Chrome, Safari */
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
