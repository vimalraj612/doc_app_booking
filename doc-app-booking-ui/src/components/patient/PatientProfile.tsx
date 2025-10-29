import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
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
  // Always render modal if open, show loading if profile is not loaded
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md relative flex flex-col items-center border border-blue-100 overflow-y-auto no-scrollbar" style={{ marginTop: '115px', maxHeight: '500px', minHeight: '380px' }}>
        <div className="absolute top-2 right-2 flex gap-2">
          <button className="text-gray-500 hover:text-gray-800 p-1" onClick={onClose} title="Close">&times;</button>
        </div>
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        {loading && <div className="mb-2 text-blue-600">Loading...</div>}
        {error
          ? <div className="mb-2 text-red-600">{error}</div>
          : msg && <div className="mb-2 text-green-600">{msg}</div>
        }
        <form onSubmit={e => { e.preventDefault(); onSave(); }} className="w-full flex flex-col">
          <style>{`
          .no-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari */
          }
        `}</style>
          <style>{`
          .no-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none; /* Chrome, Safari */
          }
        `}</style>
          <div className="mb-2">
            <label className="block text-sm font-medium">First Name</label>
            <input name="firstName" value={mappedProfile.firstName || ''} onChange={onChange} className="w-full border rounded px-2 py-1" disabled={loading} />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Last Name</label>
            <input name="lastName" value={mappedProfile.lastName || ''} onChange={onChange} className="w-full border rounded px-2 py-1" disabled={loading} />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Email</label>
            <input name="email" value={mappedProfile.email || ''} onChange={onChange} className="w-full border rounded px-2 py-1" disabled={loading} />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Phone Number</label>
            <input name="phoneNumber" value={mappedProfile.phoneNumber || ''} className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed" disabled readOnly />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Address</label>
            <input name="address" value={mappedProfile.address || ''} onChange={onChange} className="w-full border rounded px-2 py-1" disabled={loading} />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Date of Birth</label>
            <input name="dateOfBirth" value={mappedProfile.dateOfBirth || ''} onChange={onChange} className="w-full border rounded px-2 py-1" type="date" disabled={loading} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Gender</label>
            <select name="gender" value={mappedProfile.gender || ''} onChange={onChange} className="w-full border rounded px-2 py-1" disabled={loading}>
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={loading}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default PatientProfile;
