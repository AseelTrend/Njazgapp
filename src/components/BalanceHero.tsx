import React, { useState } from 'react';
import { Eye, EyeOff, Plus, CreditCard, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';

interface BalanceHeroProps {
  balance: string | number;
  currencySymbol?: string;
  onOpenTopup: (tab?: 'manual' | 'direct' | 'card' | 'sms') => void;
  onOpenOrders: () => void;
}

export const BalanceHero: React.FC<BalanceHeroProps> = ({
  balance,
  currencySymbol = 'دولار',
  onOpenTopup,
  onOpenOrders,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const formattedBalance = typeof balance === 'number' ? balance.toFixed(2) : balance;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#B14BFF] via-[#8B45E8] to-[#5B2A9D] p-6 text-white shadow-xl shadow-[#8B45E8]/20 border border-white/15">
      {/* Background ambient watermarks */}
      <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-4 -top-8 text-[120px] font-black text-white/[0.04] select-none pointer-events-none leading-none">
        نجاز
      </div>

      <div className="relative z-10">
        {/* Top bar inside card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80 font-medium">الرصيد المتاح بالمحفظة</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white/70 hover:text-white transition p-1"
              aria-label={showBalance ? 'إخفاء الرصيد' : 'إظهار الرصيد'}
            >
              {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 text-white/90 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <ShieldCheck size={13} className="text-[#34D399]" />
            <span>حساب موثق</span>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-3 flex items-baseline gap-2">
          {showBalance ? (
            <>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                ${formattedBalance}
              </span>
              <span className="text-sm font-semibold text-white/75">USD</span>
            </>
          ) : (
            <span className="text-3xl font-extrabold tracking-widest text-white/80">
              ••••••••
            </span>
          )}
        </div>

        {/* Quick action buttons row */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onOpenTopup('manual')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white text-[#5B2A9D] font-bold text-xs shadow-md hover:bg-white/95 transition active:scale-95"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>شحن المحفظة</span>
          </button>

          <button
            onClick={() => onOpenTopup('direct')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/15 backdrop-blur-md text-white font-semibold text-xs hover:bg-white/20 transition active:scale-95 border border-white/15"
          >
            <Zap size={15} className="text-[#22D3EE]" />
            <span>إيداع فوري USDT</span>
          </button>

          <button
            onClick={() => onOpenTopup('card')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/15 backdrop-blur-md text-white font-semibold text-xs hover:bg-white/20 transition active:scale-95 border border-white/15"
          >
            <CreditCard size={15} className="text-[#FBBF24]" />
            <span>كود بطاقة</span>
          </button>

          <button
            onClick={onOpenOrders}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/15 backdrop-blur-md text-white font-semibold text-xs hover:bg-white/20 transition active:scale-95 border border-white/15"
          >
            <ArrowUpRight size={15} className="text-white/80" />
            <span>سجل الطلبات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
