import { useState } from "react";
import { PhoneInput } from "../ui/phone-input";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { InlineMessage } from "../ui/inline-message";
import { Building2, ArrowRight, Check } from "lucide-react";
import { sendHospitalOtp, verifyHospitalOtp } from '../../api/auth';
import { validateAndFormatPhone } from '../../utils/phoneUtils';
import { useLocale } from "../../contexts/LocaleContext";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

export function HospitalLoginPage() {
  const { t } = useLocale();
  
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
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
      const res = await sendHospitalOtp(phone);
      if (res.success) {
        setStep('otp');
        setInfo(t.messages.AUTH.OTP_SENT);
      } else {
        setError(t.messages.AUTH.OTP_SEND_FAILED);
      }
    } catch (err) {
      setError(t.messages.AUTH.OTP_SEND_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
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
      
      const res = await verifyHospitalOtp(phone, otp);
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
        setError(t.messages.AUTH.OTP_INVALID);
      }
    } catch (err) {
      setError(t.messages.AUTH.OTP_INVALID);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
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
              <h1 className="text-3xl text-gray-900">{t.auth.healthCare}</h1>
            </div>
            <p className="text-gray-600 ml-1">{t.auth.brandTagline}</p>
          </div>
          <div className="space-y-8">
            <div>
              <div className="inline-flex p-4 bg-purple-500 rounded-2xl shadow-xl mb-6">
                <Building2 className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl mb-4 text-gray-900">{t.auth.welcomeHospital}</h2>
              <p className="text-lg text-gray-600">{t.auth.hospitalTagline}</p>
            </div>
            <div className="space-y-3">
              {[t.auth.securePrivate, t.auth.easyToUse, t.auth.access24x7].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="p-1 bg-purple-500 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">{t.auth.copyrightText}</p>
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
              <h1 className="text-2xl text-gray-900">{t.auth.healthCare}</h1>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl mb-2 text-gray-900">{t.portals.hospitalSignIn}</h2>
              <p className="text-gray-600">{t.auth.enterMobileOTP}</p>
            </div>
          </div>
          <div className="pb-8">
            {step === 'mobile' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <PhoneInput
                  id="mobile"
                  label={t.auth.mobileNumber}
                  value={mobile}
                  onChange={(value) => { setMobile(value); setMobileError(null); }}
                  error={mobileError}
                  disabled={loading}
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="w-full h-12 bg-purple-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-purple-500"
                  disabled={loading}
                >
                  {loading ? t.auth.sendingOTP : t.auth.sendOTP}
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
                  <Label htmlFor="otp">{t.auth.enterOTP}</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t.auth.enterOTP}
                    value={otp}
                    onChange={e => { setOtp(e.target.value); setOtpError(null); }}
                    className="h-12"
                    disabled={loading}
                  />
                  {otpError && (
                    <p className="text-sm text-red-600 mt-1">{otpError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-purple-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group border border-purple-500"
                  disabled={loading}
                >
                  {loading ? t.auth.verifying : t.auth.verifyOTP}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  className="w-full mt-2 text-green-600 hover:underline text-sm"
                  onClick={() => { setStep('mobile'); setOtp(''); setError(""); setInfo(""); setOtpError(null); }}
                  disabled={loading}
                >
                  {t.common.changeMobileNumber}
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
