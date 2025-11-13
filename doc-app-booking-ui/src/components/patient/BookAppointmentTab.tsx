import { useState } from 'react';
import DoctorDetails from '../common/DoctorDetails';
import PatientAvailableSlots from './PatientAvailableSlots';
import { apiFetch } from '../../api/http';
import { fetchSlotsByDoctorIdAndDate } from '../../api/appointments';
import { AppointmentMessages } from '../../constants/messages';
import { useLocale } from '../../contexts/LocaleContext';
import { PatientProfile } from '../../api/user';

interface BookAppointmentTabProps {
  selectedDoctor: any;
  doctorLoading: boolean;
  doctorError: string;
  docPhoneNumber: string;
  profile: PatientProfile | null;
}

export function BookAppointmentTab({
  selectedDoctor,
  doctorLoading,
  doctorError,
  docPhoneNumber,
  profile,
}: BookAppointmentTabProps) {
  const { t } = useLocale();
  // Slots state
  const [showSlots, setShowSlots] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Booking state
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<any | null>(null);

  // Fetch slots for selected doctor
  const fetchSlots = async () => {
    if (!selectedDoctor?.id) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const dateStr = selectedDate || '';
      const result = await fetchSlotsByDoctorIdAndDate(selectedDoctor.id, dateStr);
      if (result && result.data && result.data.length > 0) {
        setSlots(result.data);
        setSlotsError(null);
      } else {
        setSlots([]);
        setSlotsError(t.ui.noSlotsForDate);
      }
    } catch (e: any) {
      setSlotsError(e?.message || t.messages.SLOT.LOADING_FAILED);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = (slot: any) => {
    if (!slot.available || booking) return;
    setPendingSlot(slot);
    setConfirmOpen(true);
  };

  const handleConfirmBook = async (appointeeData: {
    appointeeName: string;
    appointeeAge: string;
    appointeePhone: string;
    appointeeGender: string;
  }) => {
    if (!pendingSlot) return;
    setBooking(true);
    setSuccessMsg('');
    setConfirmOpen(false);
    try {
      let patientPhone = window.localStorage.getItem('phoneNumber') || '';
      // Ensure +91 prefix for patient phone
      if (patientPhone && !patientPhone.startsWith('+')) {
        patientPhone = '+91' + patientPhone;
      }
      const patientName = window.localStorage.getItem('patientName') || patientPhone || 'Patient';
      const doctorId = pendingSlot.doctorId || (selectedDoctor && selectedDoctor.id);
      const appointmentDateTime = pendingSlot.start;
      const slotId = pendingSlot.slotId;
      const payload = {
        doctorId,
        patientPhone,
        patientName,
        appointmentDateTime,
        slotId,
        ...appointeeData,
      };
      const token = window.localStorage.getItem('accessToken') || '';
      const rawResp = await apiFetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      let resp: any = rawResp;
      if (typeof window !== 'undefined' && rawResp instanceof Response) {
        resp = await rawResp.json();
      }
      if (resp && typeof resp === 'object' && 'success' in resp) {
        if (resp.success) {
          setSuccessMsg(AppointmentMessages.BOOKED_SUCCESS);
          setSlots((prev) =>
            prev.map((s) => (s.slotId === pendingSlot.slotId ? { ...s, available: false } : s))
          );
        } else {
          setSuccessMsg(resp.message || AppointmentMessages.BOOKING_FAILED);
        }
      } else {
        setSuccessMsg(AppointmentMessages.BOOKING_FAILED);
      }
    } catch (e) {
      setSuccessMsg(AppointmentMessages.BOOKING_FAILED);
    } finally {
      setBooking(false);
      setTimeout(() => setSuccessMsg(''), 2500);
      setPendingSlot(null);
    }
  };

  const handleCancelBook = () => {
    setConfirmOpen(false);
    setPendingSlot(null);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  };

  return (
    <>
      <DoctorDetails
        selectedDoctor={selectedDoctor}
        loading={doctorLoading}
        error={doctorError}
        onShowSlots={() => {
          setShowSlots(true);
          fetchSlots();
        }}
        docPhoneNumber={docPhoneNumber}
      />
      <PatientAvailableSlots
        open={showSlots}
        onClose={() => setShowSlots(false)}
        doctorId={selectedDoctor ? selectedDoctor.id : ''}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSlot={selectedSlot}
        booking={booking}
        handleBookSlot={handleBookSlot}
        successMsg={successMsg}
        confirmOpen={confirmOpen}
        pendingSlot={pendingSlot}
        handleConfirmBook={handleConfirmBook}
        handleCancelBook={handleCancelBook}
        formatTime={formatTime}
        profile={profile}
      />
    </>
  );
}
