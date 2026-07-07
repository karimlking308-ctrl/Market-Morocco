import { Product, Store, UserProfile, Coupon, Ad, AppSettings, Order, Message, Conversation } from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  commissionPercent: 5, // 5% commission
  setupFeeMAD: 9, // 9 MAD setup fee
  allowedCategories: [
    'القفطان والجلابة المغربية',
    'الصناعة التقليدية والديكور',
    'الزيوت والأعشاب الطبيعية',
    'المنتجات الغذائية والمحلية',
    'الملابس والأحذية الحديثة',
    'الهواتف والإلكترونيات',
    'مستحضرات التجميل المغربية',
    'أخرى'
  ],
  moroccanCities: [
    'Casablanca (الدار البيضاء)',
    'Rabat (الرباط)',
    'Marrakech (مراكش)',
    'Fes (فاس)',
    'Tangier (طنجة)',
    'Agadir (أكادير)',
    'Oujda (وجدة)',
    'Kenitra (القنيطرة)',
    'Tetouan (تطوان)',
    'Meknes (مكناس)',
    'Safi (آسفي)',
    'Nador (الناظور)',
    'El Jadida (الجديدة)',
    'Laayoune (العيون)'
  ]
};

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'admin-1',
    email: 'admin@market.ma',
    name: 'أمين المشرف (Amine Admin)',
    role: 'admin',
    phone: '+212600112233',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: '2026-01-01T12:00:00Z',
    wishlist: [],
    balance: 81 // From store creations: 9 stores * 9 MAD = 81 MAD + commissions
  },
  {
    id: 'seller-karim',
    email: 'karim@gmail.com',
    name: 'كريم التازي (Karim Tazi)',
    role: 'seller',
    phone: '+212611223344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: '2026-02-15T14:30:00Z',
    storeId: 'karim-caftan',
    wishlist: [],
    balance: 2450 // MAD
  },
  {
    id: 'seller-fatima',
    email: 'fatima@gmail.com',
    name: 'فاطمة الزهراء (Fatima Zahra)',
    role: 'seller',
    phone: '+212655667788',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: '2026-03-10T09:15:00Z',
    storeId: 'fatima-artisanat',
    wishlist: [],
    balance: 1890 // MAD
  },
  {
    id: 'buyer-yassine',
    email: 'yassine@gmail.com',
    name: 'ياسين بنجلون (Yassine Benjelloun)',
    role: 'buyer',
    phone: '+212688990011',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: '2026-04-01T10:00:00Z',
    wishlist: ['prod-caftan-1', 'prod-art-1'],
    balance: 0
  }
];

