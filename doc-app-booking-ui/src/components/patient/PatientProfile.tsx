import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { PhoneInput } from '../ui/phone-input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { InlineMessage } from '../ui/inline-message';
import { PatientProfile as PatientProfileType } from '../../api/user';
import {
  getPatientRelations,
  createPatientRelation,
  updatePatientRelation,
  deletePatientRelation,
  PatientRelation,
} from '../../api';
import { useLocale } from '../../contexts/LocaleContext';
import { getGenderOptions, getRelationshipOptions } from '../../constants/dropdownOptions';
import { ValidationMessages } from '../../constants/messages';
import {SquarePen, Trash   } from 'lucide-react';
interface PatientProfileProps {
  profile: PatientProfileType | null;
  loading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
  onClose: () => void;
  msg: string | null;
  onInitialLoadComplete?: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({
  profile,
  loading,
  error,
  onChange,
  onSave,
  onClose,
  msg,
  onInitialLoadComplete,
}) => {
  const { t } = useLocale();
  const genderOptions = getGenderOptions(t);
  const relationshipOptions = getRelationshipOptions(t);

  // Patient Relations State
  const [relations, setRelations] = useState<PatientRelation[]>([]);
  const [relationsLoading, setRelationsLoading] = useState(false);
  const [relationError, setRelationError] = useState('');
  const [showRelationDialog, setShowRelationDialog] = useState(false);
  const [editingRelation, setEditingRelation] = useState<PatientRelation | null>(null);
  const [relationForm, setRelationForm] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: '',
    relationship: '',
  });
  const [relationFormLoading, setRelationFormLoading] = useState(false);
  const [relationFormMsg, setRelationFormMsg] = useState('');
  const [relationFormErrors, setRelationFormErrors] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: '',
    relationship: '',
  });

  // Auto-dismiss relation success message
  useEffect(() => {
    if (relationFormMsg) {
      const timer = setTimeout(() => setRelationFormMsg(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [relationFormMsg]);

  // Fetch relations on mount
  useEffect(() => {
    if (profile && profile.id) {
      setRelationsLoading(true);
      getPatientRelations(String(profile.id))
        .then((data: PatientRelation[]) => setRelations(data))
        .catch(() => setRelationError(t.patientRelations.fetchError))
        .finally(() => {
          setRelationsLoading(false);
          // Notify parent that initial loading is complete
          if (onInitialLoadComplete) {
            // Add a small delay to prevent abrupt transition
            setTimeout(() => onInitialLoadComplete(), 150);
          }
        });
    }
  }, [profile, t.patientRelations.fetchError, onInitialLoadComplete]);

  // Handlers
  const handleAddRelation = () => {
    setEditingRelation(null);
    setRelationForm({ fullName: '', dateOfBirth: '', phoneNumber: '', gender: '', relationship: '' });
    setShowRelationDialog(true);
    setRelationFormMsg('');
    setRelationError('');
    setRelationFormErrors({ fullName: '', dateOfBirth: '', phoneNumber: '', gender: '', relationship: '' });
  };

  const handleEditRelation = (relation: PatientRelation) => {
    setEditingRelation(relation);
    
    // Extract last 10 digits from phone number for editing
    const phoneForEdit = relation.phoneNumber 
      ? relation.phoneNumber.replace(/^\+?91?/, '').slice(-10)
      : '';
    
    setRelationForm({
      fullName: relation.fullName,
      dateOfBirth: relation.dateOfBirth || '',
      phoneNumber: phoneForEdit,
      gender: relation.gender,
      relationship: relation.relationship,
    });
    setShowRelationDialog(true);
    setRelationFormMsg('');
    setRelationError('');
    setRelationFormErrors({ fullName: '', dateOfBirth: '', phoneNumber: '', gender: '', relationship: '' });
  };

  const handleDeleteRelation = (relationId: string) => {
    setRelationFormLoading(true);
    deletePatientRelation(relationId)
      .then(() => {
        // Reload relations after delete
        if (profile && profile.id) {
          getPatientRelations(String(profile.id))
            .then((data: PatientRelation[]) => setRelations(data))
            .catch(() => setRelationError(t.patientRelations.fetchError));
        }
        setRelationFormMsg(t.patientRelations.deleteSuccess);
        setRelationError('');
      })
      .catch(() => setRelationError(t.patientRelations.deleteError))
      .finally(() => setRelationFormLoading(false));
  };

  const handleRelationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRelationForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (relationFormErrors[name as keyof typeof relationFormErrors]) {
      setRelationFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRelationPhoneChange = (value: string) => {
    setRelationForm(prev => ({ ...prev, phoneNumber: value }));
    // Clear phone error when user starts typing
    if (relationFormErrors.phoneNumber) {
      setRelationFormErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  const handleRelationFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset all errors
    const errors = {
      fullName: '',
      dateOfBirth: '',
      phoneNumber: '',
      gender: '',
      relationship: '',
    };
    
    let isValid = true;
    
    // Client-side validation for all required fields
    if (!relationForm.fullName.trim()) {
      errors.fullName = ValidationMessages.NAME_REQUIRED;
      isValid = false;
    }
    if (!relationForm.dateOfBirth) {
      errors.dateOfBirth = ValidationMessages.DATE_REQUIRED;
      isValid = false;
    }
    if (!relationForm.phoneNumber.trim()) {
      errors.phoneNumber = ValidationMessages.PHONE_REQUIRED;
      isValid = false;
    }
    if (!relationForm.gender.trim()) {
      errors.gender = ValidationMessages.GENDER_REQUIRED;
      isValid = false;
    }
    if (!relationForm.relationship.trim()) {
      errors.relationship = ValidationMessages.RELATION_REQUIRED;
      isValid = false;
    }
    
    setRelationFormErrors(errors);
    
    if (!isValid) {
      return;
    }
    
    setRelationFormLoading(true);
    setRelationError('');
    setRelationFormMsg('');
    
    // Format phone number with +91 prefix if not already present
    let formattedPhone = relationForm.phoneNumber.trim();
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
      // Remove any existing country codes or + symbols
      formattedPhone = formattedPhone.replace(/^\+?91?/, '');
      // Add +91 prefix
      formattedPhone = '+91' + formattedPhone;
    }
    
    const payload = {
      ...relationForm,
      phoneNumber: formattedPhone,
    };
    if (editingRelation) {
      updatePatientRelation((editingRelation as PatientRelation).id, payload)
        .then((updated: PatientRelation) => {
          setRelations(relations.map((r: PatientRelation) => r.id === updated.id ? updated : r));
          setRelationFormMsg(t.patientRelations.updateSuccess);
          setShowRelationDialog(false);
        })
        .catch(() => setRelationError(t.patientRelations.updateError))
        .finally(() => setRelationFormLoading(false));
    } else {
      if (profile && profile.id) {
        createPatientRelation(String(profile.id), payload)
          .then((newRel: PatientRelation) => {
            setRelations([...relations, newRel]);
            setRelationFormMsg(t.patientRelations.createSuccess);
            setShowRelationDialog(false);
          })
          .catch(() => setRelationError(t.patientRelations.createError))
          .finally(() => setRelationFormLoading(false));
      }
    }
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modal edit_profile">
        <DialogHeader className="heading_wrap flex-shrink-0 pb-2 sm:pb-3 md:pb-4 border-b">
          <DialogTitle className="heading">{t.patient.editProfile}</DialogTitle>
          {/* <DialogDescription className="text-xs sm:text-sm text-gray-600">
            {t.profileFields.updatePersonalInfo}
          </DialogDescription> */}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && <InlineMessage type="error" message={error} />}
          {msg && !error && <InlineMessage type="success" message={msg} />}

          <form onSubmit={e => { e.preventDefault(); onSave(); }} className="space-y-3 sm:space-y-4 md:space-y-6 mt-1 sm:mt-2 md:mt-4">
            {/* Personal Information Section */}
            <div className="personal_info">
              <h3 className="heading">{t.forms.personalInfo}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="field">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium">{t.profileFields.firstName} *</Label>
                  <Input 
                    id="firstName"
                    name="firstName" 
                    value={mappedProfile.firstName || ''} 
                    onChange={onChange} 
                    placeholder={t.profileFields.enterFirstName}
                    disabled={loading}
                    className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="field">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium">{t.profileFields.lastName} *</Label>
                  <Input 
                    id="lastName"
                    name="lastName" 
                    value={mappedProfile.lastName || ''} 
                    onChange={onChange} 
                    placeholder={t.profileFields.enterLastName}
                    disabled={loading}
                    className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                  />
                </div>
        
                <div className="field">
                  <Label htmlFor="dateOfBirth" className="text-xs sm:text-sm font-medium">{t.profileFields.dateOfBirth}</Label>
                  <Input 
                    id="dateOfBirth"
                    name="dateOfBirth" 
                    type="date"
                    value={mappedProfile.dateOfBirth || ''} 
                    onChange={onChange}
                    disabled={loading}
                    className="date h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="field">
                  <Label htmlFor="gender" className="text-xs sm:text-sm font-medium">{t.profileFields.gender}</Label>
                  <select
                    name="gender"
                    value={mappedProfile.gender || ''}
                    onChange={onChange}
                    disabled={loading}
                    className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 appearance-none bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 8px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  >
                    <option value="">{t.profileFields.selectGender}</option>
                    {genderOptions.map(opt => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="contact_info">
              <h3 className="heading">{t.forms.contactInfo}</h3>
                <div className="field">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">{t.profileFields.email} *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={mappedProfile.email || ''} 
                    onChange={onChange} 
                    placeholder={t.profileFields.enterEmail}
                    disabled={loading}
                    className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                  />
                </div>
                <div className="field">
                  <Label htmlFor="phoneNumber" className="text-xs sm:text-sm font-medium">{t.profileFields.phoneNumber}</Label>
                  <Input 
                    id="phoneNumber"
                    name="phoneNumber" 
                    value={mappedProfile.phoneNumber || ''} 
                    placeholder="+919876543210"
                    className="bg-gray-50 cursor-not-allowed h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                    disabled
                    readOnly
                  />
                  <p className="text-[6px] sm:text-[8px] md:text-[6px] text-gray-500" style={{ fontSize: '50%' }}>{t.profileFields.phoneCannotChange}</p>
                </div>

              <div className="field">
                <Label htmlFor="address" className="text-xs sm:text-sm font-medium">{t.profileFields.address}</Label>
                <Input 
                  id="address"
                  name="address" 
                  value={mappedProfile.address || ''} 
                  onChange={onChange} 
                  placeholder={t.profileFields.enterAddress}
                  disabled={loading}
                  className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="flex flex-col gap-2 sm:gap-3 items-stretch pt-2 sm:pt-4 md:pt-6 border-t mt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="btn_theme"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t.profileFields.savingProfile}
                  </>
                ) : (
                  t.profileFields.saveProfile
                )}
              </Button>
            </div>
          </form>

          {/* Patient Relations Section - Outside of form */}
          <div className="patient_profiles">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <h3 className="heading">{t.patientRelations.title}</h3>
            </div>
            
            {relationFormMsg && <InlineMessage type="success" message={relationFormMsg} />}
            
            {relationsLoading ? (
              <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-500"></div>
                  <span className="text-xs sm:text-sm text-gray-500">{t.patientRelations.loading}</span>
                </div>
              </div>
            ) : relationError ? (
              <InlineMessage type="error" message={relationError} />
            ) : relations.length === 0 ? (
              <div className="text-center py-4 sm:py-6 md:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">{t.patientRelations.noRelations}</p>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 px-2 sm:px-4">Add family members or emergency contacts</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden" style={{padding:'4px'}}>
                {/* Mobile Card View */}
                <div className="profiles">
                  {relations.map((rel: PatientRelation) => (
                    <div key={rel.id} className="card">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{rel.fullName}</h4>
                          <p className="text-xs text-gray-500">{rel.relationship}</p>
                        </div>
                        <div className="actions_wrap">
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditRelation(rel)}
                            className="action edit"
                          >
                            {/* {t.common.edit} */}
                            <SquarePen />
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteRelation(rel.id)} 
                            disabled={relationFormLoading}
                            className="action delete"
                          >
                            {/* {t.common.delete} */}
                            <Trash />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">{t.patientRelations.age}:</span>
                          <span className="ml-1 text-gray-900">{rel.age}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t.patientRelations.gender}:</span>
                          <span className="ml-1 text-gray-900">{rel.gender || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t.patientRelations.phoneNumber}:</span>
                          <span className="ml-1 text-gray-900 break-all">{rel.phoneNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto max-w-full">
                    <table className="w-full divide-y divide-gray-200 min-w-[600px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">{t.patientRelations.fullName}</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">{t.patientRelations.age}</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">{t.patientRelations.gender}</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">{t.patientRelations.phoneNumber}</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">{t.patientRelations.relationship}</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{t.common.actions ?? 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {relations.map((rel: PatientRelation) => (
                          <tr key={rel.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-3 text-sm font-medium text-gray-900 max-w-[120px] truncate" title={rel.fullName}>{rel.fullName}</td>
                            <td className="px-3 py-3 text-sm text-gray-500">{rel.age}</td>
                            <td className="px-3 py-3 text-sm text-gray-500">{rel.gender || 'N/A'}</td>
                            <td className="px-3 py-3 text-sm text-gray-500 max-w-[120px] truncate" title={rel.phoneNumber || 'N/A'}>{rel.phoneNumber || 'N/A'}</td>
                            <td className="px-3 py-3 text-sm text-gray-500 max-w-[100px] truncate" title={rel.relationship}>{rel.relationship}</td>
                            <td className="px-3 py-3 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleEditRelation(rel)}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-2 py-1"
                                >
                                  {t.common.edit}
                                </Button>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => handleDeleteRelation(rel.id)} 
                                  disabled={relationFormLoading}
                                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                                >
                                  {t.common.delete}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 sm:gap-2 md:gap-3 pt-2 sm:pt-4 md:pt-6 border-t mt-2 sm:mt-4 md:mt-6">
            <Button 
              type="button" 
              onClick={handleAddRelation}
              className="btn_theme"
              style={{ backgroundColor: '#1f2937', color: 'white' }}
            >
              <span className="mr-2 text-sm sm:text-base md:text-lg font-bold">+</span>
              {t.patientRelations.addRelation}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="btn_theme_secondary"
            >
              {t.common.cancel}
            </Button>
          </div>
        </div>

        {/* Relation Add/Edit Dialog */}
        <Dialog open={showRelationDialog} onOpenChange={setShowRelationDialog}>
          <DialogContent className="modal add_relation max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="heading_wrap">
              <DialogTitle className="heading">
                {editingRelation ? t.patientRelations.editRelation : t.patientRelations.addRelation}
              </DialogTitle>
              <DialogDescription className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                {t.patientRelations.dialogDescription}
              </DialogDescription>
            </DialogHeader>
            
            {relationError && <InlineMessage type="error" message={relationError} />}
            {relationFormMsg && <InlineMessage type="success" message={relationFormMsg} />}
            
            <div className="space-y-6 py-4">
              <form onSubmit={handleRelationFormSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="field">
                    <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium">{t.patientRelations.fullName} *</Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      value={relationForm.fullName} 
                      onChange={handleRelationFormChange} 
                      disabled={relationFormLoading}
                      placeholder="Enter full name"
                      className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm ${relationFormErrors.fullName ? 'border-red-500' : ''}`}
                    />
                    {relationFormErrors.fullName && (
                      <p className="text-red-600 text-sm">{relationFormErrors.fullName}</p>
                    )}
                  </div>
                  <div className="field">
                    <Label htmlFor="dateOfBirth" className="text-xs sm:text-sm font-medium">{t.profileFields.dateOfBirth} *</Label>
                    <Input 
                      id="dateOfBirth" 
                      name="dateOfBirth" 
                      type="date" 
                      value={relationForm.dateOfBirth} 
                      onChange={handleRelationFormChange} 
                      disabled={relationFormLoading}
                      className={`date h-8 sm:h-9 md:h-10 text-xs sm:text-sm ${relationFormErrors.dateOfBirth ? 'border-red-500' : ''}`}
                    />
                    {relationFormErrors.dateOfBirth && (
                      <p className="text-red-600 text-sm">{relationFormErrors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
                
                <div className='field'>
                  <PhoneInput
                    id="phoneNumber"
                    label={`${t.patientRelations.phoneNumber} *`}
                    value={relationForm.phoneNumber}
                    onChange={handleRelationPhoneChange}
                    disabled={relationFormLoading}
                    placeholder="Enter 10 digit mobile number"
                    className={`w-full text-xs sm:text-sm ${relationFormErrors.phoneNumber ? 'border-red-500' : ''}`}
                    error={relationFormErrors.phoneNumber}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div className="field">
                    <Label htmlFor="gender" className="text-xs sm:text-sm font-medium">{t.patientRelations.gender} *</Label>
                    <select
                      name="gender"
                      value={relationForm.gender || ''}
                      onChange={handleRelationFormChange}
                      disabled={relationFormLoading}
                      className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm w-full px-3 py-2 pr-8 border ${relationFormErrors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 appearance-none bg-white`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 8px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="">{t.profileFields.selectGender}</option>
                      {genderOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    {relationFormErrors.gender && (
                      <p className="text-red-600 text-sm">{relationFormErrors.gender}</p>
                    )}
                  </div>
                  
                  <div className="field">
                    <Label htmlFor="relationship" className="text-xs sm:text-sm font-medium">{t.patientRelations.relationship} *</Label>
                    <select
                      name="relationship"
                      value={relationForm.relationship || ''}
                      onChange={handleRelationFormChange}
                      disabled={relationFormLoading}
                      className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm w-full px-3 py-2 pr-8 border ${relationFormErrors.relationship ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 appearance-none bg-white`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 8px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '16px',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="">{t.patientRelations.selectRelationship}</option>
                      {relationshipOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    {relationFormErrors.relationship && (
                      <p className="text-red-600 text-sm">{relationFormErrors.relationship}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 sm:gap-2 md:gap-3 pt-2 sm:pt-3 md:pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRelationDialog(false)} 
                    disabled={relationFormLoading}
                    className="btn_theme_secondary"
                  >
                    {t.common.cancel}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={relationFormLoading} 
                    className="btn_theme"
                  >
                    {relationFormLoading && <span className="animate-spin mr-2">⏳</span>}
                    {editingRelation ? t.common.update : t.common.save}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfile;
