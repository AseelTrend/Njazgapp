import React, { useState } from 'react';
import { ServiceItem, UserProfile } from '../types';
import { ApiService, ApiException } from '../services/api';
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Tag,
  Sparkles,
  Loader2,
  CreditCard,
} from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  user: UserProfile;
  onClose: () => void;
  onSuccessOrder: (order: any) => void;
  onOpenTopup: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  user,
  onClose,
  onSuccessOrder,
  onOpenTopup,
}) => {
  if (!service) return null;

  const minQty = service.min_qty || 1;
  const maxQty = service.max_qty || 100;

  const [quantity, setQuantity] = useState<number>(minQty);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [coupon, setCoupon] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const unitPrice = Number(service.price) || 0;
  const totalPrice = (unitPrice * quantity).toFixed(2);
  const userBalance = parseFloat(String(user.balance)) || 0;
  const hasEnoughBalance = userBalance >= parseFloat(totalPrice);

  const handleFieldChange = (name: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: val }));
    if (error) setError(null);
  };

  const handleQuantity = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < minQty) return minQty;
      if (next > maxQty) return maxQty;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    for (const field of service.fields || []) {
      const isReq = field.is_required === 1 || field.is_required === true;
      const val = fieldValues[field.field_name]?.trim();
      if (isReq && (!val || val.length === 0)) {
        setError(`حقل "${field.field_label}" مطلوب`);
        return;
      }
    }

    if (!hasEnoughBalance) {
      setError(`رصيدك الحالي ($${userBalance.toFixed(2)}) غير كافٍ. يرجى شحن الرصيد أولاً.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ApiService.placeOrder({
        serviceId: service.id,
        quantity,
        fields: fieldValues,
        couponCode: coupon.trim() || undefined,
      });

      setOrderResult(res);
      onSuccessOrder(res);
    } catch (err: any) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError('حدث خطأ أثناء تنفيذ الطلب. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyDeliveredCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1D1924] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#17131E]">
          <div>
            <span className="text-[11px] font-semibold text-[#9B5CFF] uppercase tracking-wider">
              طلب خدمة رقمية
            </span>
            <h2 className="text-base font-bold text-[#F4EFFA] line-clamp-1">{service.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-[#26202F] text-[#A99DB7] hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {orderResult ? (
            /* Success Order Card */
            <div className="space-y-4 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#34D399]/20 border border-[#34D399]/30 flex items-center justify-center text-[#34D399] mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">تم تنفيذ طلبك بنجاح!</h3>
                <p className="text-xs text-[#A99DB7] mt-1">
                  رقم المرجع: {orderResult.order_ref || 'ORD-SUCCESS'}
                </p>
              </div>

              {orderResult.delivered_code && (
                <div className="p-4 rounded-2xl bg-[#17131E] border border-white/10 text-right space-y-2">
                  <span className="text-xs text-[#A99DB7]">الكود الرقمي المستلم:</span>
                  <div className="flex items-center justify-between bg-[#26202F] p-3 rounded-xl border border-[#9B5CFF]/30">
                    <span className="font-mono text-sm font-bold text-[#22D3EE] select-all">
                      {orderResult.delivered_code}
                    </span>
                    <button
                      onClick={() => copyDeliveredCode(orderResult.delivered_code)}
                      className="flex items-center gap-1 text-xs font-bold text-[#9B5CFF] hover:text-white bg-[#9B5CFF]/15 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Copy size={13} />
                      <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-sm shadow-lg shadow-[#8B45E8]/30 transition"
                >
                  تم، العودة للرئيسية
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Description */}
              {service.description && (
                <div className="p-3.5 rounded-2xl bg-[#17131E] border border-white/5 text-xs text-[#A99DB7] leading-relaxed">
                  {service.description}
                </div>
              )}

              {/* Dynamic Service Required Fields */}
              {service.fields && service.fields.length > 0 && (
                <div className="space-y-3.5">
                  <span className="text-xs font-bold text-[#F4EFFA] block">
                    البيانات المطلوبة لتنفيذ الخدمة:
                  </span>
                  {service.fields.map((f, i) => {
                    const isReq = f.is_required === 1 || f.is_required === true;
                    return (
                      <div key={i} className="space-y-1 text-right">
                        <label className="text-xs text-[#A99DB7] flex items-center justify-start gap-1">
                          <span>{f.field_label}</span>
                          {isReq && <span className="text-[#F87171] font-bold">*</span>}
                        </label>
                        <input
                          type={f.field_type === 'number' ? 'number' : 'text'}
                          value={fieldValues[f.field_name] || ''}
                          onChange={(e) => handleFieldChange(f.field_name, e.target.value)}
                          placeholder={`أدخل ${f.field_label}`}
                          className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F4EFFA] focus:outline-none focus:border-[#9B5CFF] transition"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity Counter */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#17131E] border border-white/5">
                <div>
                  <span className="text-xs font-bold text-[#F4EFFA] block">الكمية</span>
                  <span className="text-[11px] text-[#A99DB7]">
                    سعر الحبة: ${unitPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-[#26202F] p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => handleQuantity(-1)}
                    disabled={quantity <= minQty}
                    className="w-8 h-8 rounded-lg bg-[#1D1924] text-white flex items-center justify-center hover:bg-[#332A40] transition disabled:opacity-40"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="font-bold text-sm min-w-[28px] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantity(1)}
                    disabled={quantity >= maxQty}
                    className="w-8 h-8 rounded-lg bg-[#1D1924] text-white flex items-center justify-center hover:bg-[#332A40] transition disabled:opacity-40"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Discount Coupon Code */}
              <div className="space-y-1">
                <label className="text-xs text-[#A99DB7] flex items-center gap-1">
                  <Tag size={12} className="text-[#9B5CFF]" />
                  <span>كوبون خصم (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="أدخل كود الخصم إن وجد"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F4EFFA] focus:outline-none focus:border-[#9B5CFF]"
                />
              </div>

              {/* Total & Balance preview */}
              <div className="p-4 rounded-2xl bg-[#26202F] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A99DB7]">المبلغ الإجمالي:</span>
                  <span className="text-base font-extrabold text-[#34D399]">${totalPrice} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-[#A99DB7]">رصيدك في المحفظة:</span>
                  <span className="font-semibold text-white">${userBalance.toFixed(2)}</span>
                </div>

                {!hasEnoughBalance && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#F87171]">الرصيد غير كافٍ لإتمام الطلب</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTopup();
                      }}
                      className="text-[11px] font-bold text-white bg-[#F87171] px-2.5 py-1 rounded-lg hover:opacity-90 transition"
                    >
                      شحن الآن
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !hasEnoughBalance}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-sm shadow-xl shadow-[#8B45E8]/30 hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري تنفيذ الطلب...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>تأكيد وتنفيذ الطلب فورا (${totalPrice})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
