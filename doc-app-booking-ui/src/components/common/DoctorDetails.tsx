import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { User as UserIcon, MapPin, Stethoscope } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { InlineMessage } from '../ui/inline-message';
import { useLocale } from '../../contexts/LocaleContext';

interface DoctorDetailsProps {
  selectedDoctor: any;
  loading: boolean;
  error: string;
  onShowSlots: () => void;
  docPhoneNumber: string;
}

const DoctorDetails: React.FC<DoctorDetailsProps> = ({ selectedDoctor, loading, error, onShowSlots, docPhoneNumber }) => {
  const { t } = useLocale();
  
  return (
  <div>
    {loading ? (
      <div>{t.doctor.loadingDoctorDetails}</div>
    ) : error ? (
      <InlineMessage type="error" message={error} />
    ) : selectedDoctor ? (
      <Card>
        <CardContent className="p-6 relative flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col items-start gap-2 w-full">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={selectedDoctor.profileImage ? `data:${selectedDoctor.imageContentType};base64,${selectedDoctor.profileImage}` : undefined} alt={selectedDoctor.name || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`} />
                <AvatarFallback className="text-base sm:text-xl">
                  {(selectedDoctor.firstName?.[0] || '') + (selectedDoctor.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {selectedDoctor.name || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
              </h2>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                {selectedDoctor.specialization && (
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600 bg-transparent" />
                    <span>{selectedDoctor.specialization}</span>
                  </span>
                )}

                {selectedDoctor.hospitalName && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 bg-transparent" />
                    <span>{selectedDoctor.hospitalName}</span>
                  </span>
                )}

                {selectedDoctor.experienceYears != null && selectedDoctor.experienceYears !== '' && (
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{t.doctor.experience}:</span>
                    <span>{selectedDoctor.experienceYears} {t.doctor.years}</span>
                  </span>
                )}

                {selectedDoctor.qualifications && (
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{t.doctor.qualifications}:</span>
                    <span>{selectedDoctor.qualifications}</span>
                  </span>
                )}
              </div>
              {(selectedDoctor.email || selectedDoctor.phoneNumber) && (
                <div className="flex items-start gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500 bg-transparent mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm mb-1">{t.doctor.contact}</p>
                    {selectedDoctor.email && <p className="text-sm text-gray-600">{t.profileFields.email}: {selectedDoctor.email}</p>}
                    {selectedDoctor.phoneNumber && <p className="text-sm text-gray-600">{t.profileFields.phone}: {selectedDoctor.phoneNumber}</p>}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Footer with Book Now button full width */}
          <div className="mt-4">
            <div className="flex items-center justify-start">
              <Button
                variant="default"
                size="sm"
                onClick={onShowSlots}
                title={t.doctor.bookNow}
                className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600 hover:!border-blue-700"
              >
                {t.doctor.bookNow}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">{t.doctor.noDoctorDetails}</div>
    )}
  </div>
  );
};

export default DoctorDetails;
