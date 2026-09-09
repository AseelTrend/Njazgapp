import React, { useState, useEffect } from 'react';
import { UserProfile, WalletTransaction } from '../types';
import { ApiService, ApiException } from '../services/api';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Clock,
  LogIn,
} from 'lucide-react';

interface WalletViewProps {
  user: UserProfile;
  isLoggedIn?: boolean;
  onOpenTopup: (tab?: 'manual' | 'direct' | 'card' | 'sms') => void;
  onOpenAuth?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  isLoggedIn = false,
  onOpenTopup,
  onOpenAuth,
}) => {
  const [walletData, setWalletData] = useState<{
    balance: string | number;
    currency_symbol?: string;
    total_credit: string | number;
    total_debit: string | number;
    transactions: WalletTransaction[];
  }>({
    balance: user.balance,
    currency_symbol: '$',
    total_credit: '0.00',
    total_debit: '0.00',
    transactions: [],
  });

  const [loading, setLoading] = useState<boolean>(isLoggedIn);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const loadWallet = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getWallet();
      setWalletData({
        balance: data.balance ?? user.balance,
        currency_symbol: data.currency_symbol || '$',
        total_credit: data.total_credit ?? '0.00',
        total_debit: data.total_debit ?? '0.00',
        transactions: data.transactions || [],
      });
    } catch (e: any) {
      if (e instanceof ApiException) {
        setError(e.message);
      } else {
        setError('تعذر تحميل بيانات المحفظة من السيرفر');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [user.balance, isLoggedIn]);

  const filteredTransactions = walletData.transactions.filter((tx) => {
    const isCredit = ['credit', 'topup', 'refund', 'prize', 'referral', 'referral_welcome'].includes(tx.type);
    if (filter === 'credit') return isCredit;
    if (filter === 'debit') return !isCredit;
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wallet size={20} className="text-[#9B5CFF]" />
          <h2 className="text-base font-bold text-[#F4EFFA]">المحفظة الإلكترونية</h2>
        </div>
        <div className="p-8 rounded-3xl bg-[#1D1924] border border-white/5 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#9B5CFF]/15 text-[#9B5CFF] flex items-center justify-center mx-auto">
            <Wallet size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">تسجيل الدخول مطلوب</h3>
            <p className="text-xs text-[#A99DB7] max-w-sm mx-auto mt-1 leading-relaxed">
              لعرض رصيدك الفعلي وكشف الحساب والعمليات المالية المسجلة على منصة نجاز، يرجى تسجيل الدخول.
            </p>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-xs shadow-lg shadow-[#8B45E8]/25 hover:opacity-95 transition active:scale-95 inline-flex items-center gap-2"
            >
              <LogIn size={15} />
              <span>تسجيل الدخول إلى حسابي</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Balance Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1D1924] to-[#26202F] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#9B5CFF]/20 text-[#9B5CFF] flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <span className="text-xs font-semibold text-[#A99DB7]">المحفظة الإلكترونية</span>
          </div>
          <button
            onClick={loadWallet}
            disabled={loading}
            className="text-[#A99DB7] hover:text-white p-1 transition active:scale-95"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#9B5CFF]' : ''} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 text-xs text-[#F87171] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadWallet} className="underline text-white font-bold text-[11px]">
              إعادة المحاولة
            </button>
          </div>
        )}

        <div className="mt-4">
          <span className="text-xs text-[#A99DB7]">الرصيد الكلي المتوفر:</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-white">${Number(walletData.balance).toFixed(2)}</span>
            <span className="text-sm text-[#34D399] font-bold">USD</span>
          </div>
        </div>

        {/* Deposit & Expense Summary */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          <div className="p-3 rounded-2xl bg-[#17131E] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 text-[#34D399] flex items-center justify-center shrink-0">
              <ArrowDownLeft size={16} />
            </div>
            <div>
              <span className="text-[11px] text-[#A99DB7] block">إجمالي الإيداع</span>
              <span className="text-xs sm:text-sm font-bold text-[#34D399]">
                +${Number(walletData.total_credit).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#17131E] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F87171]/15 text-[#F87171] flex items-center justify-center shrink-0">
              <ArrowUpRight size={16} />
            </div>
            <div>
              <span className="text-[11px] text-[#A99DB7] block">إجمالي المصروف</span>
              <span className="text-xs sm:text-sm font-bold text-[#F87171]">
                -${Number(walletData.total_debit).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Topup Button */}
        <button
          onClick={() => onOpenTopup('manual')}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-xs shadow-lg shadow-[#8B45E8]/25 flex items-center justify-center gap-2 hover:opacity-95 transition active:scale-98"
        >
          <Plus size={16} />
          <span>شحن رصيد المحفظة الآن</span>
        </button>
      </div>

      {/* Transactions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F4EFFA] flex items-center gap-2">
            <Clock size={16} className="text-[#9B5CFF]" />
            سجل المعاملات والحركات المالية
          </h3>

          <div className="flex items-center gap-1 bg-[#1D1924] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'all' ? 'bg-[#9B5CFF] text-white' : 'text-[#A99DB7]'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter('credit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'credit' ? 'bg-[#9B5CFF] text-white' : 'text-[#A99DB7]'
              }`}
            >
              إيداع
            </button>
            <button
              onClick={() => setFilter('debit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'debit' ? 'bg-[#9B5CFF] text-white' : 'text-[#A99DB7]'
              }`}
            >
              سحب
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-[#1D1924] rounded-2xl border border-white/5 text-[#A99DB7] space-y-2">
            <div className="w-8 h-8 border-2 border-[#9B5CFF] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">جارِ جلب المعاملات من السيرفر...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-[#1D1924] rounded-2xl border border-white/5 text-[#A99DB7]">
            <p className="text-xs">لا توجد حركات مالية مسجلة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isCredit = ['credit', 'topup', 'refund', 'prize', 'referral', 'referral_welcome'].includes(tx.type);
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-[#1D1924] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-[#34D399]/15 text-[#34D399]'
                          : 'bg-[#F87171]/15 text-[#F87171]'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#F4EFFA] line-clamp-1">
                        {tx.description || (isCredit ? 'إيداع رصيد' : 'شراء خدمة')}
                      </h4>
                      <span className="text-[11px] text-[#6F637B]">{tx.created_at}</span>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span
                      className={`font-extrabold text-xs sm:text-sm ${
                        isCredit ? 'text-[#34D399]' : 'text-[#F87171]'
                      }`}
                    >
                      {isCredit ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#A99DB7] block">USD</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
