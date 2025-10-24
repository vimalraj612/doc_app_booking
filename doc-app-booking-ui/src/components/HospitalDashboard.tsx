import { useState } from 'react';
import { User, Doctor, Appointment, Hospital } from '../App';
import { Card, CardContent } from './ui/card';
import { LogOut, Plus, User as UserIcon, Stethoscope, Calendar, Trash2, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HospitalDashboardProps {
  user: User;
  doctors: Doctor[];
  appointments: Appointment[];
  hospitals: Hospital[];
  onLogout: () => void;
  onAddDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctorId: string) => void;
}

export function HospitalDashboard({ 
  user, 
  doctors, 
  appointments, 
  hospitals,
  onLogout, 
  onAddDoctor,
  onDeleteDoctor 
}: HospitalDashboardProps) {
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');

  const hospital = hospitals.find(h => h.id === user.id);

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !specialization || !email) return;

    const newDoctor: Doctor = {
      id: '',
      name: doctorName,
      specialization,
      hospitalId: user.id,
      hospitalName: hospital?.name || user.name,
      email,
      photo: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjEwMzMzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    };

    onAddDoctor(newDoctor);
    setIsAddDoctorOpen(false);
    setDoctorName('');
    setSpecialization('');
    setEmail('');
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

        {/* Add Doctor Button */}
        <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
          <DialogTrigger asChild>
            <button className="w-full mb-6 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Doctor
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>Add a new doctor to your hospital</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDoctor} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Cardiology"
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
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Add Doctor
              </button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-3 mt-4">
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
                          <h3 className="truncate">{doctor.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
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
