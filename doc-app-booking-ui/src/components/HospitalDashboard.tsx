import { useState } from 'react';
import { useRef } from 'react';
import { User, Doctor, Appointment, Hospital } from '../App';
import { Card, CardContent } from './ui/card';
import { LogOut, Plus, User as UserIcon, Stethoscope, Calendar, Building2, LayoutTemplate, CalendarDays, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

import { useEffect } from 'react';
import { fetchDoctorsByHospitalId, addDoctor, fetchSlotTemplatesByDoctorId, SlotTemplateDTO } from '../api/doctor';

interface HospitalDashboardProps {
  user: User;
  appointments: Appointment[];
  hospitals: Hospital[];
  onLogout: () => void;
  onDeleteDoctor: (doctorId: string) => void;
}

// Inline AddDoctorForm component definition
interface AddDoctorFormProps {
  onSuccess: () => void;
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => Promise<void>;
  hospital?: Hospital;
  user: User;
}


function AddDoctorForm({ onSuccess, onAddDoctor, hospital, user }: AddDoctorFormProps) {
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !specialization || !email) return;
    setSubmitting(true);
    await onAddDoctor({
      name: doctorName,
      specialization,
      hospitalId: user.id,
      hospitalName: hospital?.name || user.name,
      email,
      photo: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjEwMzMzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    });
    setDoctorName('');
    setSpecialization('');
    setEmail('');
    setSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="doctorName">Name</Label>
        <Input
          id="doctorName"
          value={doctorName}
          onChange={e => setDoctorName(e.target.value)}
          placeholder="Doctor's name"
          required
        />
      </div>
      <div>
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          value={specialization}
          onChange={e => setSpecialization(e.target.value)}
          placeholder="Specialization"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
        disabled={submitting}
      >
        {submitting ? 'Adding...' : 'Add Doctor'}
      </button>
    </form>
  );
}

