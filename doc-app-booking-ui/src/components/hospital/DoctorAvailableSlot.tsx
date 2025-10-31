import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import ConfirmDialog from '../ui/ConfirmDialog';
import { fetchSlotsByDoctorIdAndDate, reserveAppointment } from '../../api/appointments';

interface Slot {
    slotId: string | number;
    start: string;
    end: string;
    available: boolean;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctorId: string | number | null;
    hospitalName?: string | null;
}

const DoctorAvailableSlot: React.FC<Props> = ({ open, onOpenChange, doctorId, hospitalName }) => {
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // booking state (simple reserve only flow)
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Determine simple-test mode from multiple sources to make it easy to enable during testing:
    // 1. Vite env var: VITE_SIMPLE_TEST=true
    // 2. localStorage key: SIMPLE_TEST=true
    // 3. query param: ?simple_test=1
    // This helps when someone runs the dev server without modifying env files.
    const isSimpleTest = (() => {
        try {
            if (import.meta.env.VITE_SIMPLE_TEST === 'true') return true;
        } catch (_) { }
        try {
            if (typeof window !== 'undefined') {
                if (window.localStorage.getItem('SIMPLE_TEST') === 'true') return true;
                const qp = new URLSearchParams(window.location.search).get('simple_test');
                if (qp === '1' || qp === 'true') return true;
            }
        } catch (_) { }
        return false;
    })();

    useEffect(() => {
        if (!open) return;
        if (!doctorId) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchSlotsByDoctorIdAndDate(doctorId, date);
                setSlots(res.data || []);
            } catch (e: any) {
                setError(e?.message || 'Failed to load slots');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [open, doctorId, date]);

    const formatTime = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return iso;
        }
    };

    const handleSlotClick = (slot: Slot) => {
        if (!slot.available) return;
        setSelectedSlot(slot);
        setConfirmOpen(true);
    };

    const confirmBook = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        setError(null);
        try {
            // Use hospitalName or localStorage fallback as reserver identity
            const storedPhone = window.localStorage.getItem('hospitalPhoneNumber') || window.localStorage.getItem('docPhoneNumber') || '';
            const reserverName = hospitalName || window.localStorage.getItem('name') || 'Reserved';
            await reserveAppointment({
                doctorId: doctorId as any,
                appointmentDateTime: selectedSlot.start,
                slotId: selectedSlot.slotId,
                reserved: true,
            });
            // Show success message only in simple test mode
            if (isSimpleTest) {
                setSuccess('Slot reserved successfully');
                window.setTimeout(() => setSuccess(null), 3000);
            }
            // keep the confirmation panel open inside the dialog so user sees the reserved state
            // we do not clear selectedSlot here so the panel can show details; user can close when ready
            // refresh
            const res = await fetchSlotsByDoctorIdAndDate(doctorId as any, date);
            setSlots(res.data || []);
        } catch (e: any) {
            setError(e?.message || 'Failed to reserve slot');
        } finally {
            setBooking(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Available Slots</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert>
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2 items-center justify-center mb-3">
                        <input
                            id="slot-date-picker"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="border rounded px-2 py-1 text-xs w-32 sm:w-40 md:w-48 lg:w-56"
                            min={new Date().toISOString().slice(0, 10)}
                        />
                    </div>

                    <div className="flex justify-center">
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center">
                            <AnimatePresence mode="wait">
                                {date && (
                                    <motion.div
                                        key={date}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.18 }}
                                        className="w-full"
                                    >
                                        {(!slots || slots.length === 0) ? (
                                            <div className="text-gray-500 italic text-center py-2 text-sm">No slots for this date</div>
                                        ) : (
                                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar" style={{ maxHeight: '62vh' }}>
                                                {slots
                                                    .slice()
                                                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                                                    .map((slot) => {
                                                        // Detect reserved/status using backend keys.
                                                        // Prefer `appointmentStatus` when present; if appointmentStatus is null -> treat as AVAILABLE.
                                                        const anySlot: any = slot as any;
                                                        const appointmentStatus = anySlot.hasOwnProperty('appointmentStatus') ? anySlot.appointmentStatus : undefined;

                                                        // Determine a status value we can map from:
                                                        // - If appointmentStatus is defined (not undefined), use it. If it's null, treat as AVAILABLE per requirement.
                                                        // - Otherwise fall back to slot.available or anySlot.status
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

                                                        // Map known appointmentStatus values explicitly.
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
                                                                // Treat cancelled slots as available (re-bookable)
                                                                status = 'AVAILABLE';
                                                                break;
                                                            default:
                                                                // Fallback to available flag or scheduled
                                                                status = slot.available ? 'AVAILABLE' : 'SCHEDULED';
                                                        }

                                                        // If any reserved indicator is present, override to RESERVED
                                                        if (isReserved) status = 'RESERVED';

                                                        const statusMap: any = {
                                                            AVAILABLE: { color: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'Available' },
                                                            SCHEDULED: { color: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Scheduled' },
                                                            RESERVED: { color: 'bg-orange-50 border-orange-200', text: 'text-orange-700', label: 'Reserved' },
                                                            COMPLETED: { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Completed' },
                                                            CANCELLED: { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Cancelled' },
                                                        };
                                                        const statusInfo = statusMap[status] || statusMap['SCHEDULED'];
                                                        const isClickable = status === 'AVAILABLE' && !booking;

                                                        // Provide explicit hex color fallbacks in case Tailwind utility classes
                                                        // are not applied (for example, due to purge/JIT). Inline styles
                                                        // ensure the background/border/text colors are visible.
                                                        const colorHexMap: Record<string, { bg: string; border: string; text: string }> = {
                                                            AVAILABLE: { bg: '#ecfdf5', border: '#bbf7d0', text: '#166534' }, // green-50/200/700-ish
                                                            SCHEDULED: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }, // blue-50/200/700-ish
                                                            RESERVED: { bg: '#fff7ed', border: '#fed7aa', text: '#b45309' }, // orange-50/200/700-ish
                                                            COMPLETED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                                                            CANCELLED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                                                        };
                                                        const hex = colorHexMap[status] || colorHexMap['SCHEDULED'];
                                                        return (
                                                            <button
                                                                key={String(slot.slotId)}
                                                                disabled={!isClickable}
                                                                onClick={() => handleSlotClick(slot)}
                                                                className={`relative p-[1px] rounded-md border flex flex-col items-center justify-center min-w-[20px] min-h-[14px] max-w-[26px] max-h-[16px] transition-all duration-200 ease-in-out text-center backdrop-blur-sm shadow-sm ${!isClickable ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}`}
                                                                style={{
                                                                    backgroundColor: hex.bg,
                                                                    borderColor: hex.border,
                                                                    color: hex.text,
                                                                    borderStyle: 'solid',
                                                                }}
                                                            >
                                                                <span className="font-semibold text-[5.5px] leading-tight" style={{ color: hex.text }}>{formatTime(slot.start)}</span>
                                                                <span className="text-[4px] leading-tight" style={{ color: hex.text }}>{(() => { const s = new Date(slot.start); const e = new Date(slot.end); const diff = Math.round((e.getTime() - s.getTime()) / 60000); return `${diff}m`; })()}</span>
                                                                <span className="mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors" style={{ color: hex.text }}>{statusInfo.label}</span>
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

                    {/* Reserve confirmation handled by a popup ConfirmDialog */}
                    <ConfirmDialog
                        open={confirmOpen}
                        title="Reserve slot"
                        message={selectedSlot ? `Reserve slot at ${formatTime(selectedSlot.start)}? This will mark the slot reserved.` : 'Reserve selected slot?'}
                        confirmText={booking ? 'Reserving...' : 'Reserve'}
                        cancelText="Cancel"
                        onConfirm={async () => {
                            await confirmBook();
                        }}
                        onCancel={() => {
                            setConfirmOpen(false);
                            setSelectedSlot(null);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DoctorAvailableSlot;
