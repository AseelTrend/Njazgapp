import { Category, ServiceItem, OrderItem, TopupOptionsData, WalletTransaction } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'كروت شبكات الإنترنت', image: 'uploads/cat_wifi.png', parent_id: null },
  { id: 2, name: 'يمن موبايل', image: 'uploads/cat_ym.png', parent_id: null },
  { id: 3, name: 'شركة يو (YOU)', image: 'uploads/cat_you.png', parent_id: null },
  { id: 4, name: 'سبأفون', image: 'uploads/cat_sabafon.png', parent_id: null },
  { id: 5, name: 'شحن ألعاب (ببجي وفري فاير)', image: 'uploads/cat_games.png', parent_id: null },
  { id: 6, name: 'بطاقات الهدايا الرقمية', image: 'uploads/cat_cards.png', parent_id: null },
  { id: 7, name: 'خدمات الترفيه والبث', image: 'uploads/cat_streaming.png', parent_id: null },
  { id: 8, name: 'تحويلات وسداد فواتير', image: 'uploads/cat_bills.png', parent_id: null },
  { id: 9, name: 'خدمات رقمية مميزة (جيبي)', image: 'uploads/cat_vip.png', parent_id: null },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  // Yemen Mobile
  {
    id: 101,
    category_id: 2,
    name: 'شحن رصيد يمن موبايل فوري',
    price: 1.20,
    description: 'شحن رصيد مباشر لأي رقم يمن موبايل بالريال أو الدولار بسرعة فائقة مع رسالة تأكيد.',
    image: 'uploads/ym_balance.png',
    min_qty: 1,
    max_qty: 100,
    fields: [
      { id: 1, field_name: 'phone_number', field_label: 'رقم هاتف يمن موبايل (77xxxxxxx)', field_type: 'text', is_required: 1 },
      { id: 2, field_name: 'amount_tier', field_label: 'فئة الرصيد (مثلاً 500 أو 1000 ريال)', field_type: 'text', is_required: 1 },
    ],
  },
  {
    id: 102,
    category_id: 2,
    name: 'باقة مزايا نت 35GB الشهرية',
    price: 6.50,
    description: 'تفعيل فوري لباقة مزايا نت 35 جيجابايت 4G الشهرية لشرائح الدفع المسبق والمفوتر.',
    image: 'uploads/ym_net.png',
    min_qty: 1,
    max_qty: 10,
    fields: [
      { id: 3, field_name: 'phone_number', field_label: 'رقم هاتف يمن موبايل 4G', field_type: 'text', is_required: 1 },
    ],
  },

  // Games
  {
    id: 201,
    category_id: 5,
    name: 'ببجي موبايل 325 شدة (UC)',
    price: 4.80,
    description: 'شحن مباشر برقم الـ ID بدون الحاجة لتسجيل دخول إلى الحساب، وصول فوري خلال ثوانٍ.',
    image: 'uploads/pubg_325.png',
    min_qty: 1,
    max_qty: 50,
    fields: [
      { id: 4, field_name: 'player_id', field_label: 'معرّف اللاعب (Player ID)', field_type: 'text', is_required: 1 },
      { id: 5, field_name: 'player_name', field_label: 'اسم اللاعب للتأكيد (اختياري)', field_type: 'text', is_required: 0 },
    ],
  },
  {
    id: 202,
    category_id: 5,
    name: 'ببجي موبايل 660 شدة (UC)',
    price: 9.50,
    description: 'شحن كود أو مباشر لشدات ببجي العالمية مع هدايا داخل اللعبة.',
    image: 'uploads/pubg_660.png',
    min_qty: 1,
    max_qty: 50,
    fields: [
      { id: 6, field_name: 'player_id', field_label: 'معرّف اللاعب (Player ID)', field_type: 'text', is_required: 1 },
    ],
  },
  {
    id: 203,
    category_id: 5,
    name: 'فري فاير 530 جوهرة (+53 إضافية)',
    price: 5.10,
    description: 'شحن جواهر فري فاير السريع برقم المعرّف لجميع السيرفرات في الشرق الأوسط.',
    image: 'uploads/ff_530.png',
    min_qty: 1,
    max_qty: 50,
    fields: [
      { id: 7, field_name: 'player_id', field_label: 'معرّف اللاعب (Free Fire ID)', field_type: 'text', is_required: 1 },
    ],
  },

  // Network cards
  {
    id: 301,
    category_id: 1,
    name: 'كارت شبكة وايفاي 1000 ميجا',
    price: 0.90,
    description: 'كود بطاقة إنترنت لشبكات المايكروتك المحلية صالح لمدة 24 ساعة.',
    image: 'uploads/wifi_card.png',
    min_qty: 1,
    max_qty: 100,
    fields: [
      { id: 8, field_name: 'network_name', field_label: 'اسم شبكة الوايفاي في منطقتك', field_type: 'text', is_required: 1 },
    ],
  },

  // YOU
  {
    id: 401,
    category_id: 3,
    name: 'رصيد فوري شركة YOU',
    price: 1.10,
    description: 'شحن رصيد وباقات فوري لشركة YOU لجميع الأرقام التي تبدأ بـ 73.',
    image: 'uploads/you_recharge.png',
    min_qty: 1,
    max_qty: 100,
    fields: [
      { id: 9, field_name: 'phone_number', field_label: 'رقم هاتف YOU (73xxxxxxx)', field_type: 'text', is_required: 1 },
      { id: 10, field_name: 'package_type', field_label: 'نوع الباقة أو الرصيد', field_type: 'text', is_required: 1 },
    ],
  },

  // SabaFon
  {
    id: 501,
    category_id: 4,
    name: 'رصيد وباقات سبأفون',
    price: 1.15,
    description: 'شحن رصيد وباقات سوبر نت لخطوط سبأفون الشمال والجنوب.',
    image: 'uploads/sabafon_recharge.png',
    min_qty: 1,
    max_qty: 100,
    fields: [
      { id: 11, field_name: 'phone_number', field_label: 'رقم هاتف سبأفون (71xxxxxxx)', field_type: 'text', is_required: 1 },
    ],
  },

  // Gift cards
  {
    id: 601,
    category_id: 6,
    name: 'بطاقة جوجل بلاي 5 دولار (أمريكي)',
    price: 5.25,
    description: 'كود رقمي فوري صالح للحسابات الأمريكية لشراء التطبيقات والألعاب والكتب.',
    image: 'uploads/google_play_5.png',
    min_qty: 1,
    max_qty: 20,
    fields: [
      { id: 12, field_name: 'email_deliver', field_label: 'بريدك الإلكتروني لاستلام النسخة الاحتياطية', field_type: 'text', is_required: 0 },
    ],
  },
];

