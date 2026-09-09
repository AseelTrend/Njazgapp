import React from 'react';
import { Home, Grid, PlusCircle, ShoppingBag, User } from 'lucide-react';

export type NavTab = 'home' | 'services' | 'topup' | 'orders' | 'wallet' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenTopup: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenTopup,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'الرئيسية', icon: Home },
    { id: 'services' as NavTab, label: 'الخدمات', icon: Grid },
    { id: 'topup' as NavTab, label: 'شحن رصيد', icon: PlusCircle, isCenter: true },
    { id: 'orders' as NavTab, label: 'طلباتي', icon: ShoppingBag },
    { id: 'profile' as NavTab, label: 'حسابي', icon: User },
  ];

  return (
    <nav aria-label="التنقل السفلي" className="fixed bottom-0 left-0 right-0 z-40 bg-[#17131E]/95 backdrop-blur-lg border-t border-white/10 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={onOpenTopup}
                className="flex flex-col items-center -mt-6 group active:scale-95 transition"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#9B5CFF] to-[#8B45E8] flex items-center justify-center text-white shadow-xl shadow-[#8B45E8]/40 ring-4 ring-[#17131E] group-hover:scale-105 transition">
                  <Icon size={26} className="stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-bold text-[#9B5CFF] mt-1">شحن</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-[#9B5CFF]'
                  : 'text-[#A99DB7] hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              <span
                className={`text-[10px] mt-1 font-semibold ${
                  isActive ? 'text-[#F4EFFA] font-bold' : 'text-[#6F637B]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
