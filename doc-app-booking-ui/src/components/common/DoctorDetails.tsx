import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { User as UserIcon, MapPin, Stethoscope, Mail, Phone  } from 'lucide-react';
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
        <CardContent className="doctor_details">
          <div className="">
            <div className="profile_avtar">
              <Avatar className="avtar">
                <AvatarImage src={selectedDoctor.profileImage ? `data:${selectedDoctor.imageContentType};base64,${selectedDoctor.profileImage}` : undefined} alt={selectedDoctor.name || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`} />
                <AvatarFallback className="text-base sm:text-xl">
                  {(selectedDoctor.firstName?.[0] || '') + (selectedDoctor.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <p className='status'>Available</p>
            
            </div>
          </div>
         <span>
           <div className="doctor_details_info">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <h2 className="name">
                {t.doctor.prefix} {selectedDoctor.name || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
              </h2>
               <div className='spec_location'>
                 {selectedDoctor.specialization && (
                  <span className="specialization">
                    <Stethoscope/>
                    <span>{selectedDoctor.specialization}</span>
                  </span>
                )}

                {selectedDoctor.hospitalName && (
                  <span className="location">
                    <MapPin />
                    <span>{selectedDoctor.hospitalName}</span>
                  </span>
                )}
               </div>

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
                  {/* <UserIcon className="w-4 h-4 text-gray-500 bg-transparent mt-0.5" /> */}
                  <div className="contact">
                    {/* <p className="text-sm mb-1">{t.doctor.contact}</p> */}
                    {selectedDoctor.email && <p className=""><span><Mail /> {selectedDoctor.email}</span></p>}
                    {selectedDoctor.phoneNumber && <p className=""><span><Phone /> {selectedDoctor.phoneNumber}</span></p>}
                  </div>
                </div>
              )}
            
            
          </div>

          {/* Footer with Book Now button full width */}
          <div className="mt-4">
            <div className="flex items-center justify-start">
              <Button
                variant="default"
                size="sm"
                onClick={onShowSlots}
                title={t.doctor.bookNow}
                className="btn_theme to-blue-600"
              >
                {t.doctor.bookNow}
              </Button>
            </div>
          </div>
         </span>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">{t.doctor.noDoctorDetails}</div>
    )}
  </div>
  );
};

export default DoctorDetails;
