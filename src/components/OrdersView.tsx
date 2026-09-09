import React, { useState, useEffect } from 'react';
import { OrderItem } from '../types';
import { ApiService, ApiException } from '../services/api';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Search,
  RotateCw,
  Tag,
  LogIn,
} from 'lucide-react';

interface OrdersViewProps {
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ isLoggedIn = false, onOpenAuth }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(isLoggedIn);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadOrders = async () => {
    if (!isLoggedIn) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getOrders();
      setOrders(data);
    } catch (e: any) {
      if (e instanceof ApiException) {
        setError(e.message);
      } else {
        setError('تعذر تحميل الطلبات من السيرفر');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isLoggedIn]);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      filter === 'all'
        ? true
        : filter === 'completed'
        ? o.status === 'completed'
        : o.status === 'pending' || o.status === 'processing';

    const matchesSearch = searchTerm.trim()
      ? o.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.ref_id && o.ref_id.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
            <CheckCircle2 size={12} />
            مكتمل
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-full border border-[#22D3EE]/20">
            <RotateCw size={12} className="animate-spin" />
            قيد التنفيذ
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FBBF24] bg-[#FBBF24]/10 px-2 py-0.5 rounded-full border border-[#FBBF24]/20">
            <Clock size={12} />
            قيد المراجعة
          </span>
        );
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F87171] bg-[#F87171]/10 px-2 py-0.5 rounded-full border border-[#F87171]/20">
            <XCircle size={12} />
            ملغي / مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A99DB7] bg-white/5 px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  // If not logged in
  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-[#9B5CFF]" />
          <h2 className="text-base font-bold text-[#F4EFFA]">سجل الطلبات</h2>
        </div>
        <div className="p-8 rounded-3xl bg-[#1D1924] border border-white/5 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#9B5CFF]/15 text-[#9B5CFF] flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">تسجيل الدخول مطلوب</h3>
            <p className="text-xs text-[#A99DB7] max-w-sm mx-auto mt-1 leading-relaxed">
              لعرض سجل طلباتك وأكواد البطاقات المشتراة المربوطة بحسابك الفعلي على منصة نجاز كارد، يرجى تسجيل الدخول.
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
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-[#9B5CFF]" />
          <h2 className="text-base font-bold text-[#F4EFFA]">سجل الطلبات</h2>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="p-2 rounded-xl bg-[#1D1924] hover:bg-[#26202F] text-[#A99DB7] hover:text-white border border-white/5 transition active:scale-95"
          title="تحديث القائمة"
        >
          <RotateCw size={15} className={loading ? 'animate-spin text-[#9B5CFF]' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 text-xs text-[#F87171] flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadOrders} className="underline text-white font-bold text-[11px]">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم أو رقم المرجع..."
            className="w-full bg-[#1D1924] border border-white/10 rounded-xl py-2 pr-9 pl-3 text-xs text-[#F4EFFA] placeholder-[#6F637B] focus:outline-none focus:border-[#9B5CFF]"
          />
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F637B]" />
        </div>

        <div className="flex items-center gap-1.5 bg-[#1D1924] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-[#9B5CFF] text-white shadow-sm'
                : 'text-[#A99DB7] hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'completed'
                ? 'bg-[#9B5CFF] text-white shadow-sm'
                : 'text-[#A99DB7] hover:text-white'
            }`}
          >
            المكتملة
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'pending'
                ? 'bg-[#9B5CFF] text-white shadow-sm'
                : 'text-[#A99DB7] hover:text-white'
            }`}
          >
            قيد التنفيذ
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 bg-[#1D1924] rounded-2xl border border-white/5 space-y-2">
          <div className="w-8 h-8 border-2 border-[#9B5CFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A99DB7]">جارِ جلب طلباتك من السيرفر...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#1D1924] rounded-2xl border border-white/5 space-y-2">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#6F637B] mx-auto">
            <ShoppingBag size={24} />
          </div>
          <p className="text-sm font-semibold text-[#A99DB7]">لا توجد طلبات مسجلة حالياً</p>
          <p className="text-xs text-[#6F637B]">يمكنك تصفح الخدمات والبدء بالطلب المباشر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-[#1D1924] border border-white/5 hover:border-white/10 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#F4EFFA]">{order.service_name}</h3>
                  <span className="text-[11px] text-[#A99DB7] block mt-0.5">
                    المرجع: {order.ref_id || `#${order.id}`}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center justify-between text-xs text-[#A99DB7] pt-2 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <span>الكمية: <strong className="text-white">{order.quantity}</strong></span>
                  <span>الإجمالي: <strong className="text-[#34D399]">${Number(order.total_price).toFixed(2)}</strong></span>
                </div>
                {order.created_at && (
                  <span className="text-[11px] text-[#6F637B]">{order.created_at}</span>
                )}
              </div>

              {/* Delivered Code Banner if available */}
              {order.delivered_code && (
                <div className="bg-[#17131E] p-2.5 rounded-xl border border-[#9B5CFF]/25 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Tag size={13} className="text-[#9B5CFF] shrink-0" />
                    <span className="font-mono text-xs font-bold text-[#22D3EE] truncate select-all">
                      {order.delivered_code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(order.delivered_code!, String(order.id))}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#9B5CFF] hover:text-white bg-[#9B5CFF]/15 px-2 py-1 rounded-lg transition active:scale-95"
                  >
                    <Copy size={12} />
                    <span>{copiedId === String(order.id) ? 'تم' : 'نسخ'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
