import { useState } from 'react';
import { useRef } from 'react';
import { User, Doctor, Appointment, Hospital } from '../App';
import { Card, CardContent } from './ui/card';
import { LogOut, Plus, User as UserIcon, Stethoscope, Calendar, Building2, LayoutTemplate, CalendarDays, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

import { useEffect } from 'react';
import { fetchDoctorsByHospitalId, addDoctor, fetchSlotTemplatesByDoctorId, createOrUpdateSlotTemplate, deleteSlotTemplate, SlotTemplateDTO } from '../api/doctor';
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

  const extractErrorMessage = (err: any) => {
    // err may be an Error whose message is a JSON string or plain text
    try {
      if (!err) return 'Unknown error';
      const m = err?.message || err;
      if (!m) return 'Unknown error';
      // try parse JSON
      try {
        const parsed = JSON.parse(m);
        if (parsed && parsed.message) return String(parsed.message);
      } catch (_) {
        // not JSON
      }
      // if it's already an object
      if (typeof m === 'object' && m.message) return String(m.message);
      return String(m);
    } catch (_e) {
      return 'Unknown error';
    }
  };

  // Form state for creating/updating a slot template
  const [templateForm, setTemplateForm] = useState<{
    id?: number | null;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    active: boolean;
  }>({
    id: null,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 15,
    active: true,
  });

  const resetTemplateForm = () => setTemplateForm({ id: null, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 15, active: true });

  const [templateErrors, setTemplateErrors] = useState<{ [k: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateTemplateForm = () => {
    const errs: { [k: string]: string } = {};
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    if (!templateForm.startTime) errs.startTime = 'Start time is required';
    if (!templateForm.endTime) errs.endTime = 'End time is required';
    if (templateForm.startTime && templateForm.endTime) {
      const s = toMinutes(templateForm.startTime);
      const e = toMinutes(templateForm.endTime);
      if (e <= s) errs.endTime = 'End time must be after start time';
      if (e - s < templateForm.slotDurationMinutes) errs.endTime = 'Slot duration must fit within start/end range';
    }
    if (!templateForm.slotDurationMinutes || templateForm.slotDurationMinutes < 5) errs.slotDurationMinutes = 'Duration must be at least 5 minutes';
    setTemplateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveSlotTemplate = async (doctorId?: string) => {
    const docId = doctorId || slotTemplatesDoctor;
    if (!docId) {
      setSlotTemplatesError('No doctor selected for slot template');
      return;
    }
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    // validate first
    if (!validateTemplateForm()) {
      setSlotTemplatesLoading(false);
      return;
    }
    try {
      const payload: Partial<SlotTemplateDTO> = {
        id: templateForm.id ?? undefined as any,
        doctorId: Number(docId),
        dayOfWeek: templateForm.dayOfWeek,
        startTime: templateForm.startTime,
        endTime: templateForm.endTime,
        slotDurationMinutes: Number(templateForm.slotDurationMinutes),
      };
      await createOrUpdateSlotTemplate(docId, payload);
      // refresh list
      const data = await fetchSlotTemplatesByDoctorId(docId);
      setSlotTemplates(data);
  resetTemplateForm();
  setTemplateErrors({});
  setSuccessMessage('Slot template saved');
  window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to save slot template', e);
      setSlotTemplatesError(extractErrorMessage(e) || 'Failed to save slot template');
    } finally {
      setSlotTemplatesLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId?: number) => {
    if (!templateId) return;
    if (!window.confirm('Delete this slot template?')) return;
    if (!slotTemplatesDoctor) {
      setSlotTemplatesError('No doctor selected for slot template');
      return;
    }
    setSlotTemplatesLoading(true);
    setSlotTemplatesError('');
    try {
      await deleteSlotTemplate(templateId);
      const data = await fetchSlotTemplatesByDoctorId(slotTemplatesDoctor);
      setSlotTemplates(data);
      setSuccessMessage('Slot template deleted');
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to delete slot template', e);
      setSlotTemplatesError(extractErrorMessage(e) || 'Failed to delete slot template');
    } finally {
      setSlotTemplatesLoading(false);
    }
  };

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
      setSlotTemplatesError(extractErrorMessage(e) || 'Failed to load slot templates');
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
            {/* Slot Templates Modal/Section (Dialog for consistent UX) */}
            <Dialog open={slotTemplates !== null || slotTemplatesLoading || !!slotTemplatesError} onOpenChange={(open) => { if (!open) { setSlotTemplates(null); setSlotTemplatesError(''); resetTemplateForm(); } }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Slot Templates</DialogTitle>
                  <DialogDescription>Manage recurring slot templates for the selected doctor.</DialogDescription>
                </DialogHeader>

                {slotTemplatesLoading && (
                  <div className="p-6 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">Loading slot templates...</span>
                  </div>
                )}

                {slotTemplatesError && (
                  <div className="p-4">
                    <div className="text-red-600 font-semibold mb-2">{slotTemplatesError}</div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setSlotTemplatesError('')}>Close</Button>
                    </div>
                  </div>
                )}

                {slotTemplates !== null && !slotTemplatesLoading && (
                  <div className="space-y-4 p-2">
                    {/* Add / Edit form */}
                    <div className="mb-1 border rounded p-3 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <Label>Day of Week</Label>
                          <select className="form-input w-full border rounded px-2 py-1" value={templateForm.dayOfWeek} onChange={e => setTemplateForm(f => ({ ...f, dayOfWeek: e.target.value }))}>
                            <option>MONDAY</option>
                            <option>TUESDAY</option>
                            <option>WEDNESDAY</option>
                            <option>THURSDAY</option>
                            <option>FRIDAY</option>
                            <option>SATURDAY</option>
                            <option>SUNDAY</option>
                          </select>
                        </div>
                        <div>
                          <Label>Start Time</Label>
                          <Input type="time" value={templateForm.startTime} onChange={e => setTemplateForm(f => ({ ...f, startTime: e.target.value }))} />
                          {templateErrors.startTime && <div className="text-red-500 text-xs mt-1">{templateErrors.startTime}</div>}
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input type="time" value={templateForm.endTime} onChange={e => setTemplateForm(f => ({ ...f, endTime: e.target.value }))} />
                          {templateErrors.endTime && <div className="text-red-500 text-xs mt-1">{templateErrors.endTime}</div>}
                        </div>
                        <div>
                          <Label>Duration (min)</Label>
                          <Input type="number" min={5} value={templateForm.slotDurationMinutes} onChange={e => setTemplateForm(f => ({ ...f, slotDurationMinutes: Number(e.target.value || 0) }))} />
                          {templateErrors.slotDurationMinutes && <div className="text-red-500 text-xs mt-1">{templateErrors.slotDurationMinutes}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <input id="tpl-active" type="checkbox" checked={templateForm.active} onChange={e => setTemplateForm(f => ({ ...f, active: e.target.checked }))} />
                          <label htmlFor="tpl-active" className="text-sm">Active</label>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => resetTemplateForm()}>Reset</Button>
                          <Button onClick={() => saveSlotTemplate()}>{templateForm.id ? 'Update' : 'Create'}</Button>
                        </div>
                      </div>
                    </div>

                    {slotTemplates.length === 0 ? (
                      <div className="text-gray-500 italic">No slot templates found.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="bg-blue-50">
                              <th className="p-2 border">Day</th>
                              <th className="p-2 border">Start</th>
                              <th className="p-2 border">End</th>
                              <th className="p-2 border">Duration (min)</th>
                              <th className="p-2 border">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {slotTemplates.map(tpl => (
                              <tr key={tpl.id} className="border-b">
                                <td className="p-2 border">{tpl.dayOfWeek}</td>
                                <td className="p-2 border">{tpl.startTime}</td>
                                <td className="p-2 border">{tpl.endTime}</td>
                                <td className="p-2 border text-center">{tpl.slotDurationMinutes}</td>
                                <td className="p-2 border text-center">
                                  <div className="flex items-center gap-2 justify-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="p-2"
                                      title="Edit template"
                                      aria-label={`Edit template ${tpl.id}`}
                                      onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="p-2"
                                      title="Delete template"
                                      aria-label={`Delete template ${tpl.id}`}
                                      onClick={() => handleDeleteTemplate(tpl.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
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
