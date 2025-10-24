import { useState, useEffect } from 'react';
import { fetchDoctorByPhone } from '../api/doctor';
import { fetchSlotsByDoctorId, fetchPatientAppointmentsByDateRange } from '../api/appointments';
import { cancelAppointmentApi } from '../api/appointments';
import { apiFetch } from '../api/http';
import ConfirmDialog from './ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { User as UserIcon, MapPin, Stethoscope, LogOut, CalendarPlus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const mockUser = {
  name: 'Jane Patient',
  profileImage: '',
};

export interface PatientDashboardProps {
  onLogout: () => void;
}

export function PatientDashboard({ onLogout }: PatientDashboardProps) {
  const [user] = useState(mockUser);
  function getPhoneNumberFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('docPhoneNumber') || '';
  }
  function getStoredPhoneNumber() {
    return window.localStorage.getItem('docPhoneNumber') || '';
  }
  function getDocPhoneNumber() {
    const fromQuery = getPhoneNumberFromQuery();
    if (fromQuery) {
      window.localStorage.setItem('docPhoneNumber', fromQuery);
      return fromQuery;
    }
    return getStoredPhoneNumber();
  }
  const docPhoneNumber = getDocPhoneNumber();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState('');
  const [showSlots, setShowSlots] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  // Status key/value mapping
  const statusOptions = [
    { key: 'ALL', label: 'All' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'COMPLETED', label: 'Completed' },
  ];
  const getStatusLabel = (key: string) => {
    const found = statusOptions.find(opt => opt.key === key);
    return found ? found.label : key;
  };
  // Date range filter state
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const next7 = new Date();
    next7.setDate(today.getDate() + 7);
    return {
      start: today.toISOString().slice(0, 10),
      end: next7.toISOString().slice(0, 10),
    };
  });
  // Cancel dialog state
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appt?: any }>({ open: false });
  // Success/error message for cancel
  const [cancelMsg, setCancelMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Filtered appointments by status
  const filteredAppointments = statusFilter === 'ALL'
    ? appointments
    : appointments.filter(appt => appt.status === statusFilter);
  // Fetch appointments for Appointments tab
  // Tab state
  const [activeTab, setActiveTab] = useState('details');

  // Fetch appointments when Appointments tab is selected
  const [appointmentsFetched, setAppointmentsFetched] = useState(false);
  const fetchAppointments = (customRange?: { start: string; end: string }) => {
    const patientId = window.localStorage.getItem('userId');
    if (!patientId) return;
    const start = customRange?.start || dateRange.start;
    const end = customRange?.end || dateRange.end;
    setAppointmentsLoading(true);
    setAppointmentsError('');
    fetchPatientAppointmentsByDateRange({
      patientId,
      start: new Date(start).toISOString(),
      end: new Date(new Date(end).setHours(23,59,59,999)).toISOString(),
    })
      .then(resp => setAppointments(resp.data || []))
      .catch(() => setAppointmentsError('Failed to fetch appointments.'))
      .finally(() => setAppointmentsLoading(false));
  };

  // Fetch appointments automatically when dateRange changes and Appointments tab is active
  useEffect(() => {
    if (activeTab === 'appointments' && appointmentsFetched) {
      fetchAppointments({ start: dateRange.start, end: dateRange.end });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  useEffect(() => {
    if (!docPhoneNumber) return;
    const fetchDoctor = async () => {
      setDoctorLoading(true);
      setDoctorError('');
      try {
        const doctor = await fetchDoctorByPhone(docPhoneNumber);
  setSelectedDoctor(doctor);
      } catch (e) {
        setDoctorError('Failed to fetch doctor details.');
      } finally {
        setDoctorLoading(false);
      }
    };
    fetchDoctor();
  }, [docPhoneNumber]);

  const fetchSlots = async () => {
    if (!selectedDoctor) return;
    setLoadingSlots(true);
    setSlotsError('');
    try {
      const slotsResp = await fetchSlotsByDoctorId(selectedDoctor.id);
      setSlots(slotsResp.data);
    } catch (e) {
      setSlotsError('Failed to fetch slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Patient slot booking state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<any>(null);

  // Group slots by date
  const slotsByDate: { [date: string]: any[] } = {};
  slots.forEach(slot => {
    const date = new Date(slot.start).toISOString().slice(0, 10);
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  });
  const allDates = Object.keys(slotsByDate).sort();

  // Default selected date
  useEffect(() => {
    if (allDates.length > 0 && !selectedDate) setSelectedDate(allDates[0]);
  }, [allDates, selectedDate]);

  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Book appointment handler
  const handleBookSlot = (slot: any) => {
    if (!slot.available || booking) return;
    setPendingSlot(slot);
    setConfirmOpen(true);
  };

  const handleConfirmBook = async () => {
    if (!pendingSlot) return;
    setBooking(true);
    setSuccessMsg('');
    setConfirmOpen(false);
    try {
      // Get patient info from localStorage/session (simulate for now)
  const patientPhone = window.localStorage.getItem('phoneNumber') || '';
      const patientName = window.localStorage.getItem('patientName') || 'Patient';
  const doctorId = pendingSlot.doctorId || (selectedDoctor && selectedDoctor.id);
      const appointmentDateTime = pendingSlot.start;
      const slotId = pendingSlot.slotId;
      const payload = {
        doctorId,
        patientPhone,
        patientName,
        appointmentDateTime,
        slotId,
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
          setSuccessMsg('Appointment booked successfully!');
          setSlots(prev => prev.map(s => s.slotId === pendingSlot.slotId ? { ...s, available: false } : s));
        } else {
          setSuccessMsg(resp.message || 'Booking failed.');
        }
      } else {
        setSuccessMsg('Booking failed.');
      }
    } catch (e) {
      setSuccessMsg('Booking failed.');
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

  return (
    <div>
      <div className="space-y-4">
        {/* Header and Tabs */}
        <div className="flex items-center justify-between py-2 px-4 bg-white shadow-sm rounded-lg mb-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg text-blue-700">Patient Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-base whitespace-nowrap">{user.name}</span>
            <LogOut
              className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
              onClick={onLogout}
            />
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={tab => {
          setActiveTab(tab);
          if (tab === 'appointments' && !appointmentsFetched) {
            fetchAppointments({
              start: dateRange.start,
              end: dateRange.end,
            });
            setAppointmentsFetched(true);
          }
        }}>
          <TabsList className="w-full flex">
            <TabsTrigger value="details" className="flex-1">Doctor Details</TabsTrigger>
            <TabsTrigger value="appointments" className="flex-1">Appointments</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              {doctorLoading ? (
                <div>Loading doctor details...</div>
              ) : doctorError ? (
                <div className="text-red-500">{doctorError}</div>
              ) : selectedDoctor ? (
                <Card>
                  <CardContent className="p-6 relative">
                    <button
                      className="absolute top-4 right-4 bg-white rounded-full shadow p-2 hover:bg-green-50 transition"
                      title="Show available slots"
                      onClick={() => { setShowSlots(true); fetchSlots(); }}
                    >
                      <CalendarPlus className="w-7 h-7 text-green-600" />
                    </button>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <Avatar className="w-32 h-32 flex-shrink-0 mx-auto sm:mx-0">
                        <AvatarImage src={selectedDoctor.profileImage ? `data:${selectedDoctor.imageContentType};base64,${selectedDoctor.profileImage}` : undefined} alt={selectedDoctor.name} />
                        <AvatarFallback className="text-2xl">
                          {(selectedDoctor.firstName?.[0] || '') + (selectedDoctor.lastName?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl">{selectedDoctor.name || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`}</h2>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <span>{selectedDoctor.specialization}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>{selectedDoctor.hospitalName}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-semibold">Experience:</span>
                            <span>{selectedDoctor.experienceYears} years</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-semibold">Qualifications:</span>
                            <span>{selectedDoctor.qualifications}</span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm mb-1">Contact</p>
                            <p className="text-sm text-gray-600">Email: {selectedDoctor.email}</p>
                            <p className="text-sm text-gray-600">Phone: +{docPhoneNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">No doctor details found.</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="appointments" className="mt-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl border shadow p-6">
                {/* Cancel Success/Error Message (simple text above date range) */}
                {activeTab === 'appointments' && cancelMsg && (
                  <div className={`mb-2 text-center text-sm font-semibold ${
                    cancelMsg.type === 'success' ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {cancelMsg.text}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  {/* Date Range Filter */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium">Date Range:</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={dateRange.start}
                      max={dateRange.end}
                      onChange={e => {
                        const newStart = e.target.value;
                        setDateRange(r => ({ ...r, start: newStart }));
                      }}
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-sm"
                      value={dateRange.end}
                      min={dateRange.start}
                      onChange={e => {
                        const newEnd = e.target.value;
                        setDateRange(r => ({ ...r, end: newEnd }));
                      }}
                    />
                    <button
                      className="ml-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-60"
                      onClick={() => fetchAppointments(dateRange)}
                      disabled={appointmentsLoading}
                      title="Search"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </button>
                  </div>
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="statusFilter" className="text-sm font-medium">Status:</label>
                    <select
                      id="statusFilter"
                      className="border rounded px-2 py-1 text-sm"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {appointmentsLoading && <div className="py-8 text-center text-gray-500">Loading appointments...</div>}
                {appointmentsError && <div className="py-8 text-center text-red-500">{appointmentsError}</div>}
                {!appointmentsLoading && !appointmentsError && filteredAppointments.length === 0 && (
                  <div className="py-8 text-center text-gray-500 italic">
                    No appointments found for <span className="font-semibold">{dateRange.start}</span> to <span className="font-semibold">{dateRange.end}</span>.
                  </div>
                )}
                {!appointmentsLoading && !appointmentsError && filteredAppointments.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {filteredAppointments.map(appt => (
                      <div key={appt.id} className="bg-white rounded-xl border shadow p-4 flex flex-col gap-2 hover:shadow-md transition">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-blue-700 text-sm">{appt.doctorName}</span>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold 
                              ${appt.status === 'SCHEDULED' ? 'text-blue-700' :
                                appt.status === 'CANCELLED' ? 'text-red-600' :
                                appt.status === 'COMPLETED' ? 'text-green-700' :
                                'text-gray-600'}
                            `}>
                              <span className={`inline-block w-2 h-2 rounded-full 
                                ${appt.status === 'SCHEDULED' ? 'bg-blue-500' :
                                  appt.status === 'CANCELLED' ? 'bg-red-500' :
                                  appt.status === 'COMPLETED' ? 'bg-green-500' :
                                  'bg-gray-400'}
                              `}></span>
                              {getStatusLabel(appt.status)}
                            </span>
                            {appt.status === 'SCHEDULED' && (
                              <button
                                className="ml-1 p-1 rounded-full hover:bg-red-100 text-red-600 transition"
                                title="Cancel Appointment"
                                onClick={() => setCancelDialog({ open: true, appt })}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="red" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
        {/* Cancel Appointment Confirm Dialog */}
        <ConfirmDialog
          open={cancelDialog.open}
          title="Cancel Appointment"
          message={cancelDialog.appt ? `Are you sure you want to cancel your appointment with ${cancelDialog.appt.doctorName} on ${new Date(cancelDialog.appt.appointmentDateTime).toLocaleString()}?` : ''}
          confirmText="Yes, Cancel"
          cancelText="No"
          onConfirm={async () => {
            if (!cancelDialog.appt) return;
            try {
              await cancelAppointmentApi(cancelDialog.appt.id);
              setCancelMsg({ type: 'success', text: 'Appointment cancelled successfully.' });
              setCancelDialog({ open: false });
              // Refresh appointments
              fetchAppointments({ start: dateRange.start, end: dateRange.end });
            } catch (e: any) {
              setCancelMsg({ type: 'error', text: e?.message || 'Failed to cancel appointment.' });
              setCancelDialog({ open: false });
            }
            setTimeout(() => setCancelMsg(null), 2500);
          }}
          onCancel={() => setCancelDialog({ open: false })}
        />
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Date:</span> {new Date(appt.appointmentDateTime).toLocaleString()}
                        </div>
         
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* Book Appointment Modal/Section */}
        {showSlots && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setShowSlots(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-3">Available Slots</h3>
              <div
                className="overflow-y-auto max-h-[60vh] pr-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {loadingSlots && <div>Loading...</div>}
                {slotsError && <div className="text-red-500">{slotsError}</div>}
                {!loadingSlots && !slotsError && (
                  <>
                    {/* Date Picker */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-2">
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
                    {/* Success message */}
                    {successMsg && (
                      <div className="text-center text-green-700 text-xs font-semibold py-1">{successMsg}</div>
                    )}
                    {/* Time Slots */}
                    <div className="flex justify-center">
                      <div
                        className="relative w-full max-w-xs sm:max-w-sm md:max-w-md"
                        style={{ display: 'flex', justifyContent: 'center' }}
                      >
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
                                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 mx-auto overflow-y-auto no-scrollbar"
                                  style={{
                                    maxHeight: '180px',
                                    minHeight: '60px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '2px',
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
                                        className={`p-1.5 rounded-md border text-[9px] leading-tight transition-all flex flex-col items-center justify-center min-w-[48px] min-h-[32px] max-w-[56px] max-h-[38px] m-[2px]
                                          ${unavailable
                                            ? 'bg-red-100 text-red-400 border-red-300 cursor-not-allowed opacity-70'
                                            : isSelected
                                              ? 'bg-blue-100 border-blue-600'
                                              : 'bg-green-50 hover:bg-blue-50 border-green-200'}`}
                                      >
                                        <span className={`block font-semibold text-[9px] leading-tight ${isSelected ? 'text-blue-700' : unavailable ? 'text-red-400' : 'text-green-700'}`}>
                                          {formatTime(slot.start)}
                                        </span>
                                        <span className={`text-[7px] leading-tight ${isSelected ? 'text-blue-700' : unavailable ? 'text-red-400' : 'text-green-700'}`}>
                                          {formatTime(slot.end)}
                                        </span>
                                        <span className={`mt-0.5 text-[6px] font-medium ${unavailable ? 'text-red-500' : isSelected ? 'text-blue-700' : 'text-green-600'}`}>
                                          {unavailable ? 'Unavailable' : 'Available'}
                                        </span>
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
                    {/* Confirmation Dialog */}
                    <ConfirmDialog
                      open={confirmOpen}
                      title="Book Appointment"
                      message={pendingSlot ? `Book appointment for ${formatTime(pendingSlot.start)} - ${formatTime(pendingSlot.end)}?` : ''}
                      confirmText="Book"
                      cancelText="Cancel"
                      onConfirm={handleConfirmBook}
                      onCancel={handleCancelBook}
                    />
                    {/* Hidden Scrollbar CSS */}
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
        )}
      </div>
    </div>
  );
}


















