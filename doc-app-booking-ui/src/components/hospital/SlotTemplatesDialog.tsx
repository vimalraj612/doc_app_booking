import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { InlineMessage } from '../ui/inline-message';
import ConfirmDialog from '../ui/ConfirmDialog';
import { LayoutTemplate, Edit, Trash2 } from 'lucide-react';
import { fetchSlotTemplatesByDoctorId, createOrUpdateSlotTemplate, deleteSlotTemplate, SlotTemplateDTO } from '../../api/doctor';
import { useLocale } from '../../contexts/LocaleContext';

interface SlotTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string | number | null;
}

export function SlotTemplatesDialog({ open, onOpenChange, doctorId }: SlotTemplatesDialogProps) {
  const { t } = useLocale();
  
  // Helper function to get localized day names
  const getDayName = (day: string) => {
    const dayMap: Record<string, string> = {
      'MONDAY': t.messages.LABELS.DAY_MONDAY,
      'TUESDAY': t.messages.LABELS.DAY_TUESDAY,
      'WEDNESDAY': t.messages.LABELS.DAY_WEDNESDAY,
      'THURSDAY': t.messages.LABELS.DAY_THURSDAY,
      'FRIDAY': t.messages.LABELS.DAY_FRIDAY,
      'SATURDAY': t.messages.LABELS.DAY_SATURDAY,
      'SUNDAY': t.messages.LABELS.DAY_SUNDAY,
    };
    return dayMap[day] || day;
  };
  
  const [slotTemplates, setSlotTemplates] = useState<SlotTemplateDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for creating/updating a slot template
  const [templateForm, setTemplateForm] = useState<{
    id?: number | null;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    active: boolean;
  }>({
    id: null,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 15,
    active: true,
  });

  const [templateErrors, setTemplateErrors] = useState<{ [k: string]: string }>({});

  // Confirm dialog state for delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<number | null>(null);

  const resetTemplateForm = () => setTemplateForm({ 
    id: null, 
    dayOfWeek: 'MONDAY', 
    startTime: '09:00', 
    endTime: '17:00', 
    slotDurationMinutes: 15, 
    active: true 
  });

  const extractErrorMessage = (err: any) => {
    try {
      if (!err) return 'Unknown error';
      const m = err?.message || err;
      if (!m) return 'Unknown error';
      try {
        const parsed = JSON.parse(m);
        if (parsed && parsed.message) return String(parsed.message);
      } catch (_) { }
      if (typeof m === 'object' && m.message) return String(m.message);
      return String(m);
    } catch (_e) {
      return 'Unknown error';
    }
  };

  const validateTemplateForm = () => {
    const errs: { [k: string]: string } = {};
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    if (!templateForm.startTime) errs.startTime = t.messages.VALIDATION.START_TIME_REQUIRED;
    if (!templateForm.endTime) errs.endTime = t.messages.VALIDATION.END_TIME_REQUIRED;
    if (templateForm.startTime && templateForm.endTime) {
      const s = toMinutes(templateForm.startTime);
      const e = toMinutes(templateForm.endTime);
      if (e <= s) errs.endTime = t.messages.VALIDATION.END_TIME_AFTER_START;
      if (e - s < templateForm.slotDurationMinutes) errs.endTime = t.messages.VALIDATION.DURATION_MUST_FIT;
    }
    if (!templateForm.slotDurationMinutes || templateForm.slotDurationMinutes < 5) {
      errs.slotDurationMinutes = t.messages.VALIDATION.DURATION_MIN_5;
    }
    setTemplateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const fetchTemplates = async () => {
    if (!doctorId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchSlotTemplatesByDoctorId(doctorId);
      setSlotTemplates(data);
    } catch (e: any) {
      console.error('Failed to fetch slot templates', e);
      setError(extractErrorMessage(e) || t.messages.SLOT_TEMPLATE.LOADING_FAILED);
      window.setTimeout(() => setError(''), 3500);
      setSlotTemplates(null);
    } finally {
      setLoading(false);
    }
  };

  const onSaveTemplate = async () => {
    if (!doctorId) {
      setError(t.messages.SLOT_TEMPLATE.NO_DOCTOR_SELECTED);
      window.setTimeout(() => setError(''), 3500);
      return;
    }
    setLoading(true);
    setError('');
    
    if (!validateTemplateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      const payload: Partial<SlotTemplateDTO> = {
        id: templateForm.id ?? undefined as any,
        doctorId: Number(doctorId),
        dayOfWeek: templateForm.dayOfWeek,
        startTime: templateForm.startTime,
        endTime: templateForm.endTime,
        slotDurationMinutes: Number(templateForm.slotDurationMinutes),
      };
      const resp: any = await createOrUpdateSlotTemplate(doctorId, payload);
      
      // Refresh list
      const data = await fetchSlotTemplatesByDoctorId(doctorId);
      setSlotTemplates(data);
      resetTemplateForm();
      setTemplateErrors({});
      
      const msg = (resp && (resp.message || (resp.data && (resp.data.message || undefined)))) || t.messages.SLOT_TEMPLATE.DELETED_SUCCESS;
      setSuccessMessage(msg);
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to delete slot template', e);
      setError(extractErrorMessage(e) || t.messages.SLOT_TEMPLATE.DELETE_FAILED);
      window.setTimeout(() => setError(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId?: number) => {
    if (!templateId) return;
    setConfirmTargetId(templateId);
    setConfirmOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    const templateId = confirmTargetId;
    if (!templateId) return setConfirmOpen(false);
    if (!doctorId) {
      setError(t.messages.SLOT_TEMPLATE.NO_DOCTOR_SELECTED);
      window.setTimeout(() => setError(''), 3500);
      setConfirmOpen(false);
      setConfirmTargetId(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp: any = await deleteSlotTemplate(templateId);
      const data = await fetchSlotTemplatesByDoctorId(doctorId);
      setSlotTemplates(data);
      const msg = (resp && (resp.message || (resp.data && (resp.data.message || undefined)))) || t.messages.SLOT_TEMPLATE.DELETED_SUCCESS;
      setSuccessMessage(msg);
      window.setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e: any) {
      console.error('Failed to delete slot template', e);
      setError(extractErrorMessage(e) || t.messages.SLOT_TEMPLATE.DELETE_FAILED);
      window.setTimeout(() => setError(''), 3500);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setConfirmTargetId(null);
    }
  };

  // Fetch templates when dialog opens
  useEffect(() => {
    if (open && doctorId) {
      fetchTemplates();
    }
  }, [open, doctorId]);

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSlotTemplates(null);
      setError('');
      resetTemplateForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl w-full sm:rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.messages.LABELS.SLOT_TEMPLATES}</DialogTitle>
            <DialogDescription>{t.messages.LABELS.MANAGE_SLOT_TEMPLATES}</DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="w-40 h-4" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
                <div className="w-24">
                  <Skeleton className="w-full h-8 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Skeleton className="h-8 rounded col-span-1" />
                <Skeleton className="h-8 rounded col-span-1" />
                <Skeleton className="h-8 rounded col-span-1" />
                <Skeleton className="h-8 rounded col-span-1" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2">
              <InlineMessage type="error" message={error} />
              <div className="flex gap-2 justify-end mt-3">
                <Button variant="outline" onClick={() => setError('')}>{t.messages.LABELS.DISMISS}</Button>
              </div>
            </div>
          )}

          {slotTemplates !== null && !loading && (
            <div className="mt-4 space-y-6">
              {successMessage && (
                <InlineMessage type="success" message={successMessage} />
              )}
              
              {/* Add / Edit Template Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  {templateForm.id ? t.messages.LABELS.EDIT_TEMPLATE : t.messages.LABELS.ADD_NEW_TEMPLATE}
                </h3>
                
                <form onSubmit={(e) => { e.preventDefault(); onSaveTemplate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dayOfWeek" className="text-sm font-medium">{t.messages.LABELS.DAY_OF_WEEK} {t.messages.LABELS.REQUIRED}</Label>
                      <select 
                        id="dayOfWeek"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={templateForm.dayOfWeek} 
                        onChange={e => setTemplateForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                      >
                        <option value="MONDAY">{t.messages.LABELS.DAY_MONDAY}</option>
                        <option value="TUESDAY">{t.messages.LABELS.DAY_TUESDAY}</option>
                        <option value="WEDNESDAY">{t.messages.LABELS.DAY_WEDNESDAY}</option>
                        <option value="THURSDAY">{t.messages.LABELS.DAY_THURSDAY}</option>
                        <option value="FRIDAY">{t.messages.LABELS.DAY_FRIDAY}</option>
                        <option value="SATURDAY">{t.messages.LABELS.DAY_SATURDAY}</option>
                        <option value="SUNDAY">{t.messages.LABELS.DAY_SUNDAY}</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="slotDuration" className="text-sm font-medium">{t.messages.LABELS.DURATION_MINUTES} {t.messages.LABELS.REQUIRED}</Label>
                      <Input 
                        id="slotDuration"
                        type="number" 
                        min={5} 
                        value={templateForm.slotDurationMinutes} 
                        onChange={e => setTemplateForm(f => ({ ...f, slotDurationMinutes: Number(e.target.value || 0) }))}
                        placeholder={t.messages.LABELS.PLACEHOLDER_DURATION}
                      />
                      {templateErrors.slotDurationMinutes && <div className="text-red-500 text-xs">{templateErrors.slotDurationMinutes}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-medium">{t.messages.LABELS.START_TIME} {t.messages.LABELS.REQUIRED}</Label>
                      <Input 
                        id="startTime"
                        type="time" 
                        value={templateForm.startTime} 
                        onChange={e => setTemplateForm(f => ({ ...f, startTime: e.target.value }))}
                      />
                      {templateErrors.startTime && <div className="text-red-500 text-xs">{templateErrors.startTime}</div>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium">{t.messages.LABELS.END_TIME} {t.messages.LABELS.REQUIRED}</Label>
                      <Input 
                        id="endTime"
                        type="time" 
                        value={templateForm.endTime} 
                        onChange={e => setTemplateForm(f => ({ ...f, endTime: e.target.value }))}
                      />
                      {templateErrors.endTime && <div className="text-red-500 text-xs">{templateErrors.endTime}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input 
                      id="tpl-active" 
                      type="checkbox" 
                      checked={templateForm.active} 
                      onChange={e => setTemplateForm(f => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="tpl-active" className="text-sm font-medium text-gray-700">{t.messages.LABELS.ACTIVE_TEMPLATE}</label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 items-stretch pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => resetTemplateForm()}
                      className="w-full h-10 text-sm"
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit"
                      className="w-full h-10 text-sm"
                    >
                      {templateForm.id 
                        ? t.messages.LABELS.EDIT_TEMPLATE
                        : t.messages.LABELS.ADD_NEW_TEMPLATE}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Existing Templates Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Existing Templates</h3>
                
                {slotTemplates.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    <div className="flex flex-col items-center gap-3">
                      <LayoutTemplate className="w-12 h-12 text-purple-400 bg-transparent" />
                      <p className="font-medium">No slot templates yet</p>
                      <p className="text-sm">Create a recurring availability template to let patients book predictable slots.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop & tablet: table view (md and up) */}
                    <div className="hidden md:block overflow-x-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-purple-50 border-b">
                            <th className="p-3 text-left font-semibold text-gray-700">Day</th>
                            <th className="p-3 text-left font-semibold text-gray-700">Start Time</th>
                            <th className="p-3 text-left font-semibold text-gray-700">End Time</th>
                            <th className="p-3 text-center font-semibold text-gray-700">{t.messages.LABELS.DURATION}</th>
                            <th className="p-3 text-right font-semibold text-gray-700">{t.messages.LABELS.ACTIONS}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slotTemplates.map(tpl => (
                            <tr key={tpl.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="p-3">
                                <span className="font-medium text-gray-900">{tpl.dayOfWeek}</span>
                              </td>
                              <td className="p-3 text-gray-600">{tpl.startTime}</td>
                              <td className="p-3 text-gray-600">{tpl.endTime}</td>
                              <td className="p-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {tpl.slotDurationMinutes} min
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-3 text-sm gap-1"
                                    title={t.messages.LABELS.EDIT_TEMPLATE_ACTION}
                                    aria-label={`Edit template ${tpl.id}`}
                                    onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>{t.messages.LABELS.EDIT}</span>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-10 px-3 text-sm gap-1"
                                    title={t.messages.LABELS.DELETE_TEMPLATE}
                                    aria-label={`Delete template ${tpl.id}`}
                                    onClick={() => handleDeleteTemplate(tpl.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{t.messages.LABELS.DELETE}</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile & small tablet: stacked cards (below md) */}
                    <div className="block md:hidden space-y-3">
                      {slotTemplates.map(tpl => (
                        <div key={`mobile-${tpl.id}`} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <LayoutTemplate className="w-4 h-4 text-purple-500 bg-transparent flex-shrink-0" />
                                <span className="font-semibold text-gray-900">{tpl.dayOfWeek}</span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Time:</span>
                                  <span>{tpl.startTime} – {tpl.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{t.messages.LABELS.DURATION}:</span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {tpl.slotDurationMinutes} min
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 w-24 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-10 gap-1 text-sm"
                                title={t.messages.LABELS.EDIT_TEMPLATE_ACTION}
                                aria-label={`Edit template ${tpl.id}`}
                                onClick={() => setTemplateForm({ id: tpl.id, dayOfWeek: tpl.dayOfWeek, startTime: tpl.startTime, endTime: tpl.endTime, slotDurationMinutes: tpl.slotDurationMinutes, active: true })}
                              >
                                <Edit className="w-4 h-4" />
                                <span>{t.messages.LABELS.EDIT}</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full h-10 gap-1 text-sm"
                                title={t.messages.LABELS.DELETE_TEMPLATE}
                                aria-label={`Delete template ${tpl.id}`}
                                onClick={() => handleDeleteTemplate(tpl.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>{t.messages.LABELS.DELETE}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for deleting templates */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete slot template"
        message={"Are you sure you want to delete this slot template? This action cannot be undone."}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => { void confirmDeleteTemplate(); }}
        onCancel={() => { setConfirmOpen(false); setConfirmTargetId(null); }}
      />
    </>
  );
}
