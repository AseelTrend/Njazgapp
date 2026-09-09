import React, { useState, useEffect } from 'react';
import { TopupOptionsData, PaymentMethod, ExchangeRate, SmsProvider } from '../types';
import { ApiService, ApiException } from '../services/api';
import {
  X,
  CreditCard,
  Zap,
  Ticket,
  MessageSquare,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  ArrowRight,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface TopupModalProps {
  initialTab?: 'manual' | 'direct' | 'card' | 'sms';
  onClose: () => void;
  onSuccess: () => void;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  initialTab = 'manual',
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'direct' | 'card' | 'sms'>(initialTab);
  const [options, setOptions] = useState<TopupOptionsData | null>(null);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);

  // General state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. Manual topup states
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('YER');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // 2. Direct sub-methods ('usdt' | 'binance' | 'floosak')
  const [directSubMethod, setDirectSubMethod] = useState<'usdt' | 'binance' | 'floosak'>('usdt');

  // USDT
  const [usdtAmount, setUsdtAmount] = useState<string>('10');
  const [usdtRequest, setUsdtRequest] = useState<any | null>(null);
  const [usdtTxId, setUsdtTxId] = useState<string>('');
  const [usdtTimer, setUsdtTimer] = useState<number>(900); // 15 mins

  // Binance
  const [binanceAmount, setBinanceAmount] = useState<string>('10');
  const [binanceTxId, setBinanceTxId] = useState<string>('');
  const [binanceStep, setBinanceStep] = useState<'amount' | 'verify'>('amount');

  // Floosak
  const [floosakAmount, setFloosakAmount] = useState<string>('500');
  const [floosakPhone, setFloosakPhone] = useState<string>('777123456');
  const [floosakPurchaseId, setFloosakPurchaseId] = useState<number | null>(null);
  const [floosakOtp, setFloosakOtp] = useState<string>('');
  const [floosakPhase, setFloosakPhase] = useState<'form' | 'otp' | 'done'>('form');

  // 3. Card code
  const [cardCode, setCardCode] = useState<string>('');

  // 4. SMS Topup
  const [smsRegion, setSmsRegion] = useState<'north' | 'south' | 'no_region'>('north');
  const [selectedSmsProvider, setSelectedSmsProvider] = useState<SmsProvider | null>(null);
  const [smsPhone, setSmsPhone] = useState<string>('');
  const [smsAmount, setSmsAmount] = useState<string>('');

  useEffect(() => {
    loadOptions();
  }, []);

  // Timer for USDT countdown
  useEffect(() => {
    let interval: any = null;
    if (usdtRequest && usdtTimer > 0) {
      interval = setInterval(() => {
        setUsdtTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [usdtRequest, usdtTimer]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const data = await ApiService.getTopupOptions();
      setOptions(data);
      if (data && Array.isArray(data.payment_methods) && data.payment_methods.length > 0) {
        setSelectedMethod(data.payment_methods[0]);
      }
      if (data?.sms_providers?.north && data.sms_providers.north.length > 0) {
        setSelectedSmsProvider(data.sms_providers.north[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOptions(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resetStatus = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Calculate live USD conversion for manual topup
  const calculateUsd = (amtStr: string, curr: string) => {
    const amt = parseFloat(amtStr) || 0;
    if (!options?.exchange_rates) return (amt).toFixed(2);
    const rateObj = options.exchange_rates.find((r) => r.currency_code === curr);
    const rate = rateObj ? Number(rateObj.rate_to_usd) : 1;
    return (amt * rate).toFixed(2);
  };

  // Handlers
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    }
  };

  const handleManualSubmit = async () => {
    resetStatus();
    const amt = parseFloat(manualAmount);
    if (!amt || amt <= 0) {
      setErrorMessage('يرجى كتابة المبلغ المحول بشكل صحيح');
      return;
    }
    if (!selectedMethod) {
      setErrorMessage('اختر طريقة الدفع أو الحساب المحول إليه');
      return;
    }

    setLoading(true);
    try {
      const res = await ApiService.submitManualTopup({
        methodId: selectedMethod.id,
        currencyCode: selectedCurrency,
        amountSent: amt,
        notes: manualNotes,
        receiptFile,
      });
      setSuccessMessage(res.msg);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال طلب الشحن');
    } finally {
      setLoading(false);
    }
  };

  // Card Redeem
  const handleCardRedeem = async () => {
    resetStatus();
    if (!cardCode.trim()) {
      setErrorMessage('يرجى إدخال كود بطاقة الشحن');
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.redeemCard(cardCode);
      setSuccessMessage(res.message);
      setCardCode('');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'الكود غير صالح أو مستخدم مسبقاً');
    } finally {
      setLoading(false);
    }
  };

  // USDT BEP20
  const handleCreateUsdt = async () => {
    resetStatus();
    const amt = parseFloat(usdtAmount);
    if (!amt || amt < 5) {
      setErrorMessage('الحد الأدنى للإيداع عبر USDT هو 5 دولار');
      return;
    }
    setLoading(true);
    try {
      const req = await ApiService.createUsdtRequest(amt);
      setUsdtRequest(req);
      setUsdtTimer(900);
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل توليد عنوان المحفظة');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUsdt = async () => {
    resetStatus();
    if (!usdtTxId.trim() || usdtTxId.length < 10) {
      setErrorMessage('أدخل رمز العملية (TxID / Hash) بشكل صحيح');
      return;
    }
    setLoading(true);
    try {
      const credited = await ApiService.verifyUsdtTx(
        Number(usdtRequest.id),
        usdtTxId.trim()
      );
      setSuccessMessage(`تم التحقق من العملية بنجاح! تم إيداع $${credited} في محفظتك.`);
      setUsdtRequest(null);
      setUsdtTxId('');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'لم يتم العثور على العملية، تأكد من تأكيد البلوكشين');
    } finally {
      setLoading(false);
    }
  };

  // Binance Pay
  const handleBinanceVerify = async () => {
    resetStatus();
    if (!binanceTxId.trim() || binanceTxId.length < 8) {
      setErrorMessage('يرجى كتابة رقم العملية (Binance Order / Transaction ID)');
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.binanceVerify(
        Date.now(),
        binanceTxId.trim()
      );
      setSuccessMessage(res.message || 'تم شحن رصيدك عبر Binance Pay بنجاح!');
      setBinanceTxId('');
      setBinanceStep('amount');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'رقم العملية غير موجود أو تم استخدامه مسبقاً');
    } finally {
      setLoading(false);
    }
  };

  // Floosak
  const handleFloosakInitiate = async () => {
    resetStatus();
    const amt = parseFloat(floosakAmount);
    if (!amt || amt < 100) {
      setErrorMessage('الحد الأدنى للشحن في فلوسك 100 ريال');
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.floosakInitiate({ amount: amt, phone: floosakPhone });
      setFloosakPurchaseId(res.purchase_id);
      setFloosakPhase('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إرسال طلب فلوسك');
    } finally {
      setLoading(false);
    }
  };

  const handleFloosakConfirm = async () => {
    resetStatus();
    if (floosakOtp.trim().length !== 6) {
      setErrorMessage('رمز التحقق يجب أن يتكون من 6 أرقام');
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.floosakConfirm({
        purchaseId: floosakPurchaseId!,
        otp: floosakOtp.trim(),
      });
      setSuccessMessage(res.message);
      setFloosakPhase('done');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  // SMS Topup
  const handleSmsSubmit = async () => {
    resetStatus();
    if (!selectedSmsProvider) {
      setErrorMessage('اختر جهة التحويل');
      return;
    }
    const amt = parseFloat(smsAmount);
    if (!amt || amt <= 0) {
      setErrorMessage('أدخل المبلغ المُرسل بشكل صحيح');
      return;
    }
    if (smsPhone.trim().length < 8) {
      setErrorMessage('أدخل رقم الهاتف الذي تم التحويل منه');
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService.smsVerifyTopup({
        phone: smsPhone.trim(),
        amount: amt,
        providerId: selectedSmsProvider.id,
      });
      setSuccessMessage(res.message);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر التحقق من التحويل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1D1924] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#17131E]">
          <div>
            <span className="text-[11px] font-semibold text-[#9B5CFF] uppercase tracking-wider">
              بوابة الدفع والشحن
            </span>
            <h2 className="text-base font-bold text-[#F4EFFA]">شحن رصيد المحفظة</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-[#26202F] text-[#A99DB7] hover:text-white flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Main Tabs matching Flutter TopupScreen */}
        <div className="flex border-b border-white/5 bg-[#17131E] px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('manual');
              resetStatus();
            }}
            className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'manual'
                ? 'text-[#9B5CFF] border-[#9B5CFF]'
                : 'text-[#A99DB7] border-transparent hover:text-white'
            }`}
          >
            <CreditCard size={15} />
            <span>تحويل يدوي</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('direct');
              resetStatus();
            }}
            className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'direct'
                ? 'text-[#9B5CFF] border-[#9B5CFF]'
                : 'text-[#A99DB7] border-transparent hover:text-white'
            }`}
          >
            <Zap size={15} className="text-[#22D3EE]" />
            <span>مباشر (USDT / باينانس)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('card');
              resetStatus();
            }}
            className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'card'
                ? 'text-[#9B5CFF] border-[#9B5CFF]'
                : 'text-[#A99DB7] border-transparent hover:text-white'
            }`}
          >
            <Ticket size={15} className="text-[#FBBF24]" />
            <span>بكود بطاقة</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sms');
              resetStatus();
            }}
            className={`pb-3 px-3.5 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sms'
                ? 'text-[#9B5CFF] border-[#9B5CFF]'
                : 'text-[#A99DB7] border-transparent hover:text-white'
            }`}
          >
            <MessageSquare size={15} className="text-[#34D399]" />
            <span>مباشر 2 (تحويل شريحة)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#F87171]/15 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
              <AlertCircle size={17} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center gap-2 text-xs text-[#34D399]">
              <CheckCircle2 size={17} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: MANUAL TOPUP */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#F4EFFA] block mb-2">
                  اختر حساب التحويل المصرفي / المحفظة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(options?.payment_methods || []).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-3 rounded-2xl border text-right transition ${
                        selectedMethod?.id === method.id
                          ? 'bg-[#9B5CFF]/15 border-[#9B5CFF] text-white shadow-sm'
                          : 'bg-[#17131E] border-white/5 text-[#A99DB7] hover:border-white/10'
                      }`}
                    >
                      <span className="font-bold text-xs block leading-tight text-white">
                        {method.name}
                      </span>
                      <span className="text-[10px] text-[#A99DB7] line-clamp-1 mt-0.5">
                        {method.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Method Account Details Box */}
              {selectedMethod && selectedMethod.fields && selectedMethod.fields.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#17131E] border border-white/10 space-y-2.5">
                  <span className="text-xs font-bold text-[#9B5CFF]">بيانات الحساب للتحويل:</span>
                  {(selectedMethod.fields || []).map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0"
                    >
                      <span className="text-[#A99DB7]">{f.label}:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-mono">{f.value}</span>
                        {f.copyable !== false && (
                          <button
                            type="button"
                            onClick={() => copyText(f.value, `field_${i}`)}
                            className="text-[#9B5CFF] hover:text-white p-1"
                            title="نسخ"
                          >
                            <Copy size={13} />
                          </button>
                        )}
                        {copiedKey === `field_${i}` && (
                          <span className="text-[10px] text-[#34D399]">تم النسخ!</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Currency Selector */}
              <div>
                <label className="text-xs font-bold text-[#F4EFFA] block mb-2">عملة التحويل:</label>
                <div className="flex gap-2">
                  {['YER', 'SAR', 'USD'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCurrency(c)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        selectedCurrency === c
                          ? 'bg-[#9B5CFF] text-white border-[#9B5CFF]'
                          : 'bg-[#17131E] text-[#A99DB7] border-white/5 hover:text-white'
                      }`}
                    >
                      {c === 'YER' ? 'ريال يمني' : c === 'SAR' ? 'ريال سعودي' : 'دولار USD'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input & live conversion */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F4EFFA] block">
                  المبلغ المُرسل في الحوالة ({selectedCurrency}):
                </label>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="مثال: 50000"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F4EFFA] focus:outline-none focus:border-[#9B5CFF]"
                />
                {manualAmount && (
                  <div className="flex items-center justify-between text-xs px-1 text-[#A99DB7]">
                    <span>ما يقابله بالدولار في المحفظة:</span>
                    <strong className="text-[#34D399]">
                      ${calculateUsd(manualAmount, selectedCurrency)} USD
                    </strong>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A99DB7] block">ملاحظات أو رقم الحوالة:</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="مثال: رقم الحوالة 883921 أو اسم المرسل"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F4EFFA] focus:outline-none focus:border-[#9B5CFF]"
                />
              </div>

              {/* Receipt File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A99DB7] block">صورة سند أو إشعار التحويل:</label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/15 rounded-2xl bg-[#17131E] hover:bg-[#26202F] cursor-pointer transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                  {receiptPreview ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={receiptPreview}
                        alt="Receipt Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-white/10"
                      />
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#34D399] block">تم اختيار الإشعار</span>
                        <span className="text-[10px] text-[#A99DB7]">اضغط لتغيير الصورة</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Upload size={20} className="text-[#9B5CFF]" />
                      <span className="text-xs text-[#F4EFFA] font-semibold">ارفع صورة السند</span>
                      <span className="text-[10px] text-[#6F637B]">PNG, JPG (حد أقصى 5MB)</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-sm shadow-xl shadow-[#8B45E8]/30 flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>إرسال طلب الشحن اليدوي</span>
              </button>
            </div>
          )}

          {/* TAB 2: DIRECT / AUTOMATIC (USDT / BINANCE / FLOOSAK) */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              {/* Sub tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDirectSubMethod('usdt')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    directSubMethod === 'usdt'
                      ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]'
                      : 'bg-[#17131E] border-white/5 text-[#A99DB7]'
                  }`}
                >
                  USDT (BEP20)
                </button>
                <button
                  type="button"
                  onClick={() => setDirectSubMethod('binance')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    directSubMethod === 'binance'
                      ? 'bg-[#FBBF24]/20 border-[#FBBF24] text-[#FBBF24]'
                      : 'bg-[#17131E] border-white/5 text-[#A99DB7]'
                  }`}
                >
                  Binance Pay
                </button>
                <button
                  type="button"
                  onClick={() => setDirectSubMethod('floosak')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    directSubMethod === 'floosak'
                      ? 'bg-[#9B5CFF]/20 border-[#9B5CFF] text-[#9B5CFF]'
                      : 'bg-[#17131E] border-white/5 text-[#A99DB7]'
                  }`}
                >
                  محفظة فلوسك
                </button>
              </div>

              {/* USDT BEP20 Sub-view */}
              {directSubMethod === 'usdt' && (
                <div className="space-y-3.5">
                  {!usdtRequest ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-xs text-[#22D3EE] leading-relaxed">
                        إيداع آلي سريع عبر شبكة BNB Smart Chain (BEP20). يتم توليد مبلغ دقيق ومميز لكل عملية للتعرف على التحويل فوراً.
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#F4EFFA]">
                          مبلغ الإيداع بالدولار (الحد الأدنى $5):
                        </label>
                        <input
                          type="number"
                          value={usdtAmount}
                          onChange={(e) => setUsdtAmount(e.target.value)}
                          min="5"
                          placeholder="10"
                          className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F4EFFA] focus:outline-none focus:border-[#22D3EE]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateUsdt}
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-[#22D3EE] text-[#111016] font-bold text-xs shadow-lg shadow-[#22D3EE]/25 flex items-center justify-center gap-2 hover:opacity-95 transition"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        <span>توليد عنوان الإيداع</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-[#17131E] p-4 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between text-xs text-[#A99DB7]">
                        <span>المبلغ الدقيق المطلوب تحويله:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-sm font-extrabold text-[#22D3EE] font-mono">
                            {usdtRequest.unique_amount} USDT
                          </strong>
                          <button
                            type="button"
                            onClick={() => copyText(String(usdtRequest.unique_amount), 'usdt_amt')}
                            className="text-[#22D3EE] p-1"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-[#A99DB7] block">عنوان المحفظة (BEP20):</span>
                        <div className="flex items-center justify-between bg-[#26202F] p-2.5 rounded-xl border border-white/5">
                          <span className="font-mono text-xs text-white truncate">
                            {usdtRequest.wallet_address}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(usdtRequest.wallet_address, 'usdt_addr')}
                            className="text-[#22D3EE] shrink-0 p-1 font-bold text-xs"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#FBBF24]">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          صلاحية العنوان:
                        </span>
                        <span className="font-mono font-bold">
                          {Math.floor(usdtTimer / 60)}:{String(usdtTimer % 60).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-white/5">
                        <label className="text-xs text-[#A99DB7] block">
                          رمز العملية (Transaction Hash / TxID):
                        </label>
                        <input
                          type="text"
                          value={usdtTxId}
                          onChange={(e) => setUsdtTxId(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-[#26202F] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22D3EE]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setUsdtRequest(null)}
                          className="px-4 py-2.5 rounded-xl bg-[#26202F] text-[#A99DB7] text-xs font-bold hover:text-white"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyUsdt}
                          disabled={loading}
                          className="flex-1 py-2.5 rounded-xl bg-[#22D3EE] text-[#111016] font-bold text-xs flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                          <span>التحقق من العملية وإيداع الرصيد</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Binance Pay Sub-view */}
              {directSubMethod === 'binance' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-xs text-[#FBBF24] leading-relaxed">
                    تحويل مباشر عبر Binance Pay C2C بدون أي رسوم تحويل.
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#17131E] border border-white/10 space-y-2 text-xs">
                    <span className="text-[#A99DB7] block">معرف الاستلام في باينانس:</span>
                    <div className="flex items-center justify-between bg-[#26202F] p-2.5 rounded-xl">
                      <span className="font-mono font-bold text-white">382910481 (Binance Pay ID)</span>
                      <button
                        type="button"
                        onClick={() => copyText('382910481', 'binance_id')}
                        className="text-[#FBBF24] p-1 font-bold text-xs"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#F4EFFA] block">
                      رقم العملية في باينانس (Binance Transaction ID / Order ID):
                    </label>
                    <input
                      type="text"
                      value={binanceTxId}
                      onChange={(e) => setBinanceTxId(e.target.value)}
                      placeholder="مثال: 298103859201"
                      className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F4EFFA] focus:outline-none focus:border-[#FBBF24]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleBinanceVerify}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-[#FBBF24] text-[#111016] font-bold text-xs shadow-lg shadow-[#FBBF24]/25 flex items-center justify-center gap-2 hover:opacity-95 transition"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    <span>تأكيد الإيداع وإضافة الرصيد</span>
                  </button>
                </div>
              )}

              {/* Floosak Sub-view */}
              {directSubMethod === 'floosak' && (
                <div className="space-y-3">
                  {floosakPhase === 'form' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#F4EFFA] block">المبلغ (ريال يمني):</label>
                        <input
                          type="number"
                          value={floosakAmount}
                          onChange={(e) => setFloosakAmount(e.target.value)}
                          placeholder="الحد الأدنى 100"
                          className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F4EFFA] focus:outline-none focus:border-[#9B5CFF]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#F4EFFA] block">رقم هاتفك في فلوسك:</label>
                        <input
                          type="tel"
                          value={floosakPhone}
                          onChange={(e) => setFloosakPhone(e.target.value)}
                          placeholder="7XXXXXXXX"
                          className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#F4EFFA] focus:outline-none focus:border-[#9B5CFF]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleFloosakInitiate}
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-[#9B5CFF] text-white font-bold text-xs shadow-lg shadow-[#9B5CFF]/25 flex items-center justify-center gap-2 hover:opacity-95 transition"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        <span>إرسال رمز التحقق OTP</span>
                      </button>
                    </>
                  ) : floosakPhase === 'otp' ? (
                    <div className="space-y-3 text-center">
                      <p className="text-xs text-[#A99DB7]">
                        أدخل رمز التحقق (OTP) المكون من 6 أرقام الواصل لهاتفك:
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        value={floosakOtp}
                        onChange={(e) => setFloosakOtp(e.target.value)}
                        placeholder="••••••"
                        className="w-full text-center text-xl font-bold tracking-widest bg-[#17131E] border border-[#9B5CFF]/40 rounded-xl py-3 text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleFloosakConfirm}
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-[#9B5CFF] text-white font-bold text-xs shadow-lg shadow-[#9B5CFF]/25 flex items-center justify-center gap-2 hover:opacity-95 transition"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        <span>تأكيد الدفع</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFloosakPhase('form')}
                        className="text-xs text-[#A99DB7] hover:text-white"
                      >
                        رجوع
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[#34D399] font-bold text-sm">
                      تمت عملية شحن فلوسك بنجاح!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CARD CODE (REDEEM) */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-xs text-[#FBBF24] leading-relaxed">
                إذا قمت بشراء كود بطاقة نجاز كارد أو استلمت كود شحن من أحد موزعينا المعتمدين، أدخل الكود هنا لإضافة الرصيد فوراً.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F4EFFA] block">كود البطاقة الرقمية:</label>
                <input
                  type="text"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value)}
                  placeholder="NJAZ-XXXX-XXXX-XXXX"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-3 font-mono text-center tracking-wider text-sm font-bold text-[#22D3EE] placeholder-[#6F637B] focus:outline-none focus:border-[#9B5CFF]"
                />
              </div>

              <button
                type="button"
                onClick={handleCardRedeem}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9B5CFF] to-[#8B45E8] text-white font-bold text-sm shadow-xl shadow-[#8B45E8]/30 flex items-center justify-center gap-2 hover:opacity-95 transition"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>شحن البطاقة الآن</span>
              </button>
            </div>
          )}

          {/* TAB 4: SMS TOPUP */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {(['north', 'south', 'no_region'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSmsRegion(r);
                      const list = options?.sms_providers?.[r];
                      if (list && list.length > 0) setSelectedSmsProvider(list[0]);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                      smsRegion === r
                        ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                        : 'bg-[#17131E] border-white/5 text-[#A99DB7]'
                    }`}
                  >
                    {r === 'north' ? 'شمال' : r === 'south' ? 'جنوب' : 'أخرى'}
                  </button>
                ))}
              </div>

              {/* Providers */}
              <div>
                <label className="text-xs font-bold text-[#F4EFFA] block mb-1.5">جهة التحويل:</label>
                <div className="flex flex-wrap gap-2">
                  {(options?.sms_providers?.[smsRegion] || []).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedSmsProvider(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedSmsProvider?.id === p.id
                          ? 'bg-[#9B5CFF] border-[#9B5CFF] text-white'
                          : 'bg-[#17131E] border-white/5 text-[#A99DB7]'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSmsProvider && selectedSmsProvider.transfer_account && (
                <div className="p-3 rounded-2xl bg-[#17131E] border border-white/10 space-y-1 text-xs">
                  <span className="text-[#A99DB7]">حوّل الرصيد إلى رقم:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">
                      {selectedSmsProvider.transfer_account}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(selectedSmsProvider.transfer_account!, 'sms_acc')}
                      className="text-[#34D399] p-1 font-bold text-xs"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  {selectedSmsProvider.account_holder && (
                    <span className="text-[11px] text-[#A99DB7] block">
                      الاسم: {selectedSmsProvider.account_holder}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">
                  رقم الهاتف الذي أرسلت منه:
                </label>
                <input
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="7XXXXXXXX"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#34D399]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#F4EFFA] block">المبلغ المُرسل:</label>
                <input
                  type="number"
                  value={smsAmount}
                  onChange={(e) => setSmsAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#17131E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#34D399]"
                />
              </div>

              <button
                type="button"
                onClick={handleSmsSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#34D399] text-[#111016] font-bold text-xs shadow-lg shadow-[#34D399]/25 flex items-center justify-center gap-2 hover:opacity-95 transition"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>تحقق وشحن الرصيد</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
