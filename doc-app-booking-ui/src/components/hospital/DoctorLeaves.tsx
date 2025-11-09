import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import ConfirmDialog from '../ui/ConfirmDialog';
import { createDoctorLeave, fetchDoctorLeavesForDoctor, deleteDoctorLeave, DoctorLeaveResponse } from '../../api/doctorLeaves';
import { InlineMessage } from '../ui/inline-message';
import { LeaveMessages, ValidationMessages } from '../../constants/messages';

interface DoctorLeavesProps {
  doctorId: string | number | null;
  doctorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DoctorLeaves: React.FC<DoctorLeavesProps> = ({ doctorId, doctorName, open, onOpenChange }) => {
  const [leaves, setLeaves] = useState<DoctorLeaveResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: number }>({ open: false });

  useEffect(() => {
    if (!open || !doctorId) return;
    void loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doctorId]);

  const loadLeaves = async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctorLeavesForDoctor(doctorId);
      setLeaves(data || []);
    } catch (e: any) {
      setError(e?.message || LeaveMessages.LOADING_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!doctorId || !date) {
      setError(ValidationMessages.DATE_REQUIRED);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createDoctorLeave({ doctorId, date, reason });
      setSuccessMsg(LeaveMessages.CREATED_SUCCESS);
      setDate('');
      setReason('');
      await loadLeaves();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setError(e?.message || LeaveMessages.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return setConfirm({ open: false });
    try {
      await deleteDoctorLeave(id);
      setSuccessMsg(LeaveMessages.DELETED_SUCCESS);
      await loadLeaves();
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e: any) {
      setError(e?.message || LeaveMessages.DELETE_FAILED);
    } finally {
      setConfirm({ open: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Doctor Leaves</DialogTitle>
          <DialogDescription>Manage leaves for {doctorName || 'the doctor'}.</DialogDescription>
        </DialogHeader>

        <div className="p-3 space-y-3">
          {error && (
            <InlineMessage type="error" message={error} />
          )}
          {successMsg && (
            <InlineMessage type="success" message={successMsg} />
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />

              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => { setDate(''); setReason(''); }}>Reset</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
              </div>
            </div>

            <div>
              <Label>Reason (optional)</Label>
              <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (max 500 chars)" />

              
            </div>
          </form>

          <div className="pt-2">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="text-sm text-gray-500">No leaves scheduled.</div>
            ) : (
              <div className="space-y-2">
                {leaves.map(l => (
                  <div key={l.id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      <div className="font-semibold">{l.date}</div>
                      {l.reason && <div className="text-xs text-gray-600">{l.reason}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="destructive" size="sm" onClick={() => setConfirm({ open: true, id: l.id })}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          open={confirm.open}
          title="Delete leave"
          message="Are you sure you want to delete this leave entry?"
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm({ open: false })}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DoctorLeaves;
