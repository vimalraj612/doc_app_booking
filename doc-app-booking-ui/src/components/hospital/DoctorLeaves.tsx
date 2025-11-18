import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { DatePicker } from '../ui/date-picker';
import { Calendar, Trash2 } from 'lucide-react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { createDoctorLeave, fetchDoctorLeavesForDoctor, deleteDoctorLeave, DoctorLeaveResponse } from '../../api/doctorLeaves';
import { InlineMessage } from '../ui/inline-message';
import { useLocale } from '../../contexts/LocaleContext';
import { useApiState } from '../../utils/api-handler';
import { useNotification } from '../../contexts/NotificationContext';

interface DoctorLeavesProps {
  doctorId: string | number | null;
  doctorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DoctorLeaves: React.FC<DoctorLeavesProps> = ({ doctorId, doctorName, open, onOpenChange }) => {
  const { t } = useLocale();
  const notification = useNotification();
  const { loading, error, success, handleApiOperation } = useApiState();
  
  const [leaves, setLeaves] = useState<DoctorLeaveResponse[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: number }>({ open: false });

  useEffect(() => {
    if (!open || !doctorId) return;
    void loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doctorId]);

  const loadLeaves = async () => {
    if (!doctorId) return;
    
    await handleApiOperation(
      () => fetchDoctorLeavesForDoctor(doctorId),
      {
        onSuccess: (data) => setLeaves(data || []),
        errorMessage: t.messages.LEAVE.LOADING_FAILED
      }
    );
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!doctorId || !date) {
      notification.error(t.messages.VALIDATION.DATE_REQUIRED);
      return;
    }

    setSubmitting(true);
    
    const result = await handleApiOperation(
      () => createDoctorLeave({ doctorId, date, reason }),
      {
        successMessage: t.messages.LEAVE.CREATED_SUCCESS,
        errorMessage: t.messages.LEAVE.CREATE_FAILED,
        onSuccess: () => {
          setDate('');
          setReason('');
          loadLeaves();
        }
      }
    );
    
    setSubmitting(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return setConfirm({ open: false });
    
    await handleApiOperation(
      () => deleteDoctorLeave(id),
      {
        successMessage: t.messages.LEAVE.DELETED_SUCCESS,
        errorMessage: t.messages.LEAVE.DELETE_FAILED,
        onSuccess: () => loadLeaves()
      }
    );
    
    setConfirm({ open: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t.messages.LABELS.DOCTOR_LEAVES}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Manage leave dates for {doctorName || 'the doctor'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Show inline error if needed for form validation */}
          {error && <InlineMessage type="error" message={error} />}

          {/* Add New Leave Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">{t.messages.LABELS.ADD_NEW_LEAVE}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveDate" className="text-sm font-medium">{t.messages.LABELS.DATE} {t.messages.LABELS.REQUIRED}</Label>
                  <DatePicker 
                    id="leaveDate"
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    placeholder={t.messages.LABELS.PLACEHOLDER_SELECT_DATE}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaveReason" className="text-sm font-medium">Reason (optional)</Label>
                  <Input 
                    id="leaveReason"
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder={t.messages.LABELS.PLACEHOLDER_REASON}
                    disabled={submitting}
                    maxLength={500}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 items-stretch pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setDate(''); setReason(''); }}
                  disabled={submitting}
                  className="w-full"
                >
                  {'Reset'}
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting || !date}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {'Creating...'}
                    </>
                  ) : (
                    t.messages.LABELS.ADD_NEW_LEAVE || 'Create Leave'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Scheduled Leaves Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Scheduled Leaves</h3>
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <span className="animate-spin">⏳</span>
                  Loading leaves...
                </div>
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <div className="flex flex-col items-center gap-3">
                  <Calendar className="w-12 h-12 text-gray-400 bg-transparent" />
                  <p className="font-medium">{t.messages.LEAVE.NO_LEAVES}</p>
                  <p className="text-sm">{t.messages.LABELS.ADD_LEAVE_TO_START}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {leaves.map(l => (
                  <div 
                    key={l.id} 
                    className="flex items-start justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-0.5">
                        <Calendar className="w-5 h-5 text-purple-500 bg-transparent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{l.date}</div>
                        {l.reason && (
                          <div className="text-sm text-gray-600 mt-1 break-words">{l.reason}</div>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setConfirm({ open: true, id: l.id })}
                      className="flex items-center gap-2 flex-shrink-0"
                      title={t.messages.LABELS.DELETE_LEAVE}
                    >
                      <Trash2 className="w-4 h-4 bg-transparent" />
                      <span className="hidden sm:inline">{t.common.delete}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={confirm.open}
          title={t.messages.LABELS.DELETE_LEAVE}
          message={t.messages.CONFIRM.DELETE_LEAVE}
          confirmText={t.common.delete}
          cancelText={t.common.cancel}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm({ open: false })}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DoctorLeaves;
