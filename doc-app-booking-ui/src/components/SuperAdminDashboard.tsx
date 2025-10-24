import { useState } from 'react';
import { User, Doctor, Appointment, Hospital, TimeSlot, TimeSlotTemplate } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LogOut, Plus, Stethoscope, Calendar, Trash2, Building2, Shield, Users, Clock, CalendarClock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

interface SuperAdminDashboardProps {
  user: User;
  hospitals: Hospital[];
  doctors: Doctor[];
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  timeSlotTemplates: TimeSlotTemplate[];
  onLogout: () => void;
  onAddHospital: (hospital: Hospital) => void;
  onDeleteHospital: (hospitalId: string) => void;
  onDeleteDoctor: (doctorId: string) => void;
  onAddTimeSlotTemplate: (template: TimeSlotTemplate) => void;
  onGenerateSlotsFromTemplate: (templateId: string, startDate: string, endDate: string) => void;
}

export function SuperAdminDashboard({ 
  user, 
  hospitals,
  doctors, 
  appointments,
  timeSlots,
  timeSlotTemplates, 
  onLogout, 
  onAddHospital,
  onDeleteHospital,
  onDeleteDoctor,
  onAddTimeSlotTemplate,
  onGenerateSlotsFromTemplate
}: SuperAdminDashboardProps) {
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
  
  const [isGenerateSlotsOpen, setIsGenerateSlotsOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [generateStartDate, setGenerateStartDate] = useState('');
  const [generateEndDate, setGenerateEndDate] = useState('');
  
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleAddHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName || !address || !email) return;

    const newHospital: Hospital = {
      id: '',
      name: hospitalName,
      address,
      email,
      photo: 'https://images.unsplash.com/photo-1719934398679-d764c1410770?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGJ1aWxkaW5nJTIwbW9kZXJufGVufDF8fHx8MTc2MTAyNzE1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    };

    onAddHospital(newHospital);
    setIsAddHospitalOpen(false);
    setHospitalName('');
    setAddress('');
    setEmail('');
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !selectedDoctorId || selectedDays.length === 0) return;

    const newTemplate: TimeSlotTemplate = {
      id: '',
      doctorId: selectedDoctorId,
      name: templateName,
      daysOfWeek: selectedDays,
      startTime,
      endTime,
      slotDuration: parseInt(slotDuration)
    };

    onAddTimeSlotTemplate(newTemplate);
    setIsAddTemplateOpen(false);
    setTemplateName('');
    setSelectedDoctorId('');
    setStartTime('09:00');
    setEndTime('17:00');
    setSlotDuration('30');
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const handleGenerateSlots = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !generateStartDate || !generateEndDate) return;

    onGenerateSlotsFromTemplate(selectedTemplateId, generateStartDate, generateEndDate);
    setIsGenerateSlotsOpen(false);
    setSelectedTemplateId('');
    setGenerateStartDate('');
    setGenerateEndDate('');
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <h1 className="text-lg sm:text-xl">Super Admin Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{user.name}</span>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Building2 className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-2xl">{hospitals.length}</p>
              <p className="text-xs text-gray-500">Hospitals</p>
            </CardContent>
          </Card>
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
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-2xl">{appointments.length}</p>
              <p className="text-xs text-gray-500">Total Appts</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Hospital Button */}
        <Dialog open={isAddHospitalOpen} onOpenChange={setIsAddHospitalOpen}>
          <DialogTrigger asChild>
            <button className="w-full mb-6 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Hospital
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Hospital</DialogTitle>
              <DialogDescription>Register a new hospital in the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddHospital} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="City Medical Center"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@hospital.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Add Hospital
              </button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Time Slot Management */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
            <DialogTrigger asChild>
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <CalendarClock className="w-5 h-5" />
                Create Time Slot Template
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Time Slot Template</DialogTitle>
                <DialogDescription>Define a reusable schedule template for a doctor</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTemplate} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Weekday Schedule"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="doctorSelect">Select Doctor</Label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Days of Week</Label>
                  <div className="space-y-2">
                    {daysOfWeek.map(day => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={selectedDays.includes(day.value)}
                          onCheckedChange={() => toggleDay(day.value)}
                        />
                        <label
                          htmlFor={`day-${day.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                  <Select value={slotDuration} onValueChange={setSlotDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Create Template
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isGenerateSlotsOpen} onOpenChange={setIsGenerateSlotsOpen}>
            <DialogTrigger asChild>
              <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Generate Time Slots
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Time Slots</DialogTitle>
                <DialogDescription>Generate slots from a template for a date range</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerateSlots} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="templateSelect">Select Template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlotTemplates.map(template => {
                        const doctor = doctors.find(d => d.id === template.doctorId);
                        return (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {doctor?.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={generateStartDate}
                    onChange={(e) => setGenerateStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={generateEndDate}
                    onChange={(e) => setGenerateEndDate(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Generate Slots
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="hospitals" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="hospitals" className="space-y-3 mt-4">
            {hospitals.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No hospitals registered yet
                </CardContent>
              </Card>
            ) : (
              hospitals.map(hospital => {
                const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
                const hospitalAppointments = appointments.filter(a => a.hospitalId === hospital.id);
                
                return (
                  <Card key={hospital.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarImage src={hospital.photo} alt={hospital.name} />
                            <AvatarFallback><Building2 className="w-6 h-6" /></AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="truncate">{hospital.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>
                            <p className="text-sm text-gray-500 mt-1 truncate">{hospital.email}</p>
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {hospitalDoctors.length} Doctors
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {hospitalAppointments.length} Appointments
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteHospital(hospital.id)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="doctors" className="space-y-3 mt-4">
            {doctors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No doctors registered yet
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
                          <h3 className="truncate">{doctor.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-gray-500" />
                            <p className="text-sm text-gray-500 truncate">{doctor.hospitalName}</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 truncate">{doctor.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteDoctor(doctor.id)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
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
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-gray-500" />
                            <p className="text-sm text-gray-500 truncate">{appointment.hospitalName}</p>
                          </div>
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

          <TabsContent value="templates" className="space-y-3 mt-4">
            {timeSlotTemplates.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No time slot templates created yet
                </CardContent>
              </Card>
            ) : (
              timeSlotTemplates.map(template => {
                const doctor = doctors.find(d => d.id === template.doctorId);
                const dayNames = template.daysOfWeek
                  .map(d => daysOfWeek.find(day => day.value === d)?.label.substring(0, 3))
                  .join(', ');
                
                return (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                          <CalendarClock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {doctor?.name} - {doctor?.specialization}
                          </p>
                          <div className="mt-3 space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {dayNames}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{template.startTime} - {template.endTime}</span>
                              </div>
                              <span>•</span>
                              <span>{template.slotDuration} min slots</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Badge variant="secondary" className="text-xs">
                              {timeSlots.filter(s => s.doctorId === template.doctorId).length} slots generated
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