export function HospitalDashboard({ 
  user, 
  appointments, 
  hospitals,
  onLogout, 
  onDeleteDoctor 
}: HospitalDashboardProps) {
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const hospital = hospitals.find(h => h.id === user.id);
  // Slot template modal state (ensure Slot Templates button works)
  const [slotTemplates, setSlotTemplates] = useState<SlotTemplateDTO[] | null>(null);
  const [slotTemplatesDoctor, setSlotTemplatesDoctor] = useState<string | null>(null);
  const [slotTemplatesLoading, setSlotTemplatesLoading] = useState(false);
  const [slotTemplatesError, setSlotTemplatesError] = useState('');
  const [lastClickedDoctor, setLastClickedDoctor] = useState<string | null>(null);
  const lastRequestAtRef = useRef<number | null>(null);

  const fetchDoctors = async () => {
    if (!user?.id) return;
    try {
      const backendDoctors = await fetchDoctorsByHospitalId(user.id);
      setDoctors(backendDoctors.map(d => ({
        id: d.id?.toString?.() ?? '',
        name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
        specialization: d.specialization || '',
        hospitalId: d.hospitalId?.toString?.() ?? '',
        hospitalName: d.hospitalName || '',
        email: d.email || '',
        photo: d.profileImage || d.imageContentType ? `data:${d.imageContentType};base64,${d.profileImage}` : '',
        qualifications: d.qualifications || '',
        phoneNumber: d.phoneNumber || '',
      })));
    } catch (e) {
      setDoctors([]);
    }
  };

  const handleSlotTemplateClick = async (doctorId: string) => {
    setLastClickedDoctor(doctorId);
    console.log('HospitalDashboard (top-level): fetching slot templates for doctor', doctorId);
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    setSlotTemplatesDoctor(doctorId);
    try {
      const data = await fetchSlotTemplatesByDoctorId(doctorId);
      console.log('HospitalDashboard (top-level): fetched slot templates', data);
      setSlotTemplates(data);
    } catch (e: any) {
      console.error('HospitalDashboard (top-level): failed to fetch slot templates', e);
      setSlotTemplatesError(e?.message || 'Failed to load slot templates');
      setSlotTemplates(null);
    } finally {
      setSlotTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Add doctor handler for the form
  const handleAddDoctor = async (doctor: Omit<Doctor, 'id'>) => {
    await addDoctor({
      ...doctor,
      hospitalId: Number(doctor.hospitalId),
    });
    await fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-500" />
            <h1 className="text-lg sm:text-xl">Hospital Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={hospital?.photo} alt={hospital?.name} />
                <AvatarFallback><Building2 className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.name}</span>
            </div>
            <Avatar className="sm:hidden w-8 h-8">
              <AvatarImage src={hospital?.photo} alt={hospital?.name} />
              <AvatarFallback><Building2 className="w-4 h-4" /></AvatarFallback>
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
              <Stethoscope className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl">{doctors.length}</p>
              <p className="text-xs text-gray-500">Doctors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl">{appointments.filter(a => a.status === 'scheduled').length}</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <UserIcon className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-2xl">{appointments.length}</p>
              <p className="text-xs text-gray-500">Total Appts</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Doctor Button inside Doctors Tab */}
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-3 mt-4">
            <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
              <DialogTrigger asChild>
                <button className="mb-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Doctor
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                  <DialogDescription>Add a new doctor to your hospital</DialogDescription>
                </DialogHeader>
                <AddDoctorForm 
                  onSuccess={() => setIsAddDoctorOpen(false)} 
                  onAddDoctor={handleAddDoctor}
                  hospital={hospital}
                  user={user}
                />
              </DialogContent>
            </Dialog>
            {doctors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No doctors added yet
                </CardContent>
              </Card>
            ) : (
              doctors.map(doctor => (
                <Card key={doctor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={doctor.photo} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate font-semibold text-base">{doctor.name}</h3>
                          <div className="flex flex-col gap-1 mt-1 text-sm">
                            <span className="text-gray-600"><span className="font-medium">Specialization:</span> {doctor.specialization}</span>
                            {doctor.qualifications && (
                              <span className="text-gray-600"><span className="font-medium">Qualifications:</span> {doctor.qualifications}</span>
                            )}
                            <span className="text-gray-600"><span className="font-medium">Email:</span> {doctor.email}</span>
                            {doctor.phoneNumber && (
                              <span className="text-gray-600"><span className="font-medium">Phone:</span> {doctor.phoneNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center justify-center"
                          title="Slot Templates"
                          onPointerDown={() => setLastClickedDoctor(doctor.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSlotTemplateClick(doctor.id);
                          }}
                        >
                          <span className="sm:hidden"><LayoutTemplate className="w-5 h-5" /></span>
                          <span className="hidden sm:inline">Slot Templates</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center justify-center" title="Slots">
                          <span className="sm:hidden"><CalendarDays className="w-5 h-5" /></span>
                          <span className="hidden sm:inline">Slots</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDeleteDoctor(doctor.id)} className="flex items-center justify-center" title="Delete">
                          <span className="sm:hidden"><Trash2 className="w-5 h-5" /></span>
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {/* Slot Templates Modal/Section */}
            {slotTemplatesLoading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] min-h-[120px] flex flex-col items-center">
                  <span className="text-blue-600 font-semibold">Loading slot templates...</span>
                </div>
              </div>
            )}
            {slotTemplates !== null && !slotTemplatesLoading && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] max-w-lg max-h-[80vh] overflow-y-auto relative">
                  <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setSlotTemplates(null)}>&times;</button>
                  <h2 className="text-lg font-bold mb-3 text-blue-700">Slot Templates</h2>
                  {slotTemplates.length === 0 ? (
                    <div className="text-gray-500 italic">No slot templates found.</div>
                  ) : (
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="p-2 border">Day</th>
                          <th className="p-2 border">Start</th>
                          <th className="p-2 border">End</th>
                          <th className="p-2 border">Duration (min)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slotTemplates.map(tpl => (
                          <tr key={tpl.id} className="border-b">
                            <td className="p-2 border">{tpl.dayOfWeek}</td>
                            <td className="p-2 border">{tpl.startTime}</td>
                            <td className="p-2 border">{tpl.endTime}</td>
                            <td className="p-2 border text-center">{tpl.slotDurationMinutes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            {slotTemplatesError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] min-h-[120px] flex flex-col items-center">
                  <span className="text-red-600 font-semibold">{slotTemplatesError}</span>
                  <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSlotTemplatesError('')}>Close</button>
                </div>
              </div>
            )}
          </TabsContent>


          <TabsContent value="appointments" className="space-y-3 mt-4">
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No appointments yet
                </CardContent>
              </Card>
            ) : (
              appointments
                .sort((a, b) => {
                  if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
                  if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                })
                .map(appointment => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="truncate">{appointment.patientName}</h3>
                            <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            with {appointment.doctorName}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
