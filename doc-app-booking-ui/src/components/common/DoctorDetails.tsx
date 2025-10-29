import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { User as UserIcon, MapPin, Stethoscope } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

interface DoctorDetailsProps {
  selectedDoctor: any;
  loading: boolean;
  error: string;
  onShowSlots: () => void;
  docPhoneNumber: string;
}

const DoctorDetails: React.FC<DoctorDetailsProps> = ({ selectedDoctor, loading, error, onShowSlots, docPhoneNumber }) => (
  <div>
    {loading ? (
      <div>Loading doctor details...</div>
    ) : error ? (
      <div className="text-red-500">{error}</div>
    ) : selectedDoctor ? (
      <Card>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedDoctor.name || `${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
            </h2>
            <Button
              variant="default"
              size="sm"
              onClick={onShowSlots}
              title="Book Now"
            >
              Book Now
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Show avatar only on sm and up (web/tablet), hide on mobile */}
            <div className="hidden sm:block">
              <Avatar className="w-32 h-32 flex-shrink-0 mx-auto sm:mx-0">
                <AvatarImage src={selectedDoctor.profileImage ? `data:${selectedDoctor.imageContentType};base64,${selectedDoctor.profileImage}` : undefined} alt={selectedDoctor.name} />
                <AvatarFallback className="text-2xl">
                  {(selectedDoctor.firstName?.[0] || '') + (selectedDoctor.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>{selectedDoctor.specialization}</span>
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{selectedDoctor.hospitalName}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Experience:</span>
                  <span>{selectedDoctor.experienceYears} years</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">Qualifications:</span>
                  <span>{selectedDoctor.qualifications}</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <UserIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm mb-1">Contact</p>
                  <p className="text-sm text-gray-600">Email: {selectedDoctor.email}</p>
                  <p className="text-sm text-gray-600">Phone: +{docPhoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4">No doctor details found.</div>
    )}
  </div>
);

export default DoctorDetails;
