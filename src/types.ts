export interface UserProfile {
  name: string;
  balance: string | number;
  uid?: string;
  email?: string;
  phone?: string;
  username?: string;
  role?: string;
  avatar?: string;
}

export interface UserDevice {
  id: number;
  device_fingerprint?: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  status: 'approved' | 'blocked' | string;
  is_first_device: number | string | boolean;
  last_seen?: string;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  parent_id?: number | null;
  description?: string;
}

export interface ServiceField {
  id?: number;
  field_name: string;
  field_label: string;
  field_type?: string;
  is_required: number | boolean;
}

export interface ServiceItem {
  id: number;
  category_id?: number;
  name: string;
  price: string | number;
  description?: string;
  image?: string;
  min_qty?: number;
  max_qty?: number;
  fields: ServiceField[];
}

export interface OrderItem {
  id: number;
  ref_id?: string;
  service_id: number;
  service_name: string;
  quantity: number;
  total_price: string | number;
  status: 'completed' | 'pending' | 'processing' | 'rejected' | 'cancelled' | 'failed' | string;
  created_at?: string;
  delivered_code?: string;
}

export interface WalletTransaction {
  id: number | string;
  type: 'credit' | 'debit' | 'topup' | 'refund' | 'prize' | 'referral' | 'referral_welcome' | string;
  amount: number | string;
  description?: string;
  created_at?: string;
}

export interface PaymentMethodField {
  label: string;
  value: string;
  copyable?: boolean;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  payment_mode?: 'manual' | 'auto' | string;
  image_url?: string;
  allowed_currency_codes?: string[];
  fields?: PaymentMethodField[];
}

export interface ExchangeRate {
  currency_code: string;
  currency_symbol: string;
  rate_to_usd: number | string;
}

export interface SmsProvider {
  id: number;
  name: string;
  transfer_account?: string;
  account_holder?: string;
}

export interface TopupOptionsData {
  balance: number | string;
  currency_symbol: string;
  kyc_status: 'approved' | 'pending' | 'rejected' | 'unverified' | string;
  payment_methods: PaymentMethod[];
  exchange_rates: ExchangeRate[];
  sms_topup_enabled?: boolean;
  sms_providers?: {
    north?: SmsProvider[];
    south?: SmsProvider[];
    no_region?: SmsProvider[];
    [key: string]: SmsProvider[] | undefined;
  };
  usdt?: {
    enabled?: boolean;
    min_deposit?: number;
    active_request?: {
      id: number;
      wallet_address: string;
      unique_amount: string | number;
      expires_at: string;
    } | null;
  };
  binance?: {
    enabled?: boolean;
    minimum_amount?: number;
  };
  floosak?: {
    enabled?: boolean;
    image_url?: string;
  };
}
