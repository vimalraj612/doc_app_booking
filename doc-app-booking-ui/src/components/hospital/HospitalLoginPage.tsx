import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { InlineMessage } from "../ui/inline-message";
import { Building2, ArrowRight, Check } from "lucide-react";
import { sendHospitalOtp, verifyHospitalOtp } from '../../api/auth';
import { AuthMessages } from "../../constants/messages";

export function HospitalLoginPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await sendHospitalOtp(mobile);
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await verifyHospitalOtp(mobile, otp);
      if (res && res.data) {
        const { token, role, userId, phoneNumber, message, name } = res.data;
        if (token) localStorage.setItem('accessToken', token);
        if (role) localStorage.setItem('role', role);
        if (userId) localStorage.setItem('userId', String(userId));
        if (phoneNumber) localStorage.setItem('hospitalPhoneNumber', phoneNumber);
        if (message) localStorage.setItem('loginMessage', message);
        if (name) localStorage.setItem('name', String(name));
        window.localStorage.setItem('hospitalLoggedIn', 'true');
        window.location.href = '/hospital/dashboard';
      } else {
        setError(AuthMessages.OTP_INVALID);
      }
    } catch (err) {
      setError(AuthMessages.OTP_INVALID);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
  <div className="hidden lg:flex lg:w-1/2 bg-purple-50 relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl text-gray-900">HealthCare</h1>
            </div>
            <p className="text-gray-600 ml-1">Your health, our priority</p>
          </div>
          <div className="space-y-8">
            <div>
              <div className="inline-flex p-4 bg-purple-500 rounded-2xl shadow-xl mb-6">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl mb-4 text-gray-900">Welcome Hospital</h2>
              <p className="text-lg text-gray-600">Manage your doctors and appointments</p>
            </div>
            <div className="space-y-3">
              {["Secure & Private", "Easy to Use", "24/7 Access"].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="p-1 bg-purple-500 rounded-full">
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
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl text-gray-900">HealthCare</h1>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl mb-2 text-gray-900">Hospital Sign In</h2>
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
                  className="w-full h-12 bg-purple-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-purple-500"
                  disabled={loading}
                >
                  {loading ? AuthMessages.SENDING_OTP : 'Send OTP as Hospital'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                    onChange={e => setOtp(e.target.value)}
                    required
                    className="h-12"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-purple-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-purple-500"
                  disabled={loading}
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP as Hospital'}
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
