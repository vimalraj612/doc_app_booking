import { useState } from 'react';
import { User, Appointment, TimeSlot, Doctor, MedicalRecord } from '../App';
import { Card, CardContent } from './ui/card';
import { Calendar as CalendarIcon, Clock, LogOut, Plus, User as UserIcon, Stethoscope, FileText, Check, UserCheck, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DoctorDashboardProps {
  user: User;
  doctor: Doctor;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  onLogout: () => void;
  onAddSlot: (slot: TimeSlot) => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  onAddPrescription: (appointmentId: string, prescription: string, notes: string) => void;
  onAddMedicalRecord: (record: MedicalRecord) => void;
}

export function DoctorDashboard({ 
  user, 
  doctor,
  appointments, 
  timeSlots, 
  onLogout, 
  onAddSlot,
  onUpdateAppointmentStatus,
  onAddPrescription,
  onAddMedicalRecord
}: DoctorDashboardProps) {
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [prescriptionAppointmentId, setPrescriptionAppointmentId] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !time) return;

    const newSlot: TimeSlot = {
      id: '',
      doctorId: user.id,
      date: selectedDate.toISOString().split('T')[0],
      time,
      isBooked: false,
    };

    onAddSlot(newSlot);
    setIsAddSlotOpen(false);
    setTime('');
  };

  const todayAppointments = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today && a.status === 'scheduled';
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-green-500" />
            <h1 className="text-lg sm:text-xl">Doctor Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={doctor.photo} alt={doctor.name} />
                <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name}</span>
            </div>
            <Avatar className="sm:hidden w-8 h-8">
              <AvatarImage src={doctor.photo} alt={doctor.name} />
              <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <CalendarIcon className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl">{todayAppointments.length}</p>
              <p className="text-xs text-gray-500">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Clock className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl">{timeSlots.filter(s => !s.isBooked).length}</p>
              <p className="text-xs text-gray-500">Free Slots</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <UserIcon className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-2xl">{appointments.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Slot Button */}
        <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
          <DialogTrigger asChild>
            <button className="w-full mb-6 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Time Slot
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Time Slot</DialogTitle>
              <DialogDescription>Create a new available time slot for appointments</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSlot} className="space-y-4 mt-4">
              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border mt-2"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Add Slot
              </button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="slots">My Slots</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-3 mt-4">
            {appointments.filter(a => a.status !== 'cancelled').length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No appointments
                </CardContent>
              </Card>
            ) : (
              appointments
                .filter(a => a.status !== 'cancelled')
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(appointment => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="truncate">{appointment.patientName}</h3>
                            {appointment.date === new Date().toISOString().split('T')[0] && (
                              <Badge>Today</Badge>
                            )}
                            <Badge variant={
                              appointment.status === 'completed' ? 'default' :
                              appointment.status === 'in-progress' ? 'secondary' :
                              appointment.status === 'checked-in' ? 'outline' : 'default'
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                          
                          {appointment.status === 'scheduled' && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              <button
                                onClick={() => onUpdateAppointmentStatus(appointment.id, 'checked-in')}
                                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                              >
                                <UserCheck className="w-4 h-4" />
                                Check In
                              </button>
                            </div>
                          )}
                          
                          {appointment.status === 'checked-in' && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              <button
                                onClick={() => onUpdateAppointmentStatus(appointment.id, 'in-progress')}
                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                              >
                                <Activity className="w-4 h-4" />
                                Start Consultation
                              </button>
                            </div>
                          )}
                          
                          {appointment.status === 'in-progress' && !appointment.prescription && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => {
                                    setPrescriptionAppointmentId(appointment.id);
                                    setPrescription('');
                                    setNotes('');
                                    setDiagnosis('');
                                  }}
                                  className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1 mt-3"
                                >
                                  <FileText className="w-4 h-4" />
                                  Add Prescription
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Prescription</DialogTitle>
                                  <DialogDescription>Complete the consultation for {appointment.patientName}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <Label htmlFor="diagnosis">Diagnosis</Label>
                                    <Input
                                      id="diagnosis"
                                      value={diagnosis}
                                      onChange={(e) => setDiagnosis(e.target.value)}
                                      placeholder="Enter diagnosis..."
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="prescription">Prescription</Label>
                                    <Textarea
                                      id="prescription"
                                      value={prescription}
                                      onChange={(e) => setPrescription(e.target.value)}
                                      placeholder="Enter medication details..."
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                      id="notes"
                                      value={notes}
                                      onChange={(e) => setNotes(e.target.value)}
                                      placeholder="Additional notes..."
                                      rows={2}
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (prescription && diagnosis) {
                                        onAddPrescription(appointment.id, prescription, notes);
                                        onAddMedicalRecord({
                                          id: '',
                                          patientId: appointment.patientId,
                                          patientName: appointment.patientName,
                                          doctorId: user.id,
                                          doctorName: user.name,
                                          date: new Date().toISOString().split('T')[0],
                                          diagnosis,
                                          prescription,
                                          notes
                                        });
                                        setPrescriptionAppointmentId('');
                                      }
                                    }}
                                    disabled={!prescription || !diagnosis}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Complete & Save
                                  </button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          {appointment.prescription && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-md">
                              <div className="flex items-center gap-2 mb-2">
                                <Check className="w-4 h-4 text-purple-600" />
                                <span className="text-sm">Consultation Completed</span>
                              </div>
                              <p className="text-sm text-gray-700">{appointment.prescription}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="slots" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeSlots.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center text-gray-500">
                    No time slots created
                  </CardContent>
                </Card>
              ) : (
                timeSlots
                  .sort((a, b) => {
                    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                    if (dateCompare !== 0) return dateCompare;
                    return a.time.localeCompare(b.time);
                  })
                  .map(slot => (
                    <Card key={slot.id} className={slot.isBooked ? 'bg-gray-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={slot.isBooked ? 'destructive' : 'default'}>
                                {slot.isBooked ? 'Booked' : 'Available'}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <span>{slot.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{slot.time}</span>
                              </div>
                              {slot.isBooked && slot.patientName && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <UserIcon className="w-4 h-4" />
                                  <span>{slot.patientName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
