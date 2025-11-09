import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { InlineMessage } from '../ui/inline-message';
import { PatientProfile as PatientProfileType } from '../../api/user';

interface PatientProfileProps {
  profile: PatientProfileType | null;
  loading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onClose: () => void;
  msg: string | null;
}

const PatientProfile: React.FC<PatientProfileProps> = ({
  profile,
  loading,
  error,
  onChange,
  onSave,
  onClose,
  msg,
}) => {
  // Map gender to uppercase for select value
  const mappedProfile = profile
    ? {
      ...profile,
      gender: profile.gender ? profile.gender.toUpperCase() : '',
    }
    : {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: '',
    };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Update your personal information below
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading && <InlineMessage type="info" message="Loading profile..." />}
          {error && <InlineMessage type="error" message={error} />}
          {msg && !error && <InlineMessage type="success" message={msg} />}

          <form onSubmit={e => { e.preventDefault(); onSave(); }} className="space-y-6 mt-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                  <Input 
                    id="firstName"
                    name="firstName" 
                    value={mappedProfile.firstName || ''} 
                    onChange={onChange} 
                    placeholder="Enter first name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                  <Input 
                    id="lastName"
                    name="lastName" 
                    value={mappedProfile.lastName || ''} 
                    onChange={onChange} 
                    placeholder="Enter last name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth"
                    name="dateOfBirth" 
                    type="date"
                    value={mappedProfile.dateOfBirth || ''} 
                    onChange={onChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <select 
                    id="gender"
                    name="gender" 
                    value={mappedProfile.gender || ''} 
                    onChange={onChange}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={mappedProfile.email || ''} 
                    onChange={onChange} 
                    placeholder="patient@example.com"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                  <Input 
                    id="phoneNumber"
                    name="phoneNumber" 
                    value={mappedProfile.phoneNumber || ''} 
                    placeholder="+919876543210"
                    className="bg-gray-50 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500">Phone number cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Input 
                  id="address"
                  name="address" 
                  value={mappedProfile.address || ''} 
                  onChange={onChange} 
                  placeholder="Enter your address"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 items-stretch pt-6 border-t mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="w-full"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfile;
