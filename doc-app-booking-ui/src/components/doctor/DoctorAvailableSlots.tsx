import React, { useEffect, useState } from 'react';
import { fetchSlotsByDoctorIdAndDate } from '../../api/appointments';
import { fetchDoctorLeavesForDoctor } from '../../api/doctorLeaves';

type Slot = { slotId: string | number; start: string; end: string; available: boolean; status?: string; [k: string]: any };

interface Props {
  doctorId: string | number;
  booking: boolean;
  handleBookSlot: (slot: Slot) => void;
  successMsg?: string;
  formatTime: (time: string) => string;
  // optional props used by some callers (dashboard passes these)
  selectedSlot?: any | null;
  confirmOpen?: boolean;
  pendingSlot?: any | null;
  handleConfirmBook?: () => void;
  handleCancelBook?: () => void;
}

const DoctorAvailableSlot: React.FC<Props> = ({ doctorId, booking, handleBookSlot, successMsg = '', formatTime }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leaveDates, setLeaveDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const r = await fetchSlotsByDoctorIdAndDate(doctorId, todayStr);
        setSlots(r.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load slots');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [doctorId, todayStr]);

  useEffect(() => {
    if (!doctorId) return;
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetchDoctorLeavesForDoctor(doctorId as any);
        if (!mounted) return;
        setLeaveDates(new Set((r || []).map((x: any) => x.date)));
      } catch (_) {
        // ignore
      }
    };
    void load();
    return () => { mounted = false; };
  }, [doctorId]);

  const isOnLeaveToday = leaveDates.has(todayStr);

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold">Today's Slots ({todayStr})</h3>
      {loading && <div className="py-2">Loading...</div>}
      {error && <div className="text-red-500 py-2">{error}</div>}
      {!loading && !error && (
        <div className="mt-2">
          {isOnLeaveToday && <div className="mb-2 text-sm text-orange-700 bg-orange-50 border border-orange-100 rounded p-2">Doctor is on leave today — booking disabled.</div>}
          <div className="grid grid-cols-4 gap-2">
            {slots.length === 0 ? (
              <div className="text-gray-500 text-sm">No slots for today</div>
            ) : (
              slots.slice().sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map(slot => {
                const anySlot: any = slot as any;
                const statusValue = anySlot.hasOwnProperty('appointmentStatus') ? (anySlot.appointmentStatus ?? 'AVAILABLE') : (slot.available ? 'AVAILABLE' : (anySlot.status ?? 'SCHEDULED'));
                const isReserved = String(statusValue).toUpperCase() === 'RESERVED' || !!anySlot.reservedBy;
                const status = isReserved ? 'RESERVED' : String(statusValue).toUpperCase();
                const isClickable = status === 'AVAILABLE' && !booking && !isOnLeaveToday;
                return (
                  <button key={String(slot.slotId)} disabled={!isClickable} onClick={() => isClickable && handleBookSlot(slot)} className={`p-2 rounded border ${!isClickable ? 'opacity-60 cursor-not-allowed' : 'hover:shadow'}`}>
                    <div className="text-[10px] font-semibold">{formatTime(slot.start)}</div>
                    <div className="text-[10px]">{Math.round((new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60000)}m</div>
                    <div className="text-[10px]">{status}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAvailableSlot;
