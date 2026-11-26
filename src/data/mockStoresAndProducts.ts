import { StoreProfile, ClothingProduct } from '../types/clothing';
import { normalizeGarmentAiSpec } from './aiPromptGuide';

const realSneakersUrl = '/models/white_leather_sneakers.png';

export const INITIAL_STORES: StoreProfile[] = [
  {
    id: 'store-zara',
    slug: 'zara-modern',
    nameFa: 'زارا استودیو مدرن',
    nameEn: 'ZARA Modern Studio',
    city: 'تهران - سعادت‌آباد',
    description: 'کالکشن جدید مینیمال و ترند روز، کت و پالتوهای ساختاریافته، تی‌شرت و جین استاندارد',
    badge: 'برند بین‌المللی',
    logoEmoji: '🏛️',
    themeColor: '#1e293b',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'store-harajuku',
    slug: 'harajuku-streetwear',
    nameFa: 'استودیو استریت‌ویر دنیم',
    nameEn: 'Harajuku Denim Co.',
    city: 'تهران - شهرک غرب',
    description: 'شلوارهای جین ژاپنی بگ و مام‌استایل، تی‌شرت‌های لش اورسایز و کاپشن‌های خلبانی',
    badge: 'استایل خیابانی',
    logoEmoji: '⛩️',
    themeColor: '#0f172a',
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'store-niloufar',
    slug: 'maison-niloufar',
    nameFa: 'مزون لوکس و کلاسیک نیلوفر',
    nameEn: 'Maison Niloufar Couture',
    city: 'تهران - نیاوران',
    description: 'پیراهن‌های آکسفورد الیاف طبیعی، شلوارهای کتان و پارچه‌ای راسته و پالتوهای پشمی کشمیر',
    badge: 'مزون دست‌دوز',
    logoEmoji: '✨',
    themeColor: '#312e81',
    createdAt: '2026-03-01T10:00:00Z',
  },
];

// Helper to safely encode SVGs into valid data URIs that work in all browsers without fragment hash truncation
const toSvg = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;

