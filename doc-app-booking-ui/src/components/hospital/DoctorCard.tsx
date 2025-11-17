import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Stethoscope, Trash2, Edit, Calendar, CalendarDays } from 'lucide-react';
import { DoctorDTO } from '../../api/doctor';
import { useLocale } from '../../contexts/LocaleContext';

interface DoctorCardProps {
  doctor: DoctorDTO;
  onEdit: (doctor: DoctorDTO) => void;
  onDelete: (doctorId: string | number) => void;
  onManageSlots: (doctorId: string | number) => void;
  onManageLeaves: (doctorId: string | number, doctorName: string) => void;
}

export function DoctorCard({ 
  doctor, 
  onEdit, 
  onDelete, 
  onManageSlots, 
  onManageLeaves 
}: DoctorCardProps) {
  const { t } = useLocale();
  const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || doctor.name || 'Unknown';
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const photoUrl = doctor.profileImage && doctor.imageContentType
    ? `data:${doctor.imageContentType};base64,${doctor.profileImage}`
    : undefined;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex items-start gap-3 w-full sm:flex-1">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <AvatarImage src={photoUrl} alt={fullName} />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-sm sm:text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                Dr. {fullName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span title={t.messages.LABELS.SPECIALIZATION}>
                  <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                </span>
                <span className="text-xs sm:text-sm text-gray-600 truncate">{doctor.specialization}</span>
              </div>
              {doctor.department && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{doctor.department}</p>
              )}
              {doctor.experienceYears !== undefined && (
                <Badge variant="outline" className="mt-2 text-xs">
                  {doctor.experienceYears} years exp.
                </Badge>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-1 w-full sm:w-auto overflow-x-auto sm:overflow-visible">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(doctor)}
              className="flex-1 sm:w-full text-xs px-2"
              title={t.messages.LABELS.EDIT}
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageSlots(doctor.id!)}
              className="flex-1 sm:w-full text-xs px-2"
              title={t.messages.LABELS.SLOTS}
            >
              <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Slots</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageLeaves(doctor.id!, fullName)}
              className="flex-1 sm:w-full text-xs px-2"
              title={t.messages.LABELS.LEAVES}
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Leaves</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(doctor.id!)}
              className="flex-1 sm:w-full text-xs px-2"
              title={t.messages.LABELS.DELETE}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="min-w-0">
            <span className="text-gray-500">{t.messages.LABELS.EMAIL}:</span>
            <p className="font-medium truncate text-xs sm:text-sm">{doctor.email}</p>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500">{t.messages.LABELS.PHONE}:</span>
            <p className="font-medium truncate text-xs sm:text-sm">{doctor.phoneNumber}</p>
          </div>
        </div>

        {doctor.qualifications && (
          <div className="mt-3 pt-3 border-t">
            <span className="text-xs text-gray-500">{t.messages.LABELS.QUALIFICATIONS}:</span>
            <p className="text-sm text-gray-700 mt-1">{doctor.qualifications}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
