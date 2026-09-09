import React from 'react';
import {
  Gamepad2,
  Gift,
  Receipt,
  Smartphone,
  Coins,
  CreditCard,
  Tv,
  Share2,
  Cpu,
} from 'lucide-react';

interface QuickServicesProps {
  onSelectCategory: (categoryId: number) => void;
}

export const QuickServices: React.FC<QuickServicesProps> = ({ onSelectCategory }) => {
  const items = [
    {
      id: 357,
      name: 'الألعاب عبر ID',
      icon: Gamepad2,
      color: '#8B45E8',
      bg: 'rgba(139, 69, 232, 0.15)',
    },
    {
      id: 392,
      name: 'كبينة السداد',
      icon: Receipt,
      color: '#F87171',
      bg: 'rgba(248, 113, 113, 0.15)',
    },
    {
      id: 365,
      name: 'بطاقات الألعاب',
      icon: Gift,
      color: '#34D399',
      bg: 'rgba(52, 211, 153, 0.15)',
    },
    {
      id: 17,
      name: 'التطبيقات',
      icon: Smartphone,
      color: '#22D3EE',
      bg: 'rgba(34, 211, 238, 0.15)',
    },
    {
      id: 381,
      name: 'اشتراكات شاشة',
      icon: Tv,
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.15)',
    },
    {
      id: 39,
      name: 'الرصيد والعملات',
      icon: Coins,
      color: '#C084FC',
      bg: 'rgba(192, 132, 252, 0.15)',
    },
    {
      id: 371,
      name: 'البطاقات الرقمية',
      icon: CreditCard,
      color: '#60A5FA',
      bg: 'rgba(96, 165, 250, 0.15)',
    },
    {
      id: 379,
      name: 'السوشيال ميديا',
      icon: Share2,
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.15)',
    },
    {
      id: 387,
      name: 'الذكاء الاصطناعي',
      icon: Cpu,
      color: '#A78BFA',
      bg: 'rgba(167, 139, 250, 0.15)',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#F4EFFA] flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#9B5CFF] rounded-full" />
          الخدمات السريعة
        </h2>
        <span className="text-xs text-[#A99DB7]">الأقسام الأكثر طلباً</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2.5">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1D1924] hover:bg-[#26202F] border border-white/5 hover:border-[#9B5CFF]/30 transition-all duration-200 group active:scale-95 text-center"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                <IconComponent size={22} />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#F4EFFA] group-hover:text-white line-clamp-1">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