// High quality transparent SVG clothing assets
const SVG_ASSETS = {
  // 1. Tops
  whiteCrewTee: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="100%" height="100%">
    <defs>
      <linearGradient id="teeG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient>
      <filter id="ds" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.18"/>
      </filter>
    </defs>
    <g filter="url(#ds)">
      <!-- Torso & Sleeves -->
      <path d="M 125,55 Q 200,80 275,55 L 365,115 L 325,175 L 285,145 L 285,385 Q 200,400 115,385 L 115,145 L 75,175 L 35,115 Z" fill="url(#teeG)" stroke="#d1d5db" stroke-width="2"/>
      <!-- Hollow Neckline / Ghost Collar Interior -->
      <ellipse cx="200" cy="58" rx="60" ry="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
      <path d="M 140,58 Q 200,88 260,58" fill="none" stroke="#9ca3af" stroke-width="2.5"/>
      <!-- Subtle fold lines -->
      <path d="M 130,165 Q 150,260 145,340" stroke="#d1d5db" stroke-width="1.5" fill="none"/>
      <path d="M 270,165 Q 250,260 255,340" stroke="#d1d5db" stroke-width="1.5" fill="none"/>
    </g>
  </svg>`),

  blackOversizedTee: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="100%" height="100%">
    <defs>
      <linearGradient id="bTeeG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2a2a2e"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
      <filter id="bds">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.35"/>
      </filter>
    </defs>
    <g filter="url(#bds)">
      <path d="M 115,50 Q 200,75 285,50 L 380,120 L 335,190 L 290,155 L 290,395 Q 200,410 110,395 L 110,155 L 65,190 L 20,120 Z" fill="url(#bTeeG)" stroke="#3f3f46" stroke-width="2"/>
      <ellipse cx="200" cy="55" rx="68" ry="20" fill="#18181b" stroke="#3f3f46" stroke-width="2"/>
      <path d="M 132,55 Q 200,85 268,55" fill="none" stroke="#52525b" stroke-width="2.5"/>
      <path d="M 195,120 L 195,350" stroke="#27272a" stroke-width="1" stroke-dasharray="3,3"/>
    </g>
  </svg>`),

  blueOxfordShirt: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="100%" height="100%">
    <defs>
      <linearGradient id="shG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="60%" stop-color="#60a5fa"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
    <g>
      <path d="M 120,50 L 200,70 L 280,50 L 370,110 L 330,180 L 285,150 L 285,390 Q 200,405 115,390 L 115,150 L 70,180 L 30,110 Z" fill="url(#shG)" stroke="#2563eb" stroke-width="2"/>
      <!-- Crisp Oxford Collar -->
      <polygon points="135,48 200,72 170,105 130,55" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
      <polygon points="265,48 200,72 230,105 270,55" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
      <!-- Button Placket -->
      <line x1="200" y1="72" x2="200" y2="395" stroke="#1d4ed8" stroke-width="3"/>
      <circle cx="200" cy="120" r="4" fill="#ffffff" stroke="#1e40af" stroke-width="1"/>
      <circle cx="200" cy="180" r="4" fill="#ffffff" stroke="#1e40af" stroke-width="1"/>
      <circle cx="200" cy="240" r="4" fill="#ffffff" stroke="#1e40af" stroke-width="1"/>
      <circle cx="200" cy="300" r="4" fill="#ffffff" stroke="#1e40af" stroke-width="1"/>
    </g>
  </svg>`),

  // 2. Bottoms
  blueJeans: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520" width="100%" height="100%">
    <defs>
      <linearGradient id="jeanG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="40%" stop-color="#1d4ed8"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <filter id="jds">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.25"/>
      </filter>
    </defs>
    <g filter="url(#jds)">
      <!-- Waistband & Legs -->
      <path d="M 85,25 Q 190,32 295,25 L 305,75 L 300,480 L 225,485 L 205,175 Q 190,165 175,175 L 155,485 L 80,480 L 75,75 Z" fill="url(#jeanG)" stroke="#172554" stroke-width="2"/>
      <!-- Hollow Waistband Cavity -->
      <ellipse cx="190" cy="25" rx="105" ry="14" fill="#1e3a8a" stroke="#d97706" stroke-width="2"/>
      <!-- Denim Seams & Rivets -->
      <path d="M 190,35 L 190,165" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2"/>
      <path d="M 85,75 Q 130,95 155,75" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
      <path d="M 295,75 Q 250,95 225,75" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
      <circle cx="190" cy="50" r="4" fill="#f59e0b"/>
    </g>
  </svg>`),

  blackTrousers: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520" width="100%" height="100%">
    <defs>
      <linearGradient id="trG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#27272a"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <g>
      <path d="M 90,25 Q 190,30 290,25 L 300,75 L 295,485 L 225,490 L 205,170 Q 190,160 175,170 L 155,490 L 85,485 L 80,75 Z" fill="url(#trG)" stroke="#3f3f46" stroke-width="2"/>
      <ellipse cx="190" cy="25" rx="100" ry="13" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <!-- Tailored Crease Lines -->
      <line x1="120" y1="80" x2="120" y2="480" stroke="#3f3f46" stroke-width="1.5"/>
      <line x1="260" y1="80" x2="260" y2="480" stroke="#3f3f46" stroke-width="1.5"/>
    </g>
  </svg>`),

  cargoPants: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 520" width="100%" height="100%">
    <defs>
      <linearGradient id="cgG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="60%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <g>
      <path d="M 85,25 Q 190,32 295,25 L 310,75 L 305,485 L 225,490 L 205,175 Q 190,165 175,175 L 155,490 L 75,485 L 70,75 Z" fill="url(#cgG)" stroke="#0f172a" stroke-width="2"/>
      <ellipse cx="190" cy="25" rx="105" ry="14" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <!-- Cargo 3D Side Pockets -->
      <rect x="60" y="220" width="35" height="60" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
      <rect x="285" y="220" width="35" height="60" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
    </g>
  </svg>`),

  // 3. Outerwear (Layer 40)
  blackDenimJacket: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 460" width="100%" height="100%">
    <defs>
      <linearGradient id="jktG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2d3748"/>
        <stop offset="50%" stop-color="#1a202c"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
      <filter id="jds2">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity="0.4"/>
      </filter>
    </defs>
    <g filter="url(#jds2)">
      <path d="M 125,45 Q 220,70 315,45 L 420,110 L 375,200 L 320,160 L 320,385 Q 220,400 120,385 L 120,160 L 65,200 L 20,110 Z" fill="url(#jktG)" stroke="#4b5563" stroke-width="2.5"/>
      <!-- Open Collar Structure -->
      <polygon points="140,45 220,75 180,120 130,55" fill="#374151" stroke="#9ca3af" stroke-width="2"/>
      <polygon points="300,45 220,75 260,120 310,55" fill="#374151" stroke="#9ca3af" stroke-width="2"/>
      <!-- Open Front Gap revealing inner T-shirt -->
      <path d="M 180,120 L 195,385 L 245,385 L 260,120 Z" fill="none" stroke="#6b7280" stroke-width="2" stroke-dasharray="6,4"/>
      <!-- Chest Flap Pockets -->
      <rect x="135" y="160" width="45" height="40" rx="3" fill="#1f2937" stroke="#6b7280" stroke-width="1.5"/>
      <rect x="260" y="160" width="45" height="40" rx="3" fill="#1f2937" stroke="#6b7280" stroke-width="1.5"/>
    </g>
  </svg>`),

  camelOvercoat: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 520" width="100%" height="100%">
    <defs>
      <linearGradient id="coatG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b4834b"/>
        <stop offset="50%" stop-color="#9a6933"/>
        <stop offset="100%" stop-color="#7c4f1c"/>
      </linearGradient>
    </defs>
    <g>
      <path d="M 125,40 Q 220,65 315,40 L 420,110 L 375,200 L 330,165 L 335,490 Q 220,505 105,490 L 110,165 L 65,200 L 20,110 Z" fill="url(#coatG)" stroke="#603813" stroke-width="2.5"/>
      <!-- Long Lapels -->
      <polygon points="140,40 220,90 170,180 125,60" fill="#c9955c" stroke="#603813" stroke-width="2"/>
      <polygon points="300,40 220,90 270,180 315,60" fill="#c9955c" stroke="#603813" stroke-width="2"/>
      <line x1="220" y1="180" x2="220" y2="495" stroke="#4a2800" stroke-width="2.5"/>
    </g>
  </svg>`),

  // 4. Shoes (Layer 10)
  whiteSneakers: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180" width="100%" height="100%">
    <defs>
      <linearGradient id="snkG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient>
      <filter id="snd">
        <feDropShadow dx="0" dy="5" stdDeviation="6" flood-opacity="0.25"/>
      </filter>
    </defs>
    <g filter="url(#snd)">
      <!-- Left Shoe -->
      <path d="M 60,60 Q 100,50 140,70 L 180,90 Q 190,110 185,130 L 50,135 Q 40,90 60,60 Z" fill="url(#snkG)" stroke="#d1d5db" stroke-width="2"/>
      <rect x="45" y="130" width="145" height="18" rx="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Right Shoe -->
      <path d="M 340,60 Q 300,50 260,70 L 220,90 Q 210,110 215,130 L 350,135 Q 360,90 340,60 Z" fill="url(#snkG)" stroke="#d1d5db" stroke-width="2"/>
      <rect x="210" y="130" width="145" height="18" rx="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
    </g>
  </svg>`),

  blackLoafers: toSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 180" width="100%" height="100%">
    <defs>
      <linearGradient id="lfG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#27272a"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <g>
      <!-- Left Loafer -->
      <path d="M 65,65 Q 110,55 145,75 L 185,95 Q 195,115 190,135 L 55,140 Q 45,95 65,65 Z" fill="url(#lfG)" stroke="#3f3f46" stroke-width="2"/>
      <rect x="50" y="135" width="145" height="14" rx="3" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <rect x="105" y="75" width="25" height="8" rx="2" fill="#d4af37"/>
      <!-- Right Loafer -->
      <path d="M 335,65 Q 290,55 255,75 L 215,95 Q 205,115 210,135 L 345,140 Q 355,95 335,65 Z" fill="url(#lfG)" stroke="#3f3f46" stroke-width="2"/>
      <rect x="205" y="135" width="145" height="14" rx="3" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
      <rect x="270" y="75" width="25" height="8" rx="2" fill="#d4af37"/>
    </g>
  </svg>`),
};

