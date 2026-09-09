import { StorageService } from './storage';
import {
  Category,
  ServiceItem,
  OrderItem,
  TopupOptionsData,
  UserProfile,
  UserDevice,
} from '../types';

export class ApiException extends Error {
  data: Record<string, any>;
  constructor(message: string, data: Record<string, any> = {}) {
    super(message);
    this.name = 'ApiException';
    this.data = data;
  }
}

export class ApiService {
  // Use reverse proxy path which forwards directly to https://njaz.net/api/mobile
  static baseUrl = '/api-proxy';

  private static getHeaders(contentType: string | null = 'application/json', requiredAuth = false): HeadersInit {
    const token = StorageService.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    if (token && token.trim().length > 0) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    } else if (requiredAuth) {
      throw new ApiException('يجب تسجيل الدخول للوصول إلى هذا القسم');
    }
    return headers;
  }

  private static async parseResponse(res: Response, successKey: string = 'ok'): Promise<any> {
    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new ApiException('تعذر الاتصال بالسيرفر، استجابة غير متوقعة');
    }

    if (!data || typeof data !== 'object') {
      throw new ApiException('تعذر الاتصال بالسيرفر، حاول لاحقاً');
    }

    const raw = data[successKey];
    // In backend API, successKey might be boolean or a status string like "completed", "pending"
    // Any value other than false is considered success
    const isSuccess = raw !== false;
    if (!isSuccess) {
      const msg = data.msg || data.message || data.error || 'حدث خطأ غير متوقع في العملية';
      throw new ApiException(String(msg), data);
    }

    return data;
  }

  // Normalize image URLs from backend to absolute URLs
  static formatImageUrl(path?: string | null): string {
    if (!path) return '';
    const trimmed = String(path).trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const clean = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `https://njaz.net/${clean}`;
  }

  // ══════════════════ المصادقة والحساب (Auth) ══════════════════

  static async login(params: { login: string; password: string; totpCode?: string }): Promise<any> {
    const deviceId = StorageService.getDeviceId();
    const body = new URLSearchParams({
      login: params.login.trim(),
      password: params.password,
      device_id: deviceId,
      ...(params.totpCode && params.totpCode.trim() ? { totp_code: params.totpCode.trim() } : {}),
    });

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body,
      });
    } catch {
      throw new ApiException('تعذر الاتصال بسيرفر نجاز، تحقق من اتصال الإنترنت');
    }

    const data = await this.parseResponse(res);

    if (data.token) {
      StorageService.saveToken(data.token);
    }
    if (data.user) {
      StorageService.saveUser(data.user);
    }

    return data;
  }

  static async register(params: {
    username: string;
    email: string;
    password: string;
    password2: string;
    fullName?: string;
    phone?: string;
    referralCode?: string;
  }): Promise<any> {
    const deviceId = StorageService.getDeviceId();
    const body = new URLSearchParams({
      username: params.username.trim(),
      email: params.email.trim(),
      password: params.password,
      password2: params.password2,
      full_name: params.fullName?.trim() || '',
      phone: params.phone?.trim() || '',
      referral_code: params.referralCode?.trim() || '',
      device_id: deviceId,
    });

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body,
      });
    } catch {
      throw new ApiException('تعذر الاتصال بسيرفر نجاز، تحقق من اتصال الإنترنت');
    }

    const data = await this.parseResponse(res);

    if (data.token) {
      StorageService.saveToken(data.token);
    }
    if (data.user) {
      StorageService.saveUser(data.user);
    }

    return data;
  }

  static async logout(): Promise<void> {
    StorageService.deleteToken();
  }

  // ══════════════════ الأقسام والخدمات (Categories & Services) ══════════════════

  static async getCategories(parentId?: number | null): Promise<Category[]> {
    const url = new URL(`${this.baseUrl}/categories.php`, window.location.origin);
    if (parentId !== undefined && parentId !== null) {
      url.searchParams.set('parent_id', String(parentId));
    }

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null),
    });
    const data = await this.parseResponse(res);

    if (Array.isArray(data.categories)) {
      return data.categories.map((c: any) => ({
        id: Number(c.id),
        name: c.name || '',
        image: this.formatImageUrl(c.image),
        parent_id: c.parent_id !== null && c.parent_id !== undefined ? Number(c.parent_id) : null,
        description: c.name_en || '',
      }));
    }
    return [];
  }

  static async getBanners(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/banners.php`, {
        headers: this.getHeaders(null),
      });
      const data = await this.parseResponse(res);
      return Array.isArray(data.banners) ? data.banners : [];
    } catch {
      return [];
    }
  }

  static async getServices(categoryId?: number | null): Promise<ServiceItem[]> {
    const url = new URL(`${this.baseUrl}/services.php`, window.location.origin);
    if (categoryId !== undefined && categoryId !== null) {
      url.searchParams.set('category_id', String(categoryId));
    }

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null),
    });
    const data = await this.parseResponse(res);

    if (Array.isArray(data.services)) {
      return data.services.map((s: any) => ({
        id: Number(s.id),
        category_id: s.category_id ? Number(s.category_id) : undefined,
        name: s.name || '',
        description: s.description || '',
        price: Number(s.price) || 0,
        image: this.formatImageUrl(s.image || s.category_image),
        min_qty: Number(s.min_qty) || 1,
        max_qty: Number(s.max_qty) || 9999,
        fields: Array.isArray(s.fields)
          ? s.fields.map((f: any) => ({
              field_name: f.field_name || 'id',
              field_label: f.field_label || 'المعرف / الرقم',
              field_type: f.field_type || 'text',
              is_required: f.is_required === '1' || f.is_required === 1 || f.is_required === true,
            }))
          : [],
      }));
    }
    return [];
  }

  static async getServiceDetail(id: number): Promise<ServiceItem> {
    const url = new URL(`${this.baseUrl}/service_detail.php`, window.location.origin);
    url.searchParams.set('id', String(id));

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null),
    });
    const data = await this.parseResponse(res);

    const s = data.service || {};
    return {
      id: Number(s.id),
      category_id: s.category_id ? Number(s.category_id) : undefined,
      name: s.name || '',
      description: s.description || '',
      price: Number(s.price) || 0,
      image: this.formatImageUrl(s.image || s.category_image),
      min_qty: Number(s.min_qty) || 1,
      max_qty: Number(s.max_qty) || 9999,
      fields: Array.isArray(s.fields)
        ? s.fields.map((f: any) => ({
            field_name: f.field_name || 'id',
            field_label: f.field_label || 'المعرف / الرقم',
            field_type: f.field_type || 'text',
            is_required: f.is_required === '1' || f.is_required === 1 || f.is_required === true,
          }))
        : [],
    };
  }

  // ══════════════════ الطلبات المباشرة (Orders) ══════════════════

  static async placeOrder(params: {
    serviceId: number;
    quantity: number;
    fields: Record<string, string>;
    couponCode?: string;
  }): Promise<any> {
    const res = await fetch(`${this.baseUrl}/place_order.php`, {
      method: 'POST',
      headers: this.getHeaders('application/json', true),
      body: JSON.stringify({
        service_id: params.serviceId,
        quantity: params.quantity,
        fields: params.fields,
        coupon_code: params.couponCode || '',
      }),
    });

    const data = await this.parseResponse(res, 'status');
    return data;
  }

  static async getOrders(page = 1): Promise<OrderItem[]> {
    const url = new URL(`${this.baseUrl}/orders.php`, window.location.origin);
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null, true),
    });
    const data = await this.parseResponse(res);

    return (data.orders as OrderItem[]) || [];
  }

  static async getOrderDetail(id: number): Promise<any> {
    const url = new URL(`${this.baseUrl}/order_detail.php`, window.location.origin);
    url.searchParams.set('id', String(id));

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null, true),
    });
    return this.parseResponse(res);
  }

  static async syncOrder(orderId: number): Promise<any> {
    const body = new URLSearchParams({ order_id: String(orderId) });
    const res = await fetch(`${this.baseUrl}/sync_order.php`, {
      method: 'POST',
      headers: {
        ...this.getHeaders('application/x-www-form-urlencoded', true),
      },
      body,
    });
    const data = await this.parseResponse(res);
    return data.order || data;
  }

  // ══════════════════ الملف الشخصي والأجهزة (Profile & Devices) ══════════════════

  static async getProfile(): Promise<UserProfile> {
    const url = new URL(`${this.baseUrl}/profile.php`, window.location.origin);
    url.searchParams.set('action', 'profile');

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null, true),
    });
    const data = await this.parseResponse(res);
    const u = data.user || {};

    const profile: UserProfile = {
      name: u.name || u.full_name || u.username || 'مستخدم نجاز',
      balance: u.balance !== undefined ? String(u.balance) : '0.00',
      uid: u.uid ? String(u.uid) : '',
      email: u.email || '',
      phone: u.phone || '',
      username: u.username || '',
      role: u.role || 'عميل',
    };

    // Keep cached user updated
    StorageService.saveUser(profile);
    return profile;
  }

  static async updateProfileName(name: string): Promise<string> {
    const body = new URLSearchParams({
      action: 'update_name',
      full_name: name.trim(),
    });

    const res = await fetch(`${this.baseUrl}/profile.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    const data = await this.parseResponse(res);
    const updatedName = data.name?.toString() || name;

    const current = StorageService.getUser();
    current.name = updatedName;
    StorageService.saveUser(current);

    return updatedName;
  }

  static async getDevices(): Promise<UserDevice[]> {
    const url = new URL(`${this.baseUrl}/profile.php`, window.location.origin);
    url.searchParams.set('action', 'devices');

    const res = await fetch(url.toString(), {
      headers: this.getHeaders(null, true),
    });
    const data = await this.parseResponse(res);

    return (data.devices as UserDevice[]) || [];
  }

  static async setDeviceBlocked(deviceId: number, blocked: boolean): Promise<void> {
    const body = new URLSearchParams({
      action: blocked ? 'block_device' : 'unblock_device',
      device_id: String(deviceId),
    });

    const res = await fetch(`${this.baseUrl}/profile.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    await this.parseResponse(res);
  }

  // ══════════════════ المحفظة وشحن الرصيد (Wallet & Topup) ══════════════════

  static async getWallet(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/wallet.php`, {
      headers: this.getHeaders(null, true),
    });
    const data = await this.parseResponse(res);
    return data;
  }

  static async getTopupOptions(): Promise<TopupOptionsData> {
    const res = await fetch(`${this.baseUrl}/topup_options.php`, {
      headers: this.getHeaders(null, true),
    });
    const data = await this.parseResponse(res);
    return data;
  }

  // شحن يدوي عبر إيصال تحويل
  static async submitManualTopup(
    input:
      | FormData
      | {
          methodId?: number | string;
          payment_method_id?: number | string;
          currencyCode?: string;
          currency_code?: string;
          amountSent?: number | string;
          amount?: number | string;
          notes?: string;
          receiptFile?: File | null;
          [key: string]: any;
        }
  ): Promise<any> {
    let body: FormData;
    if (input instanceof FormData) {
      body = input;
    } else {
      body = new FormData();
      const methodId = input.methodId ?? input.payment_method_id;
      if (methodId !== undefined) {
        body.append('method_id', String(methodId));
        body.append('payment_method_id', String(methodId));
      }
      const currency = input.currencyCode ?? input.currency_code ?? 'YER';
      body.append('currency_code', currency);

      const amount = input.amountSent ?? input.amount;
      if (amount !== undefined) {
        body.append('amount_sent', String(amount));
        body.append('amount', String(amount));
      }
      if (input.notes) {
        body.append('notes', input.notes);
      }
      if (input.receiptFile) {
        body.append('receipt', input.receiptFile);
        body.append('image', input.receiptFile);
      }
    }

    const token = StorageService.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}/topup_manual.php`, {
      method: 'POST',
      headers,
      body,
    });

    return this.parseResponse(res);
  }

  // شحن بكود بطاقة
  static async redeemCard(code: string): Promise<any> {
    const body = new URLSearchParams({ code: code.trim() });
    const res = await fetch(`${this.baseUrl}/card_redeem.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    return this.parseResponse(res);
  }

  // طلب USDT مباشر
  static async createUsdtRequest(amount: number): Promise<any> {
    const res = await fetch(`${this.baseUrl}/usdt_request.php`, {
      method: 'POST',
      headers: this.getHeaders('application/json', true),
      body: JSON.stringify({ amount }),
    });

    const data = await this.parseResponse(res);
    return data.request || data;
  }

  // تأكيد معاملة USDT
  static async verifyUsdtTx(requestId: number, txId: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/usdt_verify.php`, {
      method: 'POST',
      headers: this.getHeaders('application/json', true),
      body: JSON.stringify({ request_id: requestId, tx_id: txId.trim() }),
    });

    const data = await this.parseResponse(res);
    return (data.amount ?? '0').toString();
  }

  // إيداع Binance Pay
  static async binanceCreate(amount: string): Promise<any> {
    const body = new URLSearchParams({
      action: 'create',
      amount,
    });

    const res = await fetch(`${this.baseUrl}/binance_deposit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    return this.parseResponse(res);
  }

  static async binanceVerify(requestId: number, transactionId: string): Promise<any> {
    const body = new URLSearchParams({
      action: 'verify',
      request_id: String(requestId),
      transaction_id: transactionId.trim(),
    });

    const res = await fetch(`${this.baseUrl}/binance_deposit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    return this.parseResponse(res);
  }

  static async binanceHistory(): Promise<any[]> {
    const body = new URLSearchParams({ action: 'list' });
    const res = await fetch(`${this.baseUrl}/binance_deposit.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    const data = await this.parseResponse(res);
    return (data.requests as any[]) || [];
  }

  // تحقق SMS
  static async smsVerifyTopup(params: { phone: string; amount: number; providerId: number }): Promise<any> {
    const body = new URLSearchParams({
      phone: params.phone,
      amount: String(params.amount),
      provider_id: String(params.providerId),
    });

    const res = await fetch(`${this.baseUrl}/sms_verify.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    return this.parseResponse(res);
  }

  // محفظة فلوسك (OTP)
  static async floosakInitiate(params: { amount: number; phone: string }): Promise<any> {
    const body = new URLSearchParams({
      action: 'floosak_initiate',
      amount: String(params.amount),
      phone: params.phone,
    });

    const res = await fetch(`${this.baseUrl}/floosak.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    return this.parseResponse(res, 'status');
  }

  static async floosakConfirm(params: { purchaseId: number; otp: string }): Promise<any> {
    const body = new URLSearchParams({
      action: 'floosak_confirm',
      purchase_id: String(params.purchaseId),
      otp: params.otp,
    });

    const res = await fetch(`${this.baseUrl}/floosak.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        ...this.getHeaders(null, true),
      },
      body,
    });

    return this.parseResponse(res);
  }
}