export const MOCK_STORES: Store[] = [
  {
    id: 'karim-caftan',
    ownerId: 'seller-karim',
    name: 'قفطان التازي (Caftan Tazi)',
    logo: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1590736969955-71cb91d3176d?auto=format&fit=crop&w=1200&h=400&q=80',
    description: 'أرقى وأفخم القفاطين والجلابيات المغربية التقليدية بتصاميم عصرية تناسب كل المناسبات السعيدة.',
    category: 'القفطان والجلابة المغربية',
    city: 'Fes (فاس)',
    slug: 'caftan-tazi',
    status: 'active',
    rating: 4.8,
    ratingCount: 24,
    productCount: 4,
    orderCount: 18,
    createdAt: '2026-02-15T15:00:00Z'
  },
  {
    id: 'fatima-artisanat',
    ownerId: 'seller-fatima',
    name: 'إبداعات تقليدية (Fatima Artisanat)',
    logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&h=400&q=80',
    description: 'صناعة تقليدية مغربية فاخرة مصنوعة بأيادي أمهر الحرفيين من النحاس، الفخار، الجلود والزرابي الأطلسية.',
    category: 'الصناعة التقليدية والديكور',
    city: 'Marrakech (مراكش)',
    slug: 'fatima-artisanat',
    status: 'active',
    rating: 4.9,
    ratingCount: 32,
    productCount: 4,
    orderCount: 29,
    createdAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'argan-essaouira',
    ownerId: 'seller-argan',
    name: 'أركان الصويرة (Argan Essaouira)',
    logo: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=200&h=200&q=80',
    cover: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&h=400&q=80',
    description: 'زيوت أركان طبيعية 100٪ تجميلية وغذائية، مستخرجة مباشرة من تعاونيات الصويرة وتارودانت مع العسل وأملو الحر.',
    category: 'الزيوت والأعشاب الطبيعية',
    city: 'Agadir (أكادير)',
    slug: 'argan-essaouira',
    status: 'active',
    rating: 4.7,
    ratingCount: 15,
    productCount: 3,
    orderCount: 12,
    createdAt: '2026-03-20T11:00:00Z'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-caftan-1',
    storeId: 'karim-caftan',
    storeName: 'قفطان التازي (Caftan Tazi)',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&h=800&q=80',
      'https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&w=600&h=800&q=80'
    ],
    name: 'قفطان ملكي أخضر مطرز بالصقلي الحر',
    description: 'قفطان مغربي ملكي فاخر باللون الأخضر الملكي، مصنوع من ثوب الموبرة الممتاز ومطرز باليد بالصقلي الحر الذهبي والخرز اللامع. يأتي مع حزام مضمة منسقة.',
    price: 1200,
    salePrice: 999,
    inventory: 5,
    category: 'القفطان والجلابة المغربية',
    tags: ['قفطان', 'ملكي', 'تقليدي', 'أعراس', 'مغربي'],
    weight: 1.5,
    colors: ['أخضر ملكي (Green)', 'أحمر غامق (Burgundy)'],
    sizes: ['M', 'L', 'XL'],
    shippingInfo: 'توصيل مجاني لجميع المدن المغربية',
    deliveryDuration: '2-4 أيام',
    status: 'active',
    rating: 4.9,
    ratingCount: 12,
    createdAt: '2026-02-16T10:00:00Z'
  },
  {
    id: 'prod-caftan-2',
    storeId: 'karim-caftan',
    storeName: 'قفطان التازي (Caftan Tazi)',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&h=800&q=80'
    ],
    name: 'جلابة نسائية صيفية بالرندة والعقيق',
    description: 'جلابة مغربية أنيقة وخفيفة من ثوب الكريب الممتاز، مخيطة بالرندة المغربية اليدوية الفاخرة ومزينة بالعقيق الحر والزواق المتناسق. مناسبة للأيام العادية والأعياد.',
    price: 450,
    inventory: 15,
    category: 'القفطان والجلابة المغربية',
    tags: ['جلابة', 'رندة', 'كريب', 'رمضان', 'أعياد'],
    weight: 0.8,
    colors: ['أزرق سماوي (Sky Blue)', 'وردي ناعم (Pink)', 'خزامي (Lilac)'],
    sizes: ['S', 'M', 'L', 'XL'],
    shippingInfo: 'الشحن 25 درهم (مجاني عند شراء قطعتين)',
    deliveryDuration: '1-3 أيام',
    status: 'active',
    rating: 4.7,
    ratingCount: 8,
    createdAt: '2026-02-18T14:00:00Z'
  },
  {
    id: 'prod-art-1',
    storeId: 'fatima-artisanat',
    storeName: 'إبداعات تقليدية (Fatima Artisanat)',
    images: [
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&h=600&q=80',
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    name: 'مصباح نحاسي مغربي تقليدي بنقش يدوي',
    description: 'مصباح (فانوس) مصنوع يدوياً بالكامل من النحاس الأصفر الخالص، يتميز بنقوش وزخارف إسلامية أندلسية هندسية تنشر ظلالاً ساحرة عند إضاءته. يضفي لمسة شرقية دافئة لبيتك.',
    price: 350,
    salePrice: 299,
    inventory: 10,
    category: 'الصناعة التقليدية والديكور',
    tags: ['نحاس', 'مصباح', 'فانوس', 'ديكور', 'صناعة تقليدية', 'مراكش'],
    weight: 2.1,
    colors: ['نحاسي ذهبي (Gold Brass)', 'نحاسي عتيق (Antique Bronze)'],
    sizes: ['صغير (30سم)', 'متوسط (45سم)', 'كبير (60سم)'],
    shippingInfo: 'تغليف آمن ومقاوم للكسر والشحن السريع متوفر',
    deliveryDuration: '2-3 أيام',
    status: 'active',
    rating: 4.9,
    ratingCount: 19,
    createdAt: '2026-03-11T11:00:00Z'
  },
  {
    id: 'prod-art-2',
    storeId: 'fatima-artisanat',
    storeName: 'إبداعات تقليدية (Fatima Artisanat)',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    name: 'طاجين فخار مغربي حر من أسفي للطهي والتقديم',
    description: 'طاجين طيني حر 100٪ من مدينة أسفي المشهورة بالفخار، مقاوم للحرارة ومناسب للطهي فوق الفحم أو البوتاجاز (مع استخدام حديدة حماية). يعطي نكهة لذيذة جداً للأكل التقليدي.',
    price: 120,
    salePrice: 89,
    inventory: 30,
    category: 'الصناعة التقليدية والديكور',
    tags: ['طاجين', 'فخار', 'أسفي', 'طهي', 'مطبخ'],
    weight: 3.5,
    colors: ['طيني طبيعي (Clay)'],
    sizes: ['عائلي كبير', 'متوسط (3 أشخاص)'],
    shippingInfo: 'تغليف خاص بالفقاعات المضادة للصدمات لضمان وصوله سليماً',
    deliveryDuration: '3-5 أيام',
    status: 'active',
    rating: 4.8,
    ratingCount: 11,
    createdAt: '2026-03-14T16:00:00Z'
  },
  {
    id: 'prod-argan-1',
    storeId: 'argan-essaouira',
    storeName: 'أركان الصويرة (Argan Essaouira)',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    name: 'زيت أركان التجميلي النقي 100٪ - 100 مل',
    description: 'زيت أركان بيولوجي مستخلص بالعصر البارد في تعاونيات الصويرة. غني بفيتامين E ومضادات الأكسدة ومثالي لتغذية البشرة وتنعيم الشعر ومحاربة التجاعيد وترطيب الأظافر.',
    price: 150,
    salePrice: 120,
    inventory: 50,
    category: 'الزيوت والأعشاب الطبيعية',
    tags: ['أركان', 'تجميل', 'شعر', 'بشرة', 'بيو', 'الصويرة'],
    weight: 0.25,
    colors: ['شفاف طبيعي'],
    sizes: ['100 مل', '250 مل'],
    shippingInfo: 'قنينة زجاجية مظلمة لحماية الزيت من الأكسدة',
    deliveryDuration: '1-3 أيام',
    status: 'active',
    rating: 4.8,
    ratingCount: 14,
    createdAt: '2026-03-21T09:00:00Z'
  },
  {
    id: 'prod-argan-2',
    storeId: 'argan-essaouira',
    storeName: 'أركان الصويرة (Argan Essaouira)',
    images: [
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=600&h=600&q=80'
    ],
    name: 'عسل السدر المغربي الحر الأصيل - نصف كيلو',
    description: 'عسل سدر طبيعي وحر مستخرج من مناحل شيشاوة وتارودانت الجبلية. معزز طبيعي للمناعة وذو طعم رائع وفوائد علاجية متعددة ومضمون بالجودة العالية.',
    price: 250,
    inventory: 20,
    category: 'المنتجات الغذائية والمحلية',
    tags: ['عسل', 'سدر', 'حر', 'طبيعي', 'علاجي'],
    weight: 0.6,
    colors: ['ذهبي غامق'],
    sizes: ['500 غرام', '1 كيلوغرام'],
    shippingInfo: 'شحن في قوارير معقمة ومحكمة الغلق',
    deliveryDuration: '2-4 أيام',
    status: 'active',
    rating: 4.7,
    ratingCount: 6,
    createdAt: '2026-03-22T13:00:00Z'
  }
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coupon-maroc10',
    code: 'MAROC10',
    discountType: 'percent',
    discountValue: 10,
    expirationDate: '2026-12-31',
    maxUses: 100,
    usedCount: 12,
    status: 'active'
  },
  {
    id: 'coupon-caftan26',
    code: 'TAZI50',
    discountType: 'fixed',
    discountValue: 50, // 50 MAD off
    expirationDate: '2026-09-30',
    storeId: 'karim-caftan',
    maxUses: 50,
    usedCount: 8,
    status: 'active'
  }
];