export const INITIAL_PRODUCTS: ClothingProduct[] = [
  // --- ZARA MODERN STUDIO (store-zara) ---
  {
    id: 'prod-zara-tshirt-white',
    storeSlug: 'zara-modern',
    storeName: 'زارا استودیو مدرن',
    title: 'تی‌شرت نخی بیسیک سفید',
    price: 680000,
    category: 'tshirt',
    slot: 'slot_top',
    imageUrl: SVG_ASSETS.whiteCrewTee,
    placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'ZAR-TSH-001',
      name_fa: 'تی‌شرت نخی بیسیک سفید',
      name_en: 'Basic Cotton Crewneck White Tee',
      slot: 'slot_top',
      category: 'tshirt',
      placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
      style_details: { primary_color_fa: 'سفید صدفی', primary_color_en: 'Optic White', color_hex: '#ffffff', fabric_type: '۱۰۰٪ نخ پنبه ارگانیک', estimated_price_toman: 680000 },
    }),
    createdAt: '2026-01-11T12:00:00Z',
  },
  {
    id: 'prod-zara-jeans-indigo',
    storeSlug: 'zara-modern',
    storeName: 'زارا استودیو مدرن',
    title: 'شلوار جین راسته نیل',
    price: 1450000,
    category: 'jeans',
    slot: 'slot_bottom',
    imageUrl: SVG_ASSETS.blueJeans,
    placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'ZAR-JNS-002',
      name_fa: 'شلوار جین راسته نیل',
      name_en: 'Straight Fit Indigo Jeans',
      slot: 'slot_bottom',
      category: 'jeans',
      placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
      style_details: { primary_color_fa: 'آبی نیل متوسط', primary_color_en: 'Mid Indigo Blue', color_hex: '#1d4ed8', fabric_type: 'دنیم ۱۲.۵ اونسی', estimated_price_toman: 1450000 },
    }),
    createdAt: '2026-01-11T12:05:00Z',
  },
  {
    id: 'prod-zara-jacket-black',
    storeSlug: 'zara-modern',
    storeName: 'زارا استودیو مدرن',
    title: 'کت دنیم سنگشور مشکی',
    price: 2150000,
    category: 'jacket',
    slot: 'slot_outer',
    imageUrl: SVG_ASSETS.blackDenimJacket,
    placement: { anchor: 'shoulders', offset_x_percent: 0, offset_y_percent: 30, scale: 1.05, z_index: 40 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'ZAR-JKT-003',
      name_fa: 'کت دنیم سنگشور مشکی',
      name_en: 'Washed Black Denim Trucker Jacket',
      slot: 'slot_outer',
      category: 'jacket',
      placement: { anchor: 'shoulders', offset_x_percent: 0, offset_y_percent: 30, scale: 1.05, z_index: 40 },
      style_details: { primary_color_fa: 'مشکی زغالی', primary_color_en: 'Washed Charcoal', color_hex: '#1f2937', fabric_type: 'جین سنگشور ضخیم', estimated_price_toman: 2150000 },
    }),
    createdAt: '2026-01-11T12:10:00Z',
  },
  {
    id: 'prod-zara-sneakers-white',
    storeSlug: 'zara-modern',
    storeName: 'زارا استودیو مدرن',
    title: 'کتانی لژدار چرم سفید',
    price: 1850000,
    category: 'shoes',
    slot: 'slot_shoes',
    imageUrl: realSneakersUrl,
    placement: { anchor: 'feet', offset_x_percent: 0, offset_y_percent: 91, scale: 0.95, z_index: 22 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'ZAR-SHS-004',
      name_fa: 'کتانی لژدار چرم سفید',
      name_en: 'White Platform Minimalist Leather Sneakers',
      slot: 'slot_shoes',
      category: 'shoes',
      placement: { anchor: 'feet', offset_x_percent: 0, offset_y_percent: 91, scale: 0.95, z_index: 22 },
      style_details: { primary_color_fa: 'سفید خالص', primary_color_en: 'Pure White', color_hex: '#f8fafc', fabric_type: 'چرم مصنوعی و کفی EVA', estimated_price_toman: 1850000 },
    }),
    createdAt: '2026-01-11T12:15:00Z',
  },

  // --- HARAJUKU DENIM (store-harajuku) ---
  {
    id: 'prod-harajuku-tshirt-black',
    storeSlug: 'harajuku-streetwear',
    storeName: 'استودیو استریت‌ویر دنیم',
    title: 'تی‌شرت لش اورسایز مشکی مات',
    price: 790000,
    category: 'tshirt',
    slot: 'slot_top',
    imageUrl: SVG_ASSETS.blackOversizedTee,
    placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'HRJ-TSH-010',
      name_fa: 'تی‌شرت لش اورسایز مشکی مات',
      name_en: 'Boxy Heavyweight Matte Black Tee',
      slot: 'slot_top',
      category: 'tshirt',
      placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
      style_details: { primary_color_fa: 'مشکی مات', primary_color_en: 'Matte Black', color_hex: '#18181b', fabric_type: 'نخ ۲۸۰ گرمی پنبه', estimated_price_toman: 790000 },
    }),
    createdAt: '2026-02-16T10:00:00Z',
  },
  {
    id: 'prod-harajuku-cargo-pants',
    storeSlug: 'harajuku-streetwear',
    storeName: 'استودیو استریت‌ویر دنیم',
    title: 'شلوار کارگو چندجیب طوسی تیره',
    price: 1680000,
    category: 'pants',
    slot: 'slot_bottom',
    imageUrl: SVG_ASSETS.cargoPants,
    placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'HRJ-CRG-011',
      name_fa: 'شلوار کارگو چندجیب طوسی تیره',
      name_en: 'Multi-Pocket Tactical Cargo Trousers',
      slot: 'slot_bottom',
      category: 'pants',
      placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
      style_details: { primary_color_fa: 'طوسی تیره متالیک', primary_color_en: 'Slate Dark Grey', color_hex: '#334155', fabric_type: 'کتان ریپ‌استاپ ضدسایش', estimated_price_toman: 1680000 },
    }),
    createdAt: '2026-02-16T10:10:00Z',
  },

  // --- MAISON NILOUFAR (store-niloufar) ---
  {
    id: 'prod-niloufar-shirt-blue',
    storeSlug: 'maison-niloufar',
    storeName: 'مزون لوکس و کلاسیک نیلوفر',
    title: 'پیراهن رسمی آکسفورد آبی آسمانی',
    price: 1250000,
    category: 'shirt',
    slot: 'slot_top',
    imageUrl: SVG_ASSETS.blueOxfordShirt,
    placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'NLF-SHR-020',
      name_fa: 'پیراهن رسمی آکسفورد آبی آسمانی',
      name_en: 'Classic Sky Blue Two-Ply Oxford Shirt',
      slot: 'slot_top',
      category: 'shirt',
      placement: { anchor: 'torso', offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
      style_details: { primary_color_fa: 'آبی روشن', primary_color_en: 'Sky Blue', color_hex: '#60a5fa', fabric_type: 'آکسفورد دولای پنبه مصری', estimated_price_toman: 1250000 },
    }),
    createdAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 'prod-niloufar-trousers-black',
    storeSlug: 'maison-niloufar',
    storeName: 'مزون لوکس و کلاسیک نیلوفر',
    title: 'شلوار پارچه‌ای راسته مشکی رسمی',
    price: 1890000,
    category: 'pants',
    slot: 'slot_bottom',
    imageUrl: SVG_ASSETS.blackTrousers,
    placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'NLF-TRS-021',
      name_fa: 'شلوار پارچه‌ای راسته مشکی رسمی',
      name_en: 'Tailored Wool-Blend Straight Trousers',
      slot: 'slot_bottom',
      category: 'pants',
      placement: { anchor: 'waist', offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
      style_details: { primary_color_fa: 'مشکی رسمی', primary_color_en: 'Formal Noir', color_hex: '#18181b', fabric_type: 'فاستونی و پشم مرینوس', estimated_price_toman: 1890000 },
    }),
    createdAt: '2026-03-02T09:10:00Z',
  },
  {
    id: 'prod-niloufar-coat-camel',
    storeSlug: 'maison-niloufar',
    storeName: 'مزون لوکس و کلاسیک نیلوفر',
    title: 'پالتو پشمی شتری کلاسیک',
    price: 3850000,
    category: 'coat',
    slot: 'slot_outer',
    imageUrl: SVG_ASSETS.camelOvercoat,
    placement: { anchor: 'shoulders', offset_x_percent: 0, offset_y_percent: 30, scale: 1.05, z_index: 40 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'NLF-COT-022',
      name_fa: 'پالتو پشمی شتری کلاسیک',
      name_en: 'Classic Camel Wool Hand-Tailored Overcoat',
      slot: 'slot_outer',
      category: 'coat',
      placement: { anchor: 'shoulders', offset_x_percent: 0, offset_y_percent: 30, scale: 1.05, z_index: 40 },
      style_details: { primary_color_fa: 'شتری اعلا', primary_color_en: 'Camel Tan', color_hex: '#9a6933', fabric_type: 'پشم و کشمیر ۹۰/۱۰', estimated_price_toman: 3850000 },
    }),
    createdAt: '2026-03-02T09:15:00Z',
  },
  {
    id: 'prod-niloufar-loafers-black',
    storeSlug: 'maison-niloufar',
    storeName: 'مزون لوکس و کلاسیک نیلوفر',
    title: 'کفش لوفر چرم طبیعی مشکی',
    price: 2450000,
    category: 'shoes',
    slot: 'slot_shoes',
    imageUrl: SVG_ASSETS.blackLoafers,
    placement: { anchor: 'feet', offset_x_percent: 0, offset_y_percent: 88, scale: 0.85, z_index: 10 },
    spec: normalizeGarmentAiSpec({
      garment_id: 'NLF-LFR-023',
      name_fa: 'کفش لوفر چرم طبیعی مشکی',
      name_en: 'Handmade Black Calfskin Leather Loafers',
      slot: 'slot_shoes',
      category: 'shoes',
      placement: { anchor: 'feet', offset_x_percent: 0, offset_y_percent: 88, scale: 0.85, z_index: 10 },
      style_details: { primary_color_fa: 'مشکی براق', primary_color_en: 'Black Polish', color_hex: '#18181b', fabric_type: 'چرم طبیعی گوساله و سگک استیل', estimated_price_toman: 2450000 },
    }),
    createdAt: '2026-03-02T09:20:00Z',
  },
];
