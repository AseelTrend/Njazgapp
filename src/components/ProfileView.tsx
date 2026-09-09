import React, { useState, useEffect } from 'react';
import { UserProfile, UserDevice } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import {
  User,
  Edit3,
  Moon,
  Sun,
  Bell,
  Globe,
  Clock,
  ShieldCheck,
  Smartphone,
  Monitor,
  Tablet,
  Lock,
  Unlock,
  ExternalLink,
  LogOut,
  RefreshCw,
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Save,
  MessageCircle,
  LogIn,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onOpenTopup: () => void;
  onOpenWallet: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  isLoggedIn = false,
  onOpenAuth,
  onUpdateUser,
  onOpenTopup,
  onOpenWallet,
  onLogout,
}) => {
  const [profile, setProfile] = useState<UserProfile>(user);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(isLoggedIn);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Settings states
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('ar');
  const [timezone, setTimezone] = useState<string>('3');

  // Edit Name Modal State
  const [isEditNameOpen, setIsEditNameOpen] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user.name || '');
  const [savingName, setSavingName] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Logout confirm modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Load profile and devices
  const loadData = async (isManualRefresh = false) => {
    // Load local settings first
    const storedDark = StorageService.getSetting('dark_mode', 'true');
    const storedPush = StorageService.getSetting('push_enabled', 'true');
    const storedLang = StorageService.getSetting('language', 'ar');
    const storedTz = StorageService.getSetting('timezone', '3');

    setDarkMode(storedDark !== 'false');
    setPushEnabled(storedPush !== 'false');
    setLanguage(storedLang);
    setTimezone(storedTz);

    if (!isLoggedIn) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [fetchedProfile, fetchedDevices] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getDevices(),
      ]);

      setProfile(fetchedProfile);
      setDevices(fetchedDevices);
      setNameInput(fetchedProfile.name);

      if (isManualRefresh) {
        showToast('تم تحديث بيانات الحساب والأجهزة بنجاح من السيرفر', 'success');
      }
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || 'تعذر جلب بيانات الحساب من السيرفر', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isLoggedIn]);

  const showToast = (text: string, type: 'success' | 'info' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // Settings Handlers
  const handleToggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    StorageService.saveSetting('dark_mode', String(val));
    showToast(val ? 'تم تفعيل الوضع الداكن' : 'تم تفعيل الوضع الفاتح', 'info');
  };

  const handleTogglePush = (val: boolean) => {
    setPushEnabled(val);
    StorageService.saveSetting('push_enabled', String(val));
    showToast(val ? 'تم تفعيل إشعارات التطبيق' : 'تم تعطيل إشعارات التطبيق', 'info');
  };

  const handleChangeLanguage = (val: string) => {
    setLanguage(val);
    StorageService.saveSetting('language', val);
    showToast(val === 'ar' ? 'تم اختيار اللغة العربية' : 'Language set to English', 'info');
  };

  const handleChangeTimezone = (val: string) => {
    setTimezone(val);
    StorageService.saveSetting('timezone', val);
    showToast('تم حفظ المنطقة الزمنية', 'info');
  };

  // Name Update Handler
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      setNameError('الاسم قصير جداً (أقل من حرفين)');
      return;
    }
    if (trimmed.length > 80) {
      setNameError('الاسم طويل جداً (الحد الأقصى 80 حرفاً)');
      return;
    }

    setSavingName(true);
    setNameError(null);
    try {
      const updatedName = await ApiService.updateProfileName(trimmed);
      const updatedUser = { ...profile, name: updatedName };
      setProfile(updatedUser);
      onUpdateUser(updatedUser);
      setIsEditNameOpen(false);
      showToast('تم تحديث اسم الحساب بنجاح', 'success');
    } catch (err: any) {
      setNameError(err.message || 'فشل تحديث الاسم');
    } finally {
      setSavingName(false);
    }
  };

  // Device Block/Unblock
  const handleToggleDevice = async (device: UserDevice) => {
    const isCurrentlyBlocked = device.status === 'blocked';
    const newStatus = isCurrentlyBlocked ? 'approved' : 'blocked';

    try {
      await ApiService.setDeviceBlocked(device.id, !isCurrentlyBlocked);
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? { ...d, status: newStatus } : d))
      );
      showToast(
        isCurrentlyBlocked ? `تم إلغاء حظر جهاز ${device.device_name || ''}` : `تم حظر جهاز ${device.device_name || ''}`,
        isCurrentlyBlocked ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err.message || 'تعذر تغيير حالة الجهاز', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#9B5CFF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#A99DB7]">جارِ تحميل بيانات الحساب والأجهزة المصرّحة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="text-[#9B5CFF]" size={20} />
            حسابي والملف الشخصي
          </h2>
          <p className="text-xs text-[#A99DB7]">إدارة الحساب، الأجهزة المتصلة، والإعدادات</p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="p-2 rounded-xl bg-[#1D1924] border border-white/5 text-[#A99DB7] hover:text-white transition active:scale-95 disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw size={17} className={refreshing ? 'animate-spin text-[#9B5CFF]' : ''} />
        </button>
      </div>

      {/* Floating Status Toast */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 transition animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
              : statusMessage.type === 'error'
              ? 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30'
              : 'bg-[#9B5CFF]/15 text-[#C084FC] border border-[#9B5CFF]/30'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <HelpCircle size={16} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. GUEST BANNER OR MAIN PROFILE CARD */}
      {!isLoggedIn ? (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1D1924] to-[#26202F] border border-white/10 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#9B5CFF]/15 text-[#9B5CFF] flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">تسجيل الدخول إلى حسابك الفعلي</h3>
            <p className="text-xs text-[#A99DB7] max-w-sm mx-auto mt-1 leading-relaxed">
              قم بتسجيل الدخول للوصول إلى رصيدك المتاح، وتعديل اسمك، وإدارة الأجهزة المصرّحة لحسابك على منصة نجاز كارد مباشرة.
            </p>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-xs shadow-lg shadow-[#8B45E8]/25 hover:opacity-95 transition active:scale-95 inline-flex items-center gap-2"
            >
              <LogIn size={15} />
              <span>تسجيل الدخول / فتح حسابي</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B45E8] via-[#6825B3] to-[#45127D] p-5 text-white shadow-xl shadow-[#8B45E8]/20 border border-white/10">
          {/* Background decorative watermark */}
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-b from-white/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/25 shadow-inner">
                <span className="text-xl font-black">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'ن'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{profile.name || 'مستخدم نجاز'}</h3>
                  <button
                    onClick={() => {
                      setNameInput(profile.name);
                      setNameError(null);
                      setIsEditNameOpen(true);
                    }}
                    className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition active:scale-95"
                    title="تعديل الاسم"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
                <p className="text-xs text-white/80 font-mono mt-0.5">
                  {profile.email || 'user@njaz.net'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-full font-mono text-white/90">
                    معرّف الحساب: {profile.uid || 'USR-9841'}
                  </span>
                  {profile.role && (
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      {profile.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Balance & Quick Wallet bar */}
          <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-white/75 block">الرصيد المتاح الحالي:</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black tracking-tight">{profile.balance ?? '0.00'}</span>
                <span className="text-xs font-semibold text-white/80">$ USD</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTopup}
                className="px-3.5 py-2 rounded-xl bg-white text-[#6825B3] font-bold text-xs shadow-md hover:bg-white/90 transition active:scale-95 flex items-center gap-1.5"
              >
                <CreditCard size={14} />
                <span>شحن رصيد</span>
              </button>

              <button
                onClick={onOpenWallet}
                className="px-3 py-2 rounded-xl bg-black/25 text-white hover:bg-black/35 font-semibold text-xs border border-white/20 transition active:scale-95 flex items-center gap-1.5"
              >
                <Wallet size={14} />
                <span>كشف الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SETTINGS SECTION */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#A99DB7] uppercase tracking-wider px-1">
          إعدادات التطبيق والتفضيلات
        </h4>
        <div className="bg-[#17131E] rounded-3xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#9B5CFF]/15 text-[#9B5CFF] flex items-center justify-center">
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">الوضع الليلي (الداكن)</span>
                <span className="text-[11px] text-[#A99DB7]">مظهر التطبيق الليلي المريح للعين</span>
              </div>
            </div>
            <button
              onClick={() => handleToggleDarkMode(!darkMode)}
              className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                darkMode ? 'bg-[#9B5CFF]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>

          {/* Push Notifications */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">إشعارات التطبيق</span>
                <span className="text-[11px] text-[#A99DB7]">تنبيهات اكتمال الطلبات وعمليات الشحن</span>
              </div>
            </div>
            <button
              onClick={() => handleTogglePush(!pushEnabled)}
              className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-1 ${
                pushEnabled ? 'bg-[#34D399]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  pushEnabled ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>

          {/* Language Selector */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">لغة الواجهة</span>
                <span className="text-[11px] text-[#A99DB7]">اختر لغة العرض الأساسية</span>
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => handleChangeLanguage(e.target.value)}
              className="bg-[#211C2B] text-xs font-bold text-[#F4EFFA] border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#9B5CFF]"
            >
              <option value="ar">العربية (Arabic)</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Timezone Selector */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">المنطقة الزمنية</span>
                <span className="text-[11px] text-[#A99DB7]">توقيت تسجيل الحركات وسجل الطلبات</span>
              </div>
            </div>

            <select
              value={timezone}
              onChange={(e) => handleChangeTimezone(e.target.value)}
              className="bg-[#211C2B] text-xs font-bold text-[#F4EFFA] border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#9B5CFF]"
            >
              <option value="3">UTC+3 (اليمن / السعودية)</option>
              <option value="2">UTC+2 (مصر / الشام)</option>
              <option value="4">UTC+4 (الإمارات)</option>
              <option value="0">UTC+0 (غرينتش)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. AUTHORIZED DEVICES SECTION (الأجهزة المصرّحة) */}
      {isLoggedIn && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-[#A99DB7] uppercase tracking-wider">
              الأجهزة المصرّحة والدخول
            </h4>
            <span className="text-[10px] text-[#A99DB7] bg-[#1D1924] px-2 py-0.5 rounded-full border border-white/5">
              {devices.length} أجهزة مسجلة
            </span>
          </div>

          <div className="bg-[#17131E] rounded-3xl border border-white/10 p-3 space-y-2.5">
            {devices.map((dev) => {
              const isBlocked = dev.status === 'blocked';
              const isFirst = dev.is_first_device === 1 || dev.is_first_device === '1' || dev.is_first_device === true;

              const DeviceIcon =
                dev.device_type === 'mobile'
                  ? Smartphone
                  : dev.device_type === 'tablet'
                  ? Tablet
                  : Monitor;

              return (
                <div
                  key={dev.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isBlocked
                      ? 'bg-[#221319] border-[#F87171]/25 opacity-75'
                      : 'bg-[#1D1924]/80 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isBlocked
                          ? 'bg-[#F87171]/20 text-[#F87171]'
                          : isFirst
                          ? 'bg-[#34D399]/20 text-[#34D399]'
                          : 'bg-[#9B5CFF]/20 text-[#9B5CFF]'
                      }`}
                    >
                      <DeviceIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#F4EFFA]">
                          {dev.device_name || `جهاز ${dev.device_type || 'مجهول'}`}
                        </span>
                        {isFirst && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-[#34D399]/20 text-[#34D399] px-2 py-0.5 rounded-full font-bold">
                            <ShieldCheck size={11} />
                            الجهاز الأساسي
                          </span>
                        )}
                        {isBlocked && (
                          <span className="text-[9px] bg-[#F87171]/20 text-[#F87171] px-2 py-0.5 rounded-full font-bold">
                            محظور
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#A99DB7] mt-0.5">
                        <span>{dev.browser || dev.os || 'تطبيق نجاز'}</span>
                        <span>•</span>
                        <span>آخر ظهور: {dev.last_seen || 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Action Button */}
                  <div>
                    {isFirst ? (
                      <div className="p-2 text-[#34D399]" title="الجهاز الأساسي موثق ومحمٍ دائماً">
                        <ShieldCheck size={18} />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleDevice(dev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                          isBlocked
                            ? 'bg-[#34D399]/15 text-[#34D399] hover:bg-[#34D399]/25 border border-[#34D399]/30'
                            : 'bg-[#F87171]/15 text-[#F87171] hover:bg-[#F87171]/25 border border-[#F87171]/30'
                        }`}
                        title={isBlocked ? 'إلغاء حظر هذا الجهاز' : 'حظر هذا الجهاز من الدخول'}
                      >
                        {isBlocked ? (
                          <>
                            <Unlock size={13} />
                            <span>فك الحظر</span>
                          </>
                        ) : (
                          <>
                            <Lock size={13} />
                            <span>حظر</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. INFORMATION & SUPPORT SECTION */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[#A99DB7] uppercase tracking-wider px-1">
          المعلومات والدعم الفني
        </h4>
        <div className="bg-[#17131E] rounded-3xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          {/* Privacy Policy */}
          <a
            href="https://njaz.net/page.php?slug=privacy"
            target="_blank"
            rel="noreferrer"
            className="p-4 flex items-center justify-between hover:bg-white/5 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">سياسة الخصوصية</span>
                <span className="text-[11px] text-[#A99DB7]">تعرّف على كيفية حماية بياناتك وأمان معاملاتك</span>
              </div>
            </div>
            <ExternalLink size={16} className="text-[#A99DB7] group-hover:text-white transition" />
          </a>

          {/* Support via WhatsApp */}
          <a
            href="https://wa.me/967775199244"
            target="_blank"
            rel="noreferrer"
            className="p-4 flex items-center justify-between hover:bg-white/5 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">الدعم الفني المباشر</span>
                <span className="text-[11px] text-[#A99DB7]">تواصل معنا على مدار الساعة عبر واتساب</span>
              </div>
            </div>
            <ExternalLink size={16} className="text-[#A99DB7] group-hover:text-white transition" />
          </a>

          {/* App Info / Version */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#9B5CFF]/15 text-[#9B5CFF] flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4EFFA] block">إصدار تطبيق نجاز كارد</span>
                <span className="text-[11px] text-[#A99DB7]">الإصدار 1.0.0 • مرتبطة بالسيرفر الحي njaz.net</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#34D399] bg-[#34D399]/15 px-2.5 py-1 rounded-full border border-[#34D399]/30">
              متصل
            </span>
          </div>
        </div>
      </div>

      {/* 5. LOGOUT BUTTON */}
      {isLoggedIn && (
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 rounded-2xl border border-[#F87171]/35 text-[#F87171] hover:bg-[#F87171]/10 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج من الحساب</span>
          </button>
        </div>
      )}

      {/* MODAL: EDIT NAME */}
      {isEditNameOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17131E] border border-white/10 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit3 size={16} className="text-[#9B5CFF]" />
                تعديل الاسم الكامل
              </h3>
              <button
                onClick={() => setIsEditNameOpen(false)}
                className="p-1 rounded-lg text-[#A99DB7] hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#F4EFFA] block mb-1.5">
                  الاسم المعروض في الحساب والطلبات:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={80}
                  autoFocus
                  required
                  placeholder="أدخل اسمك الكامل..."
                  className="w-full bg-[#111016] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6F637B] focus:outline-none focus:border-[#9B5CFF]"
                />
                <span className="text-[10px] text-[#A99DB7] block mt-1">
                  الحد الأقصى 80 حرفاً. يظهر هذا الاسم في إشعارات الشحن والفواتير.
                </span>
              </div>

              {nameError && (
                <div className="p-2.5 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 text-[#F87171] text-xs">
                  {nameError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A99DB7] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingName}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#8B45E8]/30 disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{savingName ? 'جارِ الحفظ...' : 'حفظ التعديل'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOGOUT CONFIRM */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17131E] border border-white/10 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-[#F87171]/15 text-[#F87171] flex items-center justify-center mx-auto">
              <LogOut size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-white">هل أنت متأكد من تسجيل الخروج؟</h3>
              <p className="text-xs text-[#A99DB7]">
                سيتعين عليك تسجيل الدخول مجدداً للوصول إلى محفظتك وسجل الطلبات.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A99DB7] hover:text-white"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#F87171] hover:bg-[#EF4444] text-white text-xs font-bold transition active:scale-95"
              >
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
