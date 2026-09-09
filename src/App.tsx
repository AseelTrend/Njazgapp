import React, { useState, useEffect } from 'react';
import { UserProfile, ServiceItem } from './types';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import { Header } from './components/Header';
import { BalanceHero } from './components/BalanceHero';
import { PromoBanner } from './components/PromoBanner';
import { QuickServices } from './components/QuickServices';
import { CategoryBrowser } from './components/CategoryBrowser';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { OrdersView } from './components/OrdersView';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { TopupModal } from './components/TopupModal';
import { AuthModal } from './components/AuthModal';
import { BottomNav, NavTab } from './components/BottomNav';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(StorageService.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(StorageService.isLoggedIn());
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Modals
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isTopupOpen, setIsTopupOpen] = useState<boolean>(false);
  const [topupTab, setTopupTab] = useState<'manual' | 'direct' | 'card' | 'sms'>('manual');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Notifications
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (StorageService.isLoggedIn()) {
      ApiService.getProfile()
        .then((p) => {
          setUser(p);
          setIsLoggedIn(true);
        })
        .catch((err) => {
          console.warn('Initial profile sync:', err);
          if (err?.message === 'يجب تسجيل الدخول') {
            StorageService.deleteToken();
            setIsLoggedIn(false);
          }
        });
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshUser = () => {
    const updated = StorageService.getUser();
    setUser(updated);
    setIsLoggedIn(StorageService.isLoggedIn());
    if (StorageService.isLoggedIn()) {
      ApiService.getProfile().then(setUser).catch(console.error);
    }
  };

  const handleOpenTopup = (tab: 'manual' | 'direct' | 'card' | 'sms' = 'manual') => {
    setTopupTab(tab);
    setIsTopupOpen(true);
  };

  const handleSelectQuickCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setCurrentTab('services');
  };

  const handleLogout = async () => {
    await ApiService.logout();
    StorageService.deleteToken();
    setIsLoggedIn(false);
    refreshUser();
    showToast('تم تسجيل الخروج بنجاح');
  };

  const handleSuccessAuth = (u: UserProfile) => {
    setUser(u);
    setIsLoggedIn(true);
    ApiService.getProfile().then(setUser).catch(console.error);
    showToast(`مرحباً بك مجدداً، ${u.name || 'عميل نجاز'}`);
  };

  const handleOrderSuccess = (orderRes: any) => {
    refreshUser();
    showToast('تم تنفيذ طلبك بنجاح وسحب القيمة من رصيدك');
  };

  const handleTopupSuccess = () => {
    refreshUser();
    showToast('تم تحديث رصيد محفظتك بنجاح');
  };

  return (
    <div className="min-h-screen bg-[#111016] text-[#F4EFFA] flex flex-col pb-24 selection:bg-[#9B5CFF] selection:text-white">
      {/* Top Bar Header */}
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenTopup={() => handleOpenTopup('manual')}
        onOpenProfile={() => setCurrentTab('profile')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#34D399] text-[#111016] px-4 py-2 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <Sparkles size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* TAB 1: HOME TAB */}
        {currentTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Balance Hero Card */}
            <BalanceHero
              balance={user.balance}
              onOpenTopup={handleOpenTopup}
              onOpenOrders={() => setCurrentTab('orders')}
            />

            {/* Network Cards Promo Banner */}
            <PromoBanner
              onExplore={() => {
                setSelectedCategoryId(null);
                setCurrentTab('services');
              }}
            />

            {/* Quick 9-Services Grid */}
            <QuickServices onSelectCategory={handleSelectQuickCategory} />

            {/* Highlights Section */}
            <div className="p-4 rounded-3xl bg-[#1D1924] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[#FBBF24]" />
                  <h3 className="text-sm font-bold text-[#F4EFFA]">ميزات منصة نجاز كارد</h3>
                </div>
                <span className="text-[11px] text-[#A99DB7]">خدمة 24/7</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#A99DB7]">
                <div className="flex items-center gap-2 bg-[#17131E] p-2.5 rounded-xl border border-white/5">
                  <ShieldCheck size={16} className="text-[#34D399] shrink-0" />
                  <span>تنفيذ آلي وفوري للطلبات</span>
                </div>
                <div className="flex items-center gap-2 bg-[#17131E] p-2.5 rounded-xl border border-white/5">
                  <ShieldCheck size={16} className="text-[#22D3EE] shrink-0" />
                  <span>دعم العملات المحلية والرقمية</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES TAB */}
        {currentTab === 'services' && (
          <div className="animate-fadeIn">
            <CategoryBrowser
              initialCategoryId={selectedCategoryId}
              onSelectService={(service) => setSelectedService(service)}
              onClearInitialCategory={() => setSelectedCategoryId(null)}
            />
          </div>
        )}

        {/* TAB 3: ORDERS TAB */}
        {currentTab === 'orders' && (
          <div className="animate-fadeIn">
            <OrdersView
              isLoggedIn={isLoggedIn}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: PROFILE TAB */}
        {currentTab === 'profile' && (
          <div className="animate-fadeIn">
            <ProfileView
              user={user}
              isLoggedIn={isLoggedIn}
              onOpenAuth={() => setIsAuthOpen(true)}
              onUpdateUser={(updated) => {
                const newUser = { ...user, ...updated };
                setUser(newUser);
                StorageService.saveUser(newUser);
              }}
              onOpenTopup={() => handleOpenTopup('manual')}
              onOpenWallet={() => setCurrentTab('wallet')}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* TAB 5: WALLET TAB */}
        {currentTab === 'wallet' && (
          <div className="animate-fadeIn">
            <WalletView
              user={user}
              isLoggedIn={isLoggedIn}
              onOpenTopup={handleOpenTopup}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'topup') {
            handleOpenTopup('manual');
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenTopup={() => handleOpenTopup('manual')}
      />

      {/* MODAL 1: Service Detail & Order Placement */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          user={user}
          onClose={() => setSelectedService(null)}
          onSuccessOrder={handleOrderSuccess}
          onOpenTopup={() => {
            setSelectedService(null);
            handleOpenTopup('manual');
          }}
        />
      )}

      {/* MODAL 2: Topup (Manual, Direct USDT/Binance, Card Code, SMS) */}
      {isTopupOpen && (
        <TopupModal
          initialTab={topupTab}
          onClose={() => setIsTopupOpen(false)}
          onSuccess={handleTopupSuccess}
        />
      )}

      {/* MODAL 3: Auth (Login & Register) */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccessAuth={handleSuccessAuth}
        />
      )}
    </div>
  );
};
