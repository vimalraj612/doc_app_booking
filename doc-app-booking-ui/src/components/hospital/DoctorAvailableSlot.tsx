import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import ConfirmDialog from '../ui/ConfirmDialog';
import { fetchSlotsByDoctorIdAndDate, reserveAppointment } from '../../api/appointments';
import { fetchDoctorLeavesForDoctor } from '../../api/doctorLeaves';
import { InlineMessage } from '../ui/inline-message';
import { useLocale } from '../../contexts/LocaleContext';

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
    const { t } = useLocale();
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [leaveDates, setLeaveDates] = useState<Set<string>>(new Set());

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
            if ((import.meta as any).env?.VITE_SIMPLE_TEST === 'true') return true;
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
                setError(e?.message || t.messages.SLOT.LOADING_FAILED);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [open, doctorId, date]);

    // Load doctor leaves (dates) for the doctor when dialog opens or doctorId changes
    useEffect(() => {
        if (!open) return;
        if (!doctorId) return;
        let mounted = true;
        const loadLeaves = async () => {
            try {
                const res = await fetchDoctorLeavesForDoctor(doctorId as any);
                if (!mounted) return;
                const dates = new Set<string>((res || []).map((d: any) => d.date));
                setLeaveDates(dates);
            } catch (err) {
                // ignore leave fetch errors - we don't want to block the slots UI
            }
        };
        void loadLeaves();
        return () => { mounted = false; };
    }, [open, doctorId]);

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
            // Show success message
            setSuccess(t.messages.SLOT.RESERVED_SUCCESS);
            window.setTimeout(() => setSuccess(null), 3000);
            // keep the confirmation panel open inside the dialog so user sees the reserved state
            // we do not clear selectedSlot here so the panel can show details; user can close when ready
            // refresh
            const res = await fetchSlotsByDoctorIdAndDate(doctorId as any, date);
            setSlots(res.data || []);
        } catch (e: any) {
            const errorMsg = e?.message || t.messages.SLOT.RESERVE_FAILED;
            setError(errorMsg);
        } finally {
            setBooking(false);
        }
    };

    // Render slots content separately to avoid large nested ternary in JSX which
    // previously caused a parser error in the build step.
    const renderSlotsContent = () => {
        if (!slots || slots.length === 0) {
            return <div className="text-gray-500 italic text-center py-2 text-sm">{t.messages.SLOT.NO_SLOTS}</div>;
        }

        if (leaveDates.has(date)) {
            return (
                <div className="text-center py-2">
                    <div className="text-orange-700 bg-orange-50 border border-orange-100 rounded p-2 text-sm">{t.messages.LABELS.DOCTOR_ON_LEAVE}</div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar mt-2" style={{ maxHeight: '62vh' }}>
                        {slots
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

                                const colorHexMap: Record<string, { bg: string; border: string; text: string }> = {
                                    AVAILABLE: { bg: '#ecfdf5', border: '#bbf7d0', text: '#166534' },
                                    SCHEDULED: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
                                    RESERVED: { bg: '#fff7ed', border: '#fed7aa', text: '#b45309' },
                                    COMPLETED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                                    CANCELLED: { bg: '#f8fafc', border: '#e6eef8', text: '#374151' },
                                };
                                const hex = colorHexMap[status] || colorHexMap['SCHEDULED'];
                                const isClickable = false; // on leave days none should be clickable

                                return (
                                    <button
                                        key={String(slot.slotId)}
                                        disabled={!isClickable}
                                        onClick={() => { }}
                                        className={`relative p-[1px] rounded-md border flex flex-col items-center justify-center min-w-[20px] min-h-[14px] max-w-[26px] max-h-[16px] transition-all duration-200 ease-in-out text-center backdrop-blur-sm shadow-sm ${!isClickable ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}`}
                                        style={{ backgroundColor: hex.bg, borderColor: hex.border, color: hex.text, borderStyle: 'solid' }}
                                    >
                                        <span className="font-semibold text-[5.5px] leading-tight" style={{ color: hex.text }}>{formatTime(slot.start)}</span>
                                        <span className="text-[4px] leading-tight" style={{ color: hex.text }}>{(() => { const s = new Date(slot.start); const e = new Date(slot.end); const diff = Math.round((e.getTime() - s.getTime()) / 60000); return `${diff}m`; })()}</span>
                                        <span className="mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors" style={{ color: hex.text }}>{statusInfo.label}</span>
                                    </button>
                                );
                            })}
                    </div>
                </div>
            );
        }

        // Default: regular slots grid with clickable slots when available
        return (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-[3px] mx-auto overflow-y-auto no-scrollbar" style={{ maxHeight: '62vh' }}>
                {slots
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
                        const isClickable = status === 'AVAILABLE' && !booking && !leaveDates.has(date);

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
                                onClick={() => handleSlotClick(slot)}
                                className={`relative p-[1px] rounded-md border flex flex-col items-center justify-center min-w-[20px] min-h-[14px] max-w-[26px] max-h-[16px] transition-all duration-200 ease-in-out text-center backdrop-blur-sm shadow-sm ${!isClickable ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md'}`}
                                style={{ backgroundColor: hex.bg, borderColor: hex.border, color: hex.text, borderStyle: 'solid' }}
                            >
                                <span className="font-semibold text-[5.5px] leading-tight" style={{ color: hex.text }}>{formatTime(slot.start)}</span>
                                <span className="text-[4px] leading-tight" style={{ color: hex.text }}>{(() => { const s = new Date(slot.start); const e = new Date(slot.end); const diff = Math.round((e.getTime() - s.getTime()) / 60000); return `${diff}m`; })()}</span>
                                <span className="mt-[0.5px] text-[3.5px] font-medium rounded-full px-[1px] py-[0.5px] transition-colors" style={{ color: hex.text }}>{statusInfo.label}</span>
                            </button>
                        );
                    })}
            </div>
        );
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
                        <InlineMessage type="error" message={error} />
                    )}
                    {success && (
                        <InlineMessage type="success" message={success} />
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
                                        {renderSlotsContent()}
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