export const INITIAL_TOPUP_OPTIONS: TopupOptionsData = {
  balance: 450.00,
  currency_symbol: 'ريال يمني',
  kyc_status: 'approved',
  sms_topup_enabled: true,
  payment_methods: [
    {
      id: 1,
      name: 'الكريمي إكسبرس (حساب وكريمي جوال)',
      description: 'إيداع مباشر عبر رقم حساب الكريمي المصرفي أو تطبيق الكريمي جوال',
      payment_mode: 'manual',
      allowed_currency_codes: ['YER', 'SAR', 'USD'],
      fields: [
        { label: 'رقم الحساب الكريمي', value: '120485923', copyable: true },
        { label: 'اسم صاحب الحساب', value: 'أصيل محمد صالح - نجاز كارد' },
        { label: 'العمولة المصرفية', value: 'يتحمل العميل رسوم الحوالة' },
      ],
    },
    {
      id: 2,
      name: 'محفظة ون كاش (OneCash)',
      description: 'تحويل فوري بين محافظ ون كاش برقم الهاتف أو الحساب',
      payment_mode: 'manual',
      allowed_currency_codes: ['YER'],
      fields: [
        { label: 'رقم محفظة ون كاش', value: '775199244', copyable: true },
        { label: 'اسم الحساب', value: 'نجاز لخدمات الدفع الإلكتروني' },
      ],
    },
    {
      id: 3,
      name: 'محفظة جيب (Jeeb)',
      description: 'تحويل سريع عبر تطبيق جيب للدفع الإلكتروني',
      payment_mode: 'manual',
      allowed_currency_codes: ['YER'],
      fields: [
        { label: 'رقم محفظة جيب', value: '739281720', copyable: true },
        { label: 'اسم الحساب', value: 'إنجاز كارد' },
      ],
    },
    {
      id: 4,
      name: 'شركة النجم للحوالات',
      description: 'إرسال حوالة عبر أي فرع من فروع النجم للحوالات بالاسم ورقم الهاتف',
      payment_mode: 'manual',
      allowed_currency_codes: ['YER', 'SAR'],
      fields: [
        { label: 'اسم المستلم', value: 'أصيل محمد - شبكة نجاز' },
        { label: 'رقم هاتف المستلم', value: '770984120', copyable: true },
        { label: 'المدينة', value: 'صنعاء' },
      ],
    },
  ],
  exchange_rates: [
    { currency_code: 'YER', currency_symbol: 'ريال يمني', rate_to_usd: 0.00187 },
    { currency_code: 'SAR', currency_symbol: 'ريال سعودي', rate_to_usd: 0.266 },
    { currency_code: 'USD', currency_symbol: 'دولار أمريكي', rate_to_usd: 1.0 },
  ],
  usdt: {
    enabled: true,
    min_deposit: 5.00,
    active_request: null,
  },
  binance: {
    enabled: true,
    minimum_amount: 5.00,
  },
  floosak: {
    enabled: true,
    image_url: 'https://njaz.net/assets/images/floosak_logo.png',
  },
  sms_providers: {
    north: [
      { id: 1, name: 'يمن موبايل (شمال)', transfer_account: '777123456', account_holder: 'حساب نجاز كارد' },
      { id: 2, name: 'يو YOU (شمال)', transfer_account: '733987654', account_holder: 'إنجاز للاتصالات' },
      { id: 3, name: 'سبأفون (شمال)', transfer_account: '711554433', account_holder: 'نجاز كارد' },
    ],
    south: [
      { id: 4, name: 'عدن نت / سبأفون جنوب', transfer_account: '718899001', account_holder: 'حساب الجنوب' },
      { id: 5, name: 'واي Y Telecom', transfer_account: '700112233', account_holder: 'تحويل مباشر' },
    ],
    no_region: [
      { id: 6, name: 'خدمات سداد أخرى', transfer_account: '777000111', account_holder: 'الخدمات العامة' },
    ],
  },
};

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 9841,
    ref_id: 'ORD-2026-9841',
    service_id: 201,
    service_name: 'ببجي موبايل 325 شدة (UC)',
    quantity: 1,
    total_price: '4.80',
    status: 'completed',
    created_at: '2026-09-08 19:42',
    delivered_code: 'E7B92-PUBG-325UC-SUCCESS',
  },
  {
    id: 9832,
    ref_id: 'ORD-2026-9832',
    service_id: 102,
    service_name: 'باقة مزايا نت 35GB الشهرية',
    quantity: 1,
    total_price: '6.50',
    status: 'completed',
    created_at: '2026-09-07 14:15',
  },
  {
    id: 9798,
    ref_id: 'ORD-2026-9798',
    service_id: 301,
    service_name: 'كارت شبكة وايفاي 1000 ميجا',
    quantity: 2,
    total_price: '1.80',
    status: 'processing',
    created_at: '2026-09-06 10:20',
  },
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  { id: 101, type: 'credit', amount: '50.00', description: 'إيداع رصيد عبر USDT BEP20', created_at: '2026-09-08 18:22' },
  { id: 102, type: 'debit', amount: '4.80', description: 'شراء ببجي موبايل 325 شدة (UC)', created_at: '2026-09-08 19:42' },
  { id: 103, type: 'credit', amount: '100.00', description: 'شحن رصيد بكود بطاقة', created_at: '2026-09-07 12:00' },
  { id: 104, type: 'debit', amount: '6.50', description: 'تفعيل باقة مزايا نت 35GB الشهرية', created_at: '2026-09-07 14:15' },
  { id: 105, type: 'credit', amount: '15.00', description: 'مكافأة دعوة أصدقاء (إحالة)', created_at: '2026-09-05 16:30' },
];
