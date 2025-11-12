import { useState } from 'react';
import { Plus, CalendarCheck, Edit, Trash2, LayoutTemplate, CalendarDays, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { TabsContent } from '../ui/tabs';
import { AddDoctorForm } from './AddDoctorForm';
import { DoctorDTO } from '../../api/doctor';

interface DoctorsTabProps {
  doctors: Array<{
    id: string;
    name: string;
    specialization: string;
    hospitalId: string;
    hospitalName: string;
    email: string;
    photo: string;
    qualifications?: string;
    phoneNumber?: string;
    department?: string;
    experienceYears?: number;
  }>;
  hospital: any;
  user: any;
  isAddDoctorOpen: boolean;
  setIsAddDoctorOpen: (open: boolean) => void;
  editingDoctor: any;
  setEditingDoctor: (doctor: any) => void;
  onAddDoctor: (doctor: Partial<DoctorDTO>) => Promise<void>;
  onUpdateDoctor: (id: string, doctor: Partial<DoctorDTO>) => Promise<void>;
  onSlotTemplateClick: (doctorId: string) => void;
  onSlotsClick: (doctorId: string) => void;
  onLeavesClick: (doctorId: string, doctorName: string) => void;
  onViewAppointments: (doctorName: string) => void;
  onDeleteClick: (doctorId: string) => void;
  setLastClickedDoctor: (doctorId: string) => void;
}

export default function DoctorsTab({
  doctors,
  hospital,
  user,
  isAddDoctorOpen,
  setIsAddDoctorOpen,
  editingDoctor,
  setEditingDoctor,
  onAddDoctor,
  onUpdateDoctor,
  onSlotTemplateClick,
  onSlotsClick,
  onLeavesClick,
  onViewAppointments,
  onDeleteClick,
  setLastClickedDoctor,
}: DoctorsTabProps) {
  return (
    <TabsContent value="doctors" className="space-y-3 mt-4">
      <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
        <DialogTrigger asChild>
          <button className="mb-4 w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5 bg-transparent" />
            Add New Doctor
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">{editingDoctor ? 'Update doctor information below' : 'Fill in the details to add a new doctor to your hospital'}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AddDoctorForm 
              onSuccess={() => { setIsAddDoctorOpen(false); setEditingDoctor(null); }} 
              onAddDoctor={onAddDoctor}
              onUpdateDoctor={onUpdateDoctor}
              initialDoctor={editingDoctor}
              hospital={hospital}
              user={user}
            />
          </div>
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
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={doctor.photo} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:truncate">{doctor.name}</h3>
                    <div className="flex flex-col gap-1 mt-1 text-sm">
                      <span className="text-gray-600"><span className="font-medium">Specialization:</span> {doctor.specialization}</span>
                      {doctor.qualifications && (
                        <span className="text-gray-600"><span className="font-medium">Qualifications:</span> {doctor.qualifications}</span>
                      )}
                      <span className="text-gray-600"><span className="font-medium">Email:</span> {doctor.email}</span>
                      {doctor.phoneNumber && (
                        <span className="text-gray-600"><span className="font-medium">Phone:</span> {doctor.phoneNumber}</span>
                      )}
                      {doctor.department && (
                        <span className="text-gray-600"><span className="font-medium">Department:</span> {doctor.department}</span>
                      )}
                      {(doctor.experienceYears ?? 0) > 0 && (
                        <span className="text-gray-600"><span className="font-medium">Experience:</span> {doctor.experienceYears ?? 0} years</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-start min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title="Slot Templates"
                    onPointerDown={() => setLastClickedDoctor(doctor.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotTemplateClick(doctor.id);
                    }}
                  >
                    <span className="sm:hidden"><LayoutTemplate className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">Slot Templates</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title="Slots"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotsClick(doctor.id);
                    }}
                  >
                    <span className="sm:hidden"><CalendarDays className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">Slots</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title="Leaves"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeavesClick(doctor.id, doctor.name);
                    }}
                  >
                    <span className="sm:hidden"><Calendar className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">Leaves</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center" 
                    title="View appointments" 
                    onClick={() => onViewAppointments(doctor.name)}
                  >
                    <span className="sm:hidden"><CalendarCheck className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">Appointments</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center" 
                    title="Edit" 
                    onClick={() => { 
                      setEditingDoctor(doctor); 
                      setIsAddDoctorOpen(true); 
                    }}
                  >
                    <span className="sm:hidden"><Edit className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeleteClick(doctor.id)} 
                    className="flex items-center justify-center" 
                    title="Delete"
                  >
                    <span className="sm:hidden"><Trash2 className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </TabsContent>
  );
}
