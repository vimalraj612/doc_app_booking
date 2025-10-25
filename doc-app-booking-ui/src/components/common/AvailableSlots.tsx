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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md relative flex flex-col items-center border border-blue-100 overflow-hidden"
        style={{
          height: '92vh', // 💡 uses almost full screen on mobile
          maxHeight: '92vh',
          marginTop: '4vh',
        }}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>

        <h3 className="text-lg font-bold mb-3 text-gray-800">Available Slots</h3>

        {/* Scrollable Body */}
        <div
          className="overflow-y-auto flex-1 w-full pr-1 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loadingSlots && <div>Loading...</div>}
          {slotsError && <div className="text-red-500">{slotsError}</div>}

          {!loadingSlots && !slotsError && (
            <>
              {/* Dates */}
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3 justify-center">
                {allDates.length === 0 && (
                  <span className="text-gray-500 italic text-xs">
                    No slots available
                  </span>
                )}
                {allDates.map((date) => (
                  <button
                    key={date}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all whitespace-nowrap font-semibold
                      ${
                        selectedDate === date
                          ? 'bg-blue-100 border-blue-600 shadow-sm ring-2 ring-blue-500 ring-offset-2'
                          : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-300 font-medium'
                      }`}
                    onClick={() => setSelectedDate(date)}
                    style={
                      selectedDate === date ? { fontWeight: 700, color: '#2563eb' } : {}
                    }
                  >
                    <span
                      className={
                        selectedDate === date
                          ? 'text-blue-700 font-bold'
                          : 'text-gray-700 font-medium'
                      }
                    >
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
                        {slotsByDate[selectedDate]?.length === 0 ? (
                          <div className="text-gray-500 italic text-center py-2 text-xs">
                            No slots for this date
                          </div>
                        ) : (
                          <div
                            className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar"
                            style={{
                              maxHeight: '68vh',
                              minHeight: '80px',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: '3px',
                            }}
                          >
                            {slotsByDate[selectedDate].map((slot: any) => {
                              const isSelected = selectedSlot?.slotId === slot.slotId;
                              const unavailable = !slot.available;

                              return (
                                <button
                                  key={slot.slotId}
                                  disabled={unavailable || booking}
                                  onClick={() => handleBookSlot(slot)}
                                  className={`
                                    relative p-[1px] rounded-md border flex flex-col items-center justify-center
                                    min-w-[20px] min-h-[14px] max-w-[26px] max-h-[16px]
                                    transition-all duration-200 ease-in-out text-center
                                    backdrop-blur-sm bg-white/70 shadow-sm
                                    ${
                                      unavailable
                                        ? 'border-red-200 text-red-400 cursor-not-allowed opacity-60'
                                        : isSelected
                                        ? 'border-blue-400 text-blue-700 bg-blue-50/60 shadow-md scale-[1.05]'
                                        : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:shadow-md hover:scale-[1.02]'
                                    }
                                  `}
                                >
                                  <span
                                    className={`font-semibold text-[5.5px] leading-tight ${
                                      isSelected
                                        ? 'text-blue-700'
                                        : unavailable
                                        ? 'text-red-400'
                                        : 'text-green-700'
                                    }`}
                                  >
                                    {formatTime(slot.start)}
                                  </span>
                                  <span
                                    className={`text-[4px] leading-tight ${
                                      isSelected
                                        ? 'text-blue-600'
                                        : unavailable
                                        ? 'text-red-400'
                                        : 'text-green-600'
                                    }`}
                                  >
                                    {(() => {
                                      const start = new Date(slot.start);
                                      const end = new Date(slot.end);
                                      const diff = Math.round(
                                        (end.getTime() - start.getTime()) / 60000
                                      );
                                      return `${diff}m`;
                                    })()}
                                  </span>
                                  <span
                                    className={`mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors ${
                                      unavailable
                                        ? 'text-red-600 bg-red-100/60'
                                        : isSelected
                                        ? 'text-blue-700 bg-blue-100/60'
                                        : 'text-green-700 bg-green-100/60'
                                    }`}
                                  >
                                    {unavailable ? 'X' : '✓'}
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

              {/* Confirm Dialog */}
              <ConfirmDialog
                open={confirmOpen}
                title="Book Appointment"
                message={
                  pendingSlot
                    ? `Book appointment for ${formatTime(pendingSlot.start)} - ${formatTime(
                        pendingSlot.end
                      )}?`
                    : ''
                }
                confirmText="Book"
                cancelText="Cancel"
                onConfirm={handleConfirmBook}
                onCancel={handleCancelBook}
              />

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