export const MOCK_ADS: Ad[] = [
  {
    id: 'ad-banner-1',
    title: 'تخفيضات العيد: تسوق أفخم القفاطين بأسعار رائعة',
    image: 'https://images.unsplash.com/photo-1590736969955-71cb91d3176d?auto=format&fit=crop&w=1200&h=300&q=80',
    link: '/store/caftan-tazi',
    location: 'home_banner',
    status: 'active',
    views: 1420,
    clicks: 185,
    provider: 'custom'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    buyerId: 'buyer-yassine',
    buyerName: 'ياسين بنجلون (Yassine)',
    buyerPhone: '+212688990011',
    buyerAddress: 'شارع الزرقطوني، عمارة 45، شقة 3',
    buyerCity: 'Casablanca (الدار البيضاء)',
    storeId: 'karim-caftan',
    storeName: 'قفطان التازي (Caftan Tazi)',
    items: [
      {
        productId: 'prod-caftan-1',
        productName: 'قفطان ملكي أخضر مطرز بالصقلي الحر',
        price: 999,
        quantity: 1,
        color: 'أخضر ملكي (Green)',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=150&h=200&q=80'
      }
    ],
    subtotal: 999,
    shippingFee: 0,
    commissionFee: 49.95, // 5%
    total: 999,
    status: 'confirmed',
    paymentMethod: 'COD',
    createdAt: '2026-06-25T14:00:00Z',
    trackingHistory: [
      { status: 'pending', timestamp: '2026-06-25T14:00:00Z', note: 'تم استقبال الطلب من الزبون بنجاح' },
      { status: 'confirmed', timestamp: '2026-06-26T10:15:00Z', note: 'قام البائع بتأكيد الطلب وتجهيز الشحنة' }
    ]
  },
  {
    id: 'order-2',
    buyerId: 'buyer-yassine',
    buyerName: 'ياسين بنجلون (Yassine)',
    buyerPhone: '+212688990011',
    buyerAddress: 'شارع الزرقطوني، عمارة 45، شقة 3',
    buyerCity: 'Casablanca (الدار البيضاء)',
    storeId: 'fatima-artisanat',
    storeName: 'إبداعات تقليدية (Fatima Artisanat)',
    items: [
      {
        productId: 'prod-art-1',
        productName: 'مصباح نحاسي مغربي تقليدي بنقش يدوي',
        price: 299,
        quantity: 2,
        color: 'نحاسي ذهبي (Gold Brass)',
        size: 'متوسط (45سم)',
        image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=150&h=150&q=80'
      }
    ],
    subtotal: 598,
    shippingFee: 30,
    commissionFee: 29.9, // 5%
    total: 628,
    status: 'delivered',
    paymentMethod: 'COD',
    createdAt: '2026-06-20T11:30:00Z',
    trackingHistory: [
      { status: 'pending', timestamp: '2026-06-20T11:30:00Z', note: 'تم استقبال الطلب من الزبون بنجاح' },
      { status: 'confirmed', timestamp: '2026-06-20T14:22:00Z', note: 'تم تأكيد الطلب من طرف البائع' },
      { status: 'shipped', timestamp: '2026-06-21T09:00:00Z', note: 'تم تسليم الشحنة لشركة التوصيل أمانة' },
      { status: 'delivered', timestamp: '2026-06-23T15:40:00Z', note: 'تم تسليم الطلب للزبون وتحصيل المبلغ بنجاح (الدفع عند الاستلام)' }
    ]
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    buyerId: 'buyer-yassine',
    buyerName: 'ياسين بنجلون',
    sellerId: 'seller-karim',
    sellerName: 'كريم التازي',
    storeId: 'karim-caftan',
    storeName: 'قفطان التازي (Caftan Tazi)',
    lastMessage: 'هل يتوفر القفطان الأخضر في مقاس XL؟',
    lastMessageTime: '2026-07-01T15:30:00Z',
    unreadCountBuyer: 0,
    unreadCountSeller: 1
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'seller-karim',
    receiverId: 'buyer-yassine',
    text: 'مرحباً بك أخي الكريم في متجرنا. نعم كل القفاطين نصنعها يدوياً بجودة عالية.',
    timestamp: '2026-07-01T15:10:00Z',
    read: true
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'buyer-yassine',
    receiverId: 'seller-karim',
    text: 'رائع جداً، هل يتوفر القفطان الأخضر في مقاس XL؟ وكم يستغرق التوصيل للدار البيضاء؟',
    timestamp: '2026-07-01T15:30:00Z',
    read: false
  }
];
