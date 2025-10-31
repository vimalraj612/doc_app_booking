import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { LogOut, Building2, Stethoscope, User as UserIcon, LayoutTemplate } from "lucide-react";
import { fetchSlotTemplatesByDoctorId, SlotTemplateDTO } from "../../api/doctor";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { fetchDoctorsByHospitalId } from "../../api/doctor";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  photo?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HospitalDashboardProps {
  user: User;
  doctors: Doctor[];
  onLogout: () => void;
  onAddDoctor: (doctor: Doctor) => void;
}

export function HospitalDashboard({ user, doctors: initialDoctors, onLogout, onAddDoctor }: HospitalDashboardProps) {
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctors, setDoctors] = useState(initialDoctors || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Slot template modal state
  const [slotTemplates, setSlotTemplates] = useState<SlotTemplateDTO[] | null>(null);
  const [slotTemplatesDoctor, setSlotTemplatesDoctor] = useState<string | null>(null);
  const [slotTemplatesLoading, setSlotTemplatesLoading] = useState(false);
  const [slotTemplatesError, setSlotTemplatesError] = useState("");
  const [lastClickedDoctor, setLastClickedDoctor] = useState<string | null>(null);
  const lastRequestAtRef = useRef<number | null>(null);

  // Defensive delegated listener: if React click isn't firing for any reason
  // attach a document-level listener that looks for our data attribute and
  // invokes the same handler. This ensures the interaction works even if
  // some overlay or CSS prevents React events from reaching the button.
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Element | null;
      if (!target) return;
      const btn = target.closest && (target.closest('[data-slot-button]') as HTMLElement | null);
      if (btn) {
        const id = btn.getAttribute('data-slot-doctor-id');
        if (id) {
          // prevent rapid double-invokes
          const now = Date.now();
          if (lastRequestAtRef.current && now - lastRequestAtRef.current < 400) return;
          lastRequestAtRef.current = now;
          // call the same handler
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          handleSlotTemplateClick(id);
        }
      }
    };
    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, []);

  const handleSlotTemplateClick = async (doctorId: string) => {
  // Immediate UI feedback to confirm click fired
  setLastClickedDoctor(doctorId);
  // Debug/log so developer can see the click in console
  // and confirm the API call is being made (network tab should show it).
  // Also track loading & errors to display in the UI.
  // eslint-disable-next-line no-console
  console.log('HospitalDashboard: fetching slot templates for doctor', doctorId);
    setSlotTemplatesLoading(true);
    setSlotTemplatesError("");
    setSlotTemplatesDoctor(doctorId);
    try {
      const data = await fetchSlotTemplatesByDoctorId(doctorId);
      // eslint-disable-next-line no-console
      console.log('HospitalDashboard: fetched slot templates', data);
      setSlotTemplates(data);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('HospitalDashboard: failed to fetch slot templates', e);
      setSlotTemplatesError(e?.message || "Failed to load slot templates");
      setSlotTemplates(null);
    } finally {
      setSlotTemplatesLoading(false);
    }
  };

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDoctorsByHospitalId(user.id);
        setDoctors(
          data.map((dto: any) => ({
            id: String(dto.id),
            name: dto.name,
            specialization: dto.specialization,
            email: dto.email,
            photo: dto.photo,
          }))
        );
      } catch (e) {
        setError("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) loadDoctors();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
    window.location.href = "/login/hospital";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            <h1 className="text-lg sm:text-xl font-semibold">
              Hospital Portal
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Debug toast to show last clicked doctor (helps verify click handler) */}
      {lastClickedDoctor && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded shadow flex items-center gap-3">
            <span className="text-sm">Fetching templates for doctor {lastClickedDoctor}…</span>
            <button className="text-white/80 hover:text-white" onClick={() => setLastClickedDoctor(null)} title="Dismiss">×</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-3 mt-4">
            {/* Add Doctor Button */}
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                onClick={() => setShowAddDoctor(true)}
              >
                + Add Doctor
              </button>
            </div>

            {/* Add Doctor Modal */}
            {showAddDoctor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl relative flex flex-col p-0 min-h-[600px] max-h-[95vh]">
                  <div className="flex justify-end p-2">
                    <button
                      className="text-gray-500 hover:text-gray-800 text-2xl"
                      onClick={() => setShowAddDoctor(false)}
                      title="Close"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="overflow-y-auto px-6 pb-6 max-h-[80vh] min-h-[400px]">
                    <AddDoctorFormInline
                      onAddDoctor={onAddDoctor}
                      onClose={() => setShowAddDoctor(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Doctor List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {loading && (
                <div className="text-gray-500 italic text-center py-2 text-xs col-span-full">
                  Loading doctors...
                </div>
              )}
              {error && (
                <div className="text-red-500 italic text-center py-2 text-xs col-span-full">
                  {error}
                </div>
              )}
              {doctors.length === 0 && !loading && (
                <div className="text-gray-500 italic text-center py-2 text-xs col-span-full">
                  No doctors found.
                </div>
              )}
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="shadow-md border border-blue-100 hover:shadow-lg transition"
                >
                  <CardContent className="p-4 flex flex-col items-center relative">
                    <button
                      type="button"
                      data-slot-button="true"
                      data-slot-doctor-id={doctor.id}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-blue-100 z-30"
                      title="View Slot Templates"
                      aria-label={`View slot templates for ${doctor.name}`}
                      onPointerDown={(e) => {
                        // prevent parent handlers from intercepting the pointer event
                        e.stopPropagation();
                        setLastClickedDoctor(doctor.id);
                      }}
                      onClick={(e) => {
                        // ensure the click is handled only by this button and still triggers our handler
                        e.stopPropagation();
                        e.preventDefault();
                         console.log("🟢 Doctor button clicked (React handler)", doctor.id);
                        void handleSlotTemplateClick(doctor.id);
                      }}
                    >
                      <LayoutTemplate className="w-5 h-5 text-blue-500" />
                    </button>
                    <Avatar className="w-16 h-16 mb-2">
                      {doctor.photo ? (
                        <AvatarImage src={doctor.photo} alt={doctor.name} />
                      ) : null}
                      <AvatarFallback>
                        <Stethoscope className="w-8 h-8 text-blue-500" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-lg text-gray-800">
                      {doctor.name}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {doctor.specialization}
                    </div>
                    <div className="text-xs text-gray-400">{doctor.email}</div>
                  </CardContent>
                </Card>
              ))}
              {/* Slot Templates Modal/Section */}
              {slotTemplatesLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] min-h-[120px] flex flex-col items-center">
                    <span className="text-blue-600 font-semibold">Loading slot templates...</span>
                  </div>
                </div>
              )}
              {slotTemplates !== null && !slotTemplatesLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] max-w-lg max-h-[80vh] overflow-y-auto relative">
                    <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setSlotTemplates(null)}>&times;</button>
                    <h2 className="text-lg font-bold mb-3 text-blue-700">Slot Templates</h2>
                    {slotTemplates.length === 0 ? (
                      <div className="text-gray-500 italic">No slot templates found.</div>
                    ) : (
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="p-2 border">Day</th>
                            <th className="p-2 border">Start</th>
                            <th className="p-2 border">End</th>
                            <th className="p-2 border">Duration (min)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slotTemplates.map(tpl => (
                            <tr key={tpl.id} className="border-b">
                              <td className="p-2 border">{tpl.dayOfWeek}</td>
                              <td className="p-2 border">{tpl.startTime}</td>
                              <td className="p-2 border">{tpl.endTime}</td>
                              <td className="p-2 border text-center">{tpl.slotDurationMinutes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
              {slotTemplatesError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] min-h-[120px] flex flex-col items-center">
                    <span className="text-red-600 font-semibold">{slotTemplatesError}</span>
                    <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSlotTemplatesError("")}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Inline Add Doctor Form component
function AddDoctorFormInline({ onAddDoctor, onClose }: { onAddDoctor: (doctor: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    specialization: "",
    department: "",
    experienceYears: "",
    qualifications: "",
    profileImageBase64: "",
    imageContentType: "",
    hospitalId: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        profileImageBase64: reader.result as string,
        imageContentType: file.type,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: any = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    else if (form.firstName.length > 100) errs.firstName = "Max 100 characters";
    else if (!/^[a-zA-Z\s\-.']+$/.test(form.firstName)) errs.firstName = "Invalid characters";

    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    else if (form.lastName.length > 100) errs.lastName = "Max 100 characters";
    else if (!/^[a-zA-Z\s\-.']+$/.test(form.lastName)) errs.lastName = "Invalid characters";

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email";
    else if (form.email.length > 200) errs.email = "Max 200 characters";

    if (!form.phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    else if (!/^[+]?[1-9]\d{1,14}$/.test(form.phoneNumber)) errs.phoneNumber = "Invalid phone number";
    else if (form.phoneNumber.length > 20) errs.phoneNumber = "Max 20 characters";

    if (!form.specialization.trim()) errs.specialization = "Specialization is required";
    else if (form.specialization.length > 200) errs.specialization = "Max 200 characters";
    else if (!/^[a-zA-Z\s\-.'&]+$/.test(form.specialization)) errs.specialization = "Invalid characters";

    if (form.department && (form.department.length > 200 || !/^$|^[a-zA-Z\s\-.'&]+$/.test(form.department))) errs.department = "Invalid department";

    if (form.experienceYears && (+form.experienceYears < 0 || +form.experienceYears > 70)) errs.experienceYears = "0-70 only";

    if (form.qualifications && form.qualifications.length > 1000) errs.qualifications = "Max 1000 characters";

    if (form.imageContentType && !/^$|^image\/(jpeg|jpg|png|gif|bmp|webp)$/.test(form.imageContentType)) errs.imageContentType = "Invalid image type";
    if (form.imageContentType && form.imageContentType.length > 100) errs.imageContentType = "Max 100 characters";

    if (!form.hospitalId.trim() || isNaN(Number(form.hospitalId)) || Number(form.hospitalId) <= 0) errs.hospitalId = "Valid hospital ID required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onAddDoctor({
        ...form,
        name: `${form.firstName} ${form.lastName}`,
      });
      setSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-4 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold mb-2">Add New Doctor</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
        <div>
          <label className="block font-medium">First Name *</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={100}
            required
          />
          {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
        </div>
        <div>
          <label className="block font-medium">Last Name *</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={100}
            required
          />
          {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
        </div>
        <div>
          <label className="block font-medium">Email *</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={200}
            required
            type="email"
          />
          {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
        </div>
        <div>
          <label className="block font-medium">Phone Number *</label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={20}
            required
          />
          {errors.phoneNumber && <div className="text-red-500 text-xs">{errors.phoneNumber}</div>}
        </div>
        <div>
          <label className="block font-medium">Specialization *</label>
          <input
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={200}
            required
          />
          {errors.specialization && <div className="text-red-500 text-xs">{errors.specialization}</div>}
        </div>
        <div>
          <label className="block font-medium">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={200}
          />
          {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
        </div>
        <div>
          <label className="block font-medium">Experience Years</label>
          <input
            name="experienceYears"
            value={form.experienceYears}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            type="number"
            min={0}
            max={70}
          />
          {errors.experienceYears && <div className="text-red-500 text-xs">{errors.experienceYears}</div>}
        </div>
        <div>
          <label className="block font-medium">Qualifications</label>
          <textarea
            name="qualifications"
            value={form.qualifications}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            maxLength={1000}
          />
          {errors.qualifications && <div className="text-red-500 text-xs">{errors.qualifications}</div>}
        </div>
        <div>
          <label className="block font-medium">Profile Image</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
            onChange={handleImage}
            className="form-input w-full"
          />
          {errors.profileImageBase64 && <div className="text-red-500 text-xs">{errors.profileImageBase64}</div>}
          {errors.imageContentType && <div className="text-red-500 text-xs">{errors.imageContentType}</div>}
        </div>
        <div>
          <label className="block font-medium">Hospital ID *</label>
          <input
            name="hospitalId"
            value={form.hospitalId}
            onChange={handleChange}
            className="form-input w-full border rounded px-3 py-2"
            required
            type="number"
            min={1}
          />
          {errors.hospitalId && <div className="text-red-500 text-xs">{errors.hospitalId}</div>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Doctor"}
        </button>
      </div>
    </form>
  );
}