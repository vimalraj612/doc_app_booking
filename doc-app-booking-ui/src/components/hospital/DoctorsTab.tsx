import { useState, useEffect } from 'react';
import { Plus, CalendarCheck, Edit, Trash2, LayoutTemplate, CalendarDays, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { TabsContent } from '../ui/tabs';
import { AddDoctorForm } from './AddDoctorForm';
import { DoctorDTO } from '../../api/doctor';
import { useLocale } from '../../contexts/LocaleContext';
import { InlineMessage } from '../ui/inline-message';

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
  onSlotTemplatesClick: (doctorId: string) => void;
  onSlotsClick: (doctorId: string) => void;
  onLeavesClick: (doctorId: string, doctorName: string) => void;
  onViewAppointments: (doctorName: string) => void;
  onDeleteClick: (doctorId: string) => void;
  setLastClickedDoctor: (doctorId: string) => void;
  deleteError?: string | null;
  clearDeleteError?: () => void;
  onDoctorError?: (message: string) => void;
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
  onSlotTemplatesClick,
  onSlotsClick,
  onLeavesClick,
  onViewAppointments,
  onDeleteClick,
  setLastClickedDoctor,
  deleteError,
  clearDeleteError,
  onDoctorError,
}: DoctorsTabProps) {
  const [transientError, setTransientError] = useState<string | null>(null);

  useEffect(() => {
    if (!deleteError) return;
    setTransientError(deleteError);

    const timeout = setTimeout(() => {
      setTransientError(null);
      clearDeleteError?.();
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [deleteError, clearDeleteError]);
  const { t } = useLocale();
  return (
    <TabsContent value="doctors" className="space-y-3 mt-4">
            <Dialog 
        open={isAddDoctorOpen} 
        onOpenChange={(open) => {
          setIsAddDoctorOpen(open);
          if (!open) {
            setEditingDoctor(null);
            clearDeleteError?.(); // Clear delete error when dialog closes
          }
        }}
      >
        <DialogTrigger asChild>
          <button className="mb-4 w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5 bg-transparent" />
            {t.messages.LABELS.ADD_NEW_DOCTOR}
          </button>
        </DialogTrigger>
  <DialogContent className="max-w-3xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{editingDoctor ? t.messages.LABELS.EDIT_DOCTOR : t.messages.LABELS.ADD_NEW_DOCTOR}</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">{editingDoctor ? t.messages.LABELS.UPDATE_DOCTOR_INFO : t.messages.LABELS.FILL_DOCTOR_DETAILS}</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AddDoctorForm 
              onSuccess={() => { setIsAddDoctorOpen(false); setEditingDoctor(null); }} 
              onAddDoctor={onAddDoctor}
              onUpdateDoctor={onUpdateDoctor}
              initialDoctor={editingDoctor}
              hospital={hospital}
              user={user}
              onSubmitError={onDoctorError}
            />
          </div>
        </DialogContent>
      </Dialog>

      {transientError && (
        <div className="mb-4">
          <InlineMessage type="error" message={transientError} />
        </div>
      )}
      {doctors.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {t.messages.LABELS.NO_DOCTORS_YET}
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
                    <h3 className="font-semibold text-base md:truncate">{t.messages.DOCTOR.PREFIX} {doctor.name}</h3>
                    <div className="flex flex-col gap-1 mt-1 text-sm">
                      <span className="text-gray-600"><span className="font-medium">{t.messages.LABELS.SPECIALIZATION}:</span> {doctor.specialization}</span>
                      {doctor.qualifications && (
                        <span className="text-gray-600"><span className="font-medium">{t.messages.LABELS.QUALIFICATIONS}:</span> {doctor.qualifications}</span>
                      )}
                      <span className="text-gray-600"><span className="font-medium">{t.messages.LABELS.EMAIL}:</span> {doctor.email}</span>
                      {doctor.phoneNumber && (
                        <span className="text-gray-600"><span className="font-medium">{t.messages.LABELS.PHONE}:</span> {doctor.phoneNumber}</span>
                      )}
                      {doctor.department && (
                        <span className="text-gray-600"><span className="font-medium">{t.messages.LABELS.DEPARTMENT}:</span> {doctor.department}</span>
                      )}
                      {(doctor.experienceYears ?? 0) > 0 && (
                        <span className="text-gray-600"><span className="font-medium">{t.messages.LABELS.EXPERIENCE_YEARS}:</span> {doctor.experienceYears ?? 0} years</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 items-center sm:items-start min-w-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title={t.messages.LABELS.SLOT_TEMPLATES_ACTION}
                    onPointerDown={() => setLastClickedDoctor(doctor.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotTemplatesClick(doctor.id);
                    }}
                  >
                    <span className="sm:hidden"><LayoutTemplate className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">{t.messages.LABELS.SLOT_TEMPLATES}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title={t.messages.LABELS.SLOTS}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSlotsClick(doctor.id);
                    }}
                  >
                    <span className="sm:hidden"><CalendarDays className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">{t.messages.LABELS.SLOTS}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center"
                    title={t.messages.LABELS.LEAVES}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeavesClick(doctor.id, doctor.name);
                    }}
                  >
                    <span className="sm:hidden"><Calendar className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">{t.messages.LABELS.LEAVES}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center" 
                    title={t.messages.LABELS.APPOINTMENTS}
                    onClick={() => onViewAppointments(doctor.name)}
                  >
                    <span className="sm:hidden"><CalendarCheck className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">{t.messages.LABELS.APPOINTMENTS}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center justify-center" 
                    title={t.messages.LABELS.EDIT}
                    onClick={() => { 
                      setEditingDoctor(doctor); 
                      setIsAddDoctorOpen(true); 
                    }}
                  >
                    <span className="sm:hidden"><Edit className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">{t.messages.LABELS.EDIT}</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDeleteClick(doctor.id)} 
                    className="flex items-center justify-center" 
                    title={t.messages.LABELS.DELETE}
                  >
                    <span className="sm:hidden"><Trash2 className="w-5 h-5 bg-transparent" /></span>
                    <span className="hidden sm:inline">{t.messages.LABELS.DELETE}</span>
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
