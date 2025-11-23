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
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={photoUrl} alt={fullName} />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              Dr. {fullName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Stethoscope className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{doctor.specialization}</span>
            </div>
            {doctor.department && (
              <p className="text-sm text-gray-500 mt-1">{doctor.department}</p>
            )}
            {doctor.experienceYears !== undefined && (
              <Badge variant="outline" className="mt-2">
                {doctor.experienceYears} years exp.
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(doctor)}
              className="w-full"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageSlots(doctor.id!)}
              className="w-full"
            >
              <CalendarDays className="w-4 h-4 mr-1" />
              Slots
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageLeaves(doctor.id!, fullName)}
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Leaves
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(doctor.id!)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t.messages.LABELS.EMAIL}:</span>
            <p className="font-medium truncate">{doctor.email}</p>
          </div>
          <div>
            <span className="text-gray-500">{t.messages.LABELS.PHONE}:</span>
            <p className="font-medium">{doctor.phoneNumber}</p>
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
