import React from 'react';
import { UserProfile } from '../types';
import { MessageCircle, Bell, Sparkles, LogOut, LogIn } from 'lucide-react';
import { StorageService } from '../services/storage';

interface HeaderProps {
  user: UserProfile;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenTopup: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoggedIn,
  onOpenAuth,
  onLogout,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#111016]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Right side in RTL: Brand & User Greeting */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-3 text-right hover:opacity-90 transition active:scale-98"
          title="فتح حسابي والملف الشخصي"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B14BFF] to-[#6825B3] flex items-center justify-center shadow-lg shadow-[#8B45E8]/20 ring-1 ring-white/10">
            <span className="text-white font-black text-lg tracking-wider">نجاز</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#F4EFFA]">
                {isLoggedIn && user.name ? `مرحباً، ${user.name}` : 'نجاز كارد'}
              </span>
            </div>
            <p className="text-xs text-[#A99DB7]">
              {isLoggedIn && user.uid ? `معرّف الحساب: ${user.uid}` : 'خدمات الشحن والبطاقات الرقمية'}
            </p>
          </div>
        </button>

        {/* Left side in RTL: Actions */}
        <div className="flex items-center gap-2">
          {/* Support button */}
          <a
            href="https://wa.me/967775199244"
            target="_blank"
            rel="noreferrer"
            aria-label="تواصل مع الدعم الفني عبر واتساب"
            className="w-9 h-9 rounded-xl bg-[#1D1924] border border-white/5 flex items-center justify-center text-[#22D3EE] hover:bg-[#26202F] transition active:scale-95"
            title="الدعم الفني عبر واتساب"
          >
            <MessageCircle size={18} />
          </a>

          {/* Notification / Promo alert */}
          <button
            aria-label="الإشعارات"
            className="w-9 h-9 rounded-xl bg-[#1D1924] border border-white/5 flex items-center justify-center text-[#A99DB7] hover:text-[#F4EFFA] hover:bg-[#26202F] transition active:scale-95 relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#34D399]" />
          </button>

          {/* Login / Logout Button */}
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              aria-label="تسجيل الخروج"
              className="px-3 py-1.5 rounded-xl bg-[#26202F] text-[#F87171] hover:bg-[#F87171]/10 text-xs font-semibold flex items-center gap-1.5 transition border border-white/5 active:scale-95"
              title="تسجيل الخروج"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#8B45E8]/25 hover:opacity-95 transition active:scale-95"
            >
              <LogIn size={14} />
              <span>دخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
