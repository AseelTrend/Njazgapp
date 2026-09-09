import React, { useState } from 'react';
import { ApiService, ApiException } from '../services/api';
import { UserProfile } from '../types';
import {
  X,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Gift,
  ShieldCheck,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccessAuth: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccessAuth }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState<string>('asiel547@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');
  const [requireTotp, setRequireTotp] = useState<boolean>(false);

  // Register form
  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regFullName, setRegFullName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPassword2, setRegPassword2] = useState<string>('');
  const [regReferral, setRegReferral] = useState<string>('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور الحقيقية لحسابك');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ApiService.login({
        login: loginIdentifier.trim(),
        password: loginPassword,
        totpCode: totpCode.trim() || undefined,
      });

      if (res.need_2fa || res.require_2fa) {
        setRequireTotp(true);
        setLoading(false);
        return;
      }

      onSuccessAuth(res.user);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiException) {
        if (err.data?.need_2fa) {
          setRequireTotp(true);
        }
        if (err.data?.device_pending) {
          setError(`${err.message}\nيرجى مراجعة بريدك الإلكتروني أو رسائل واتساب لتفعيل هذا الجهاز.`);
        } else {
          setError(err.message);
        }
      } else {
        setError('تعذر الاتصال بالسيرفر، تحقق من الإنترنت');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('يرجى تعبئة الحقول الأساسية: اسم المستخدم، البريد، كلمة المرور');
      return;
    }
    if (regPassword !== regPassword2) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ApiService.register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        fullName: regFullName.trim() || undefined,
        phone: regPhone.trim() || undefined,
        password: regPassword,
        password2: regPassword2,
        referralCode: regReferral.trim() || undefined,
      });

      onSuccessAuth(res.user);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError('فشل إنشاء الحساب، يرجى مراجعة البيانات المدخلة');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1D1924] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#17131E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B14BFF] to-[#6825B3] flex items-center justify-center text-white font-black text-sm">
              نجاز
            </div>
            <span className="font-bold text-sm text-[#F4EFFA]">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-[#26202F] text-[#A99DB7] hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
              <AlertCircle size={17} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">
                  اسم المستخدم أو البريد الإلكتروني:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="example@njaz.net أو اسم المستخدم"
                    className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2.5 pr-10 pl-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#9B5CFF]"
                  />
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F637B]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">كلمة المرور:</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2.5 pr-10 pl-10 text-xs sm:text-sm text-white focus:outline-none focus:border-[#9B5CFF]"
                  />
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F637B]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F637B] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {requireTotp && (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-[#22D3EE] block">
                    رمز التحقق بخطوتين (2FA):
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="000000"
                    className="w-full text-center tracking-widest font-mono text-base font-bold bg-[#17131E] border border-[#22D3EE]/40 rounded-xl py-2 text-white focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-sm shadow-xl shadow-[#8B45E8]/30 flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                <span>تسجيل الدخول</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-xs text-[#A99DB7] hover:text-[#9B5CFF] transition"
                >
                  ليس لديك حساب بعد؟ <strong className="text-[#9B5CFF]">إنشاء حساب جديد</strong>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">اسم المستخدم:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="أدخل اسم مستخدم فريد"
                    className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                  />
                  <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F637B]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">البريد الإلكتروني:</label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 pr-9 pl-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                  />
                  <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F637B]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-[#A99DB7] block">الاسم الكامل:</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="اسمك الكامل"
                    className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#A99DB7] block">رقم الهاتف:</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="77XXXXXXX"
                    className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">كلمة المرور:</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">تأكيد كلمة المرور:</label>
                <input
                  type="password"
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#A99DB7] flex items-center gap-1">
                  <Gift size={13} className="text-[#FBBF24]" />
                  <span>كود الإحالة (اختياري):</span>
                </label>
                <input
                  type="text"
                  value={regReferral}
                  onChange={(e) => setRegReferral(e.target.value)}
                  placeholder="أدخل كود الصديق إن وجد"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#9B5CFF]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-sm shadow-xl shadow-[#8B45E8]/30 flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                <span>إنشاء الحساب</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-xs text-[#A99DB7] hover:text-[#9B5CFF] transition"
                >
                  لديك حساب بالفعل؟ <strong className="text-[#9B5CFF]">تسجيل الدخول</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
