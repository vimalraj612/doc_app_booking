import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Stethoscope, ArrowRight, Check } from "lucide-react";
// TODO: Update the import path below if your api file is located elsewhere
import { sendDoctorOtp, verifyDoctorOtp } from '../../api/auth';
// If the file does not exist, create 'src/lib/api.ts' and export the required functions.

export function DoctorLoginPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Simulate OTP send/verify (replace with real API)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await sendDoctorOtp(mobile);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await verifyDoctorOtp(mobile, otp);
      if (res && res.data) {
        const { token, role, userId, phoneNumber, message, name } = res.data;
        if (token) localStorage.setItem('accessToken', token);
        if (role) localStorage.setItem('role', role);
        if (userId) localStorage.setItem('userId', String(userId));
        if (phoneNumber) localStorage.setItem('doctorPhoneNumber', phoneNumber);
        if (message) localStorage.setItem('loginMessage', message);
        if (name) localStorage.setItem('name', String(name));
        window.localStorage.setItem('doctorLoggedIn', 'true');
        window.location.href = '/doctor/dashboard';
      } else {
        setError('Invalid OTP.');
      }
    } catch (err) {
      setError('Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl text-gray-900">HealthCare</h1>
            </div>
            <p className="text-gray-600 ml-1">Your health, our priority</p>
          </div>
          <div className="space-y-8">
            <div>
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl mb-6">
                <Stethoscope className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl mb-4 text-gray-900">Welcome Doctor</h2>
              <p className="text-lg text-gray-600">Manage your appointments and patients</p>
            </div>
            <div className="space-y-3">
              {["Secure & Private", "Easy to Use", "24/7 Access"].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="p-1 bg-gradient-to-br from-green-500 to-blue-600 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">© 2025 HealthCare Portal. All rights reserved.</p>
        </div>
      </div>
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-stretch p-6 bg-white">
        <div className="w-full max-w-md mx-auto flex flex-col">
          <div className="flex-1 flex flex-col justify-start pt-8">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl text-gray-900">HealthCare</h1>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl mb-2 text-gray-900">Doctor Sign In</h2>
              <p className="text-gray-600">Enter your mobile number to receive an OTP</p>
            </div>
          </div>
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
                    onChange={e => setMobile(e.target.value)}
                    required
                    autoFocus
                    className="h-12"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP as Doctor'}
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
                    onChange={e => setOtp(e.target.value)}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP as Doctor'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  className="w-full mt-2 text-green-600 hover:underline text-sm"
                  onClick={() => { setStep('mobile'); setOtp(''); setError(""); setInfo(""); }}
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
