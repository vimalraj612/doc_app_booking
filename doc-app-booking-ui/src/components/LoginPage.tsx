import { useState } from "react";
import { sendPatientOtp, verifyPatientOtp } from '../api';
import { UserRole } from "../App";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  User,
  Stethoscope,
  Building2,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

// Example: How to use the new login API
// import { login } from '../api';
//
// async function handleLogin(email: string, password: string) {
//   try {
//     const result = await login(email, password);
//     // result.token, result.user
//   } catch (e) {
//     // handle error
//   }
// }

interface LoginPageProps {
  onLogin: (
    email: string,
    password: string,
    role: UserRole,
  ) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
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
      if (!docPhone.startsWith('+')) docPhone = '+' + docPhone;
      localStorage.setItem('docPhoneNumber', docPhone);
    }
    return docPhone;
  };

  // Set login input to patient phone from path
  const [mobile, setMobile] = useState(() => {
    const patientPhone = getPatientPhoneFromPath();
    if (patientPhone) {
      return patientPhone.startsWith('+') ? patientPhone : '+' + patientPhone;
    }
    return '';
  });

  // On mount, store doctor phone from query param if present
  useState(() => {
    getDocPhoneFromQuery();
    return undefined;
  });

  // Keep localStorage in sync if user edits the input
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setMobile(value);
    localStorage.setItem('docPhoneNumber', value);
  };
  const [otp, setOtp] = useState("");
  // Only allow patient role for now
  const [activeRole] = useState<UserRole>("patient");
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Step 1: Send OTP (Patient)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      let phone = mobile;
      if (!phone.startsWith('+')) phone = '+' + phone;
      setMobile(phone); // update state if user entered without +
      localStorage.setItem('docPhoneNumber', phone);
      const res = await sendPatientOtp(phone);
      if (res.success) {
        setStep('otp');
        setInfo('OTP sent to your mobile number.');
      } else {
        setError('Failed to send OTP.');
      }
    } catch (err) {
      setError('Failed to send OTP.');
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
    try {
      const res = await verifyPatientOtp(mobile, otp);
      if (res && res.data) {
        const { token, role, userId, phoneNumber, message } = res.data;
        if (token) localStorage.setItem('accessToken', token);
        if (role) localStorage.setItem('role', role);
        if (userId) localStorage.setItem('userId', String(userId));
        if (phoneNumber) localStorage.setItem('phoneNumber', phoneNumber);
        if (message) localStorage.setItem('loginMessage', message);
      }
      // You may want to pass token/user to parent here
      onLogin(mobile, '', activeRole); // password is empty, not used
    } catch (err) {
      setError('Invalid OTP.');
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
                <Stethoscope className="w-8 h-8 text-white" />
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
                <ActiveIcon className="w-16 h-16 text-white" />
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
                    <Check className="w-4 h-4 text-white" />
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
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={handleMobileChange}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full h-12 bg-gradient-to-r ${activeConfig.gradient} text-white rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group`}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : `Send OTP as ${activeConfig.label}`}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                {info && <div className="text-green-600 text-sm text-center">{info}</div>}
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
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full h-12 bg-gradient-to-r ${activeConfig.gradient} text-white rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group`}
                  disabled={loading}
                >
                  {loading ? 'Verifying OTP...' : `Verify OTP as ${activeConfig.label}`}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  className="w-full mt-2 text-blue-600 hover:underline text-sm"
                  onClick={() => { setStep('mobile'); setOtp(''); setError(null); setInfo(null); }}
                  disabled={loading}
                >
                  Change mobile number
                </button>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                {info && <div className="text-green-600 text-sm text-center">{info}</div>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}