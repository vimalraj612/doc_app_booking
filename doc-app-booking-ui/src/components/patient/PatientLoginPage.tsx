import { useState } from "react";
import { sendPatientOtp, verifyPatientOtp } from '../../api';
import { UserRole } from "../../App";
import { PhoneInput } from "../ui/phone-input";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { InlineMessage } from "../ui/inline-message";
import { AuthMessages } from "../../constants/messages";
import { 
  validateAndFormatPhone, 
  removeCountryCode, 
  sanitizePhoneInput 
} from '../../utils/phoneUtils';
import {
  User,
  Stethoscope,
  Building2,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

interface PatientLoginPage {
  onLogin: (
    email: string,
    password: string,
    role: UserRole,
  ) => void;
}

export function LoginPage({ onLogin }: PatientLoginPage) {
  // Use docPhoneNumber from URL path or localStorage if present
  // Get patient phone from path (for login input)
  const getPatientPhoneFromPath = () => {
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split('/');
    const last = pathParts[pathParts.length - 1];
    if (/^\d{10,}$/.test(last)) {
      return last;
    }
    return '';
  };

  // Get doctor phone from query param (for doctor info)
  const getDocPhoneFromQuery = () => {
    const url = new URL(window.location.href);
    let docPhone = url.searchParams.get('docPhoneNumber');
    if (docPhone) {
      // Add +91 prefix if not present
      if (!docPhone.startsWith('+')) {
        docPhone = '+91' + docPhone;
      }
      // Store doctor's phone separately for appointment booking
      localStorage.setItem('docPhoneNumber', docPhone);
    }
    return docPhone;
  };

  // Set login input to patient phone from path
  const [mobile, setMobile] = useState(() => {
    const patientPhone = getPatientPhoneFromPath();
    if (patientPhone) {
      // Remove any country code and keep only 10 digits
      return removeCountryCode(patientPhone);
    }
    return '';
  });

  // On mount, store doctor phone from query param if present
  useState(() => {
    getDocPhoneFromQuery();
    return undefined;
  });

  // Handle mobile number change
  const handleMobileChange = (value: string) => {
    setMobile(value);
    setMobileError(null);
  };
  const [otp, setOtp] = useState("");
  // Only allow patient role for now
  const [activeRole] = useState<UserRole>("patient");
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Step 1: Send OTP (Patient)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    setMobileError(null);
    
    // Validate and format mobile number using utility
    const validation = validateAndFormatPhone(mobile);
    
    if (!validation.isValid) {
      setMobileError(validation.error || 'Invalid phone number');
      setLoading(false);
      return;
    }
    
    try {
      const phone = validation.formattedPhone;
      localStorage.setItem('patientPhoneNumber', phone);
      const res = await sendPatientOtp(phone);
      if (res.success) {
        setStep('otp');
        setInfo(AuthMessages.OTP_SENT);
      } else {
        setError(AuthMessages.OTP_SEND_FAILED);
      }
    } catch (err) {
      setError(AuthMessages.OTP_SEND_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (Patient)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    setOtpError(null);
    
    // Validate OTP
    if (!otp || otp.trim() === '') {
      setOtpError('OTP is required');
      setLoading(false);
      return;
    }
    
    if (otp.length < 4) {
      setOtpError('Please enter a valid OTP');
      setLoading(false);
      return;
    }
    
    try {
      // Format phone with country code for verification
      const validation = validateAndFormatPhone(mobile);
      const phone = validation.formattedPhone;
      
      const res = await verifyPatientOtp(phone, otp);
      if (res && res.data) {
        const { token, role, userId, phoneNumber, message, name } = res.data;
        if (token) localStorage.setItem('accessToken', token);
        if (role) localStorage.setItem('role', role);
        if (userId) localStorage.setItem('userId', String(userId));
        if (phoneNumber) localStorage.setItem('phoneNumber', phoneNumber);
        if (message) localStorage.setItem('loginMessage', message);
        if (name) localStorage.setItem('name', String(name));
      }
      // You may want to pass token/user to parent here
      onLogin(phone, '', activeRole); // password is empty, not used
    } catch (err) {
      setError(AuthMessages.OTP_INVALID);
    } finally {
      setLoading(false);
    }
  };

  // Only patient config for now
  const activeConfig = {
    value: "patient" as UserRole,
    label: "Patient",
    icon: User,
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-cyan-50",
    description: "Book appointments and manage your health",
  };
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <div
        className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${activeConfig.bgGradient} relative overflow-hidden transition-all duration-500`}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-3 bg-gradient-to-br ${activeConfig.gradient} rounded-xl shadow-lg`}
              >
                <Stethoscope className="w-8 h-8 text-white bg-transparent" />
              </div>
              <h1 className="text-3xl text-gray-900">
                HealthCare
              </h1>
            </div>
            <p className="text-gray-600 ml-1">
              Your health, our priority
            </p>
          </div>

          {/* Center Content */}
          <div className="space-y-8">
            <div>
              <div
                className={`inline-flex p-4 bg-gradient-to-br ${activeConfig.gradient} rounded-2xl shadow-xl mb-6`}
              >
                <ActiveIcon className="w-16 h-16 text-white bg-transparent" />
              </div>
              <h2 className="text-4xl mb-4 text-gray-900">
                Welcome {activeConfig.label}
              </h2>
              <p className="text-lg text-gray-600">
                {activeConfig.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                "Secure & Private",
                "Easy to Use",
                "24/7 Access",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`p-1 bg-gradient-to-br ${activeConfig.gradient} rounded-full`}
                  >
                    <Check className="w-4 h-4 text-white bg-transparent" />
                  </div>
                  <span className="text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500">
            © 2025 HealthCare Portal. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-stretch p-6 bg-white">
        <div className="w-full max-w-md mx-auto flex flex-col">
          {/* Top Section - Title, Description */}
          <div className="flex-1 flex flex-col justify-start pt-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div
                className={`p-3 bg-gradient-to-br ${activeConfig.gradient} rounded-xl shadow-lg`}
              >
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl text-gray-900">
                HealthCare
              </h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl mb-2 text-gray-900">
                Patient Sign In
              </h2>
              <p className="text-gray-600">
                Enter your mobile number to receive an OTP
              </p>
            </div>
          </div>

          {/* Bottom Section - OTP Login Form */}
          <div className="pb-8">
            {step === 'mobile' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <PhoneInput
                  id="mobile"
                  label="Mobile Number"
                  value={mobile}
                  onChange={handleMobileChange}
                  error={mobileError}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  className={`w-full h-12 bg-gradient-to-r ${activeConfig.gradient} text-white rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group`}
                  disabled={loading}
                >
                  {loading ? AuthMessages.SENDING_OTP : `Send OTP as ${activeConfig.label}`}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform bg-transparent" />
                </button>
                {error && (
                  <InlineMessage type="error" message={error} className="mt-4" />
                )}
                {info && (
                  <InlineMessage type="success" message={info} className="mt-4" />
                )}
              </form>
            )}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the OTP sent to your mobile"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setOtpError(null); }}
                    className="h-12"
                    disabled={loading}
                  />
                  {otpError && (
                    <p className="text-sm text-red-600 mt-1">{otpError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className={`w-full h-12 bg-gradient-to-r ${activeConfig.gradient} text-white rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group`}
                  disabled={loading}
                >
                  {loading ? AuthMessages.VERIFYING_OTP : `Verify OTP as ${activeConfig.label}`}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform bg-transparent" />
                </button>
                <button
                  type="button"
                  className="w-full mt-2 text-blue-600 hover:underline text-sm"
                  onClick={() => { setStep('mobile'); setOtp(''); setError(null); setInfo(null); setOtpError(null); }}
                  disabled={loading}
                >
                  Change mobile number
                </button>
                {error && (
                  <InlineMessage type="error" message={error} className="mt-4" />
                )}
                {info && (
                  <InlineMessage type="success" message={info} className="mt-4" />
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}