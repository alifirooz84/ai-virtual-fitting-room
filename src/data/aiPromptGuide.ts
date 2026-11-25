import { GarmentAiSpec, GarmentSlot } from '../types/clothing';

/**
 * Master AI Image Generation Prompt for 3D Ghost Mannequin Apparel (Zero-Tilt & Symmetrical Orthographic View)
 * Solves:
 * 1. Crooked/Tilted 3/4 poses (locks camera to strict 0° frontal orthographic view, bilateral symmetry).
 * 2. Asymmetrical shoulders or tilted hem (locks left and right shoulders to the exact same horizontal height).
 * 3. Ghost mannequin hollow interior (reveals inner collar/lining in 3D volume without any human body).
 * 4. 100% Transparent alpha background with zero white box, zero frame, zero borders.
 */
export const GHOST_MANNEQUIN_IMAGE_PROMPT_EN = `
Professional commercial fashion catalog photography of a [EXACT_CLOTHING_ITEM_NAME_AND_COLOR], displayed on an invisible 3D ghost mannequin with realistic 3-dimensional volume and hollow interior collar revealing inside neck lining and tag.

CAMERA & PERSPECTIVE (MANDATORY ZERO-TILT RULES):
- Strict 0-degree frontal orthographic eye-level camera view (0° yaw, 0° pitch, 0° roll).
- Absolutely NO 3/4 angle, NO three-quarter perspective, NO tilted mannequin, NO turned torso.
- Perfect bilateral mirror symmetry: left and right shoulder seams must be on the EXACT same horizontal pixel line.
- Both sleeves drape downward symmetrically at identical 15-degree angles from the torso.
- Bottom hem and waistband are strictly 100% horizontal and level with the ground plane (0° slope).

FRAMING & CANVASS RATIO (MANDATORY ZERO WHITE BOX TRANSPARENCY):
- Square 1:1 aspect ratio (1024x1024 pixels).
- Centered perfectly on canvas with clean margins.
- Tops: Collar neckline starts at 10% from the top canvas border; bottom hem terminates at 70% from the top border.
- Bottoms: Waistband starts at 10% from the top border; ankle cuffs terminate at 92% from the top border.
- MANDATORY ALPHA TRANSPARENCY: The garment MUST be completely isolated on a 100% transparent alpha PNG background (RGBA, alpha = 0 for every pixel outside the garment).
- STRICT PROHIBITION: Absolutely NO white background box, NO rectangular white card, NO white frame, NO opaque borders, NO background square, NO studio backdrop behind the garment. The clothing silhouette must float cleanly on pure transparency with no square bounding container.

FABRIC & LIGHTING:
- Ultra-high-resolution realistic fabric texture, natural micro-creases, authentic seams and stitching.
- Soft diffuse studio high-key lighting, balanced from left and right, completely eliminate one-sided harsh shadows.

NEGATIVE PROMPTS (MUST AVOID):
white background, white box, white frame, rectangular border, photo card, opaque backdrop, solid white square, white edges, framing, backdrop, cardboard border, photo outline, solid white canvas, white card overlay, 3/4 view, three-quarter angle, turned body, tilted shoulders, angled torso, dynamic pose, asymmetrical, slanted hem, skewed perspective, side angle, diagonal horizon, one arm raised, bent pose, human body, skin, face, hands, visible mannequin, dummy stand, hanger, floor shadow, cast shadow, dark background, checkerboard pattern.
`.trim();

export const GHOST_MANNEQUIN_IMAGE_PROMPT_FA = `
دستورالعمل تولید عکس سه‌بعدی مانکن نامرئی (کاملاً صاف و مستقیم، بدون کجی و بدون کادر سفید دور لباس):

این پرامپت خطاهای رایج هوش مصنوعی را کاملاً مسدود می‌کند:
۱. بدون کادر سفید دور لباس (Zero White Box): پرامپت هوش مصنوعی را ملزم می‌کند خروجی را به صورت PNG کاملاً شفاف (Alpha = 0) بدهد تا کادر سفید روی کمر شلوار نیفتد.
۲. به هیچ وجه عکس در زاویه ۳/۴ رخ یا کج تولید نمی‌شود (0° Frontal Orthographic).
۳. شانه‌های چپ و راست و لبه پایینی لباس دقیقاً در یک خط تراز افقی قرار می‌گیرند.
۴. لبه کمر شلوار و پایینی تی‌شرت کاملاً افقی و موازی خط افق هستند تا بدون نیاز به هیچ جابجایی دستی روی هم بنشینند.
۵. داخل یقه لباس خالی و سه‌بعدی است (Ghost Mannequin 3D Interior).

نکته مهم: سیستم استودیو پرو ما به پاک‌کن خودکار هوشمند مجهز شده است؛ یعنی حتی اگر هوش مصنوعی عکسی با پس‌زمینه یا کادر سفید به شما داد، سیستم به محض آپلود، کادر سفید را به طور خودکار پاک و شفاف می‌کند!

نحوه استفاده:
عبارت [EXACT_CLOTHING_ITEM_NAME_AND_COLOR] در متن انگلیسی را با نام و رنگ لباستان عوض کنید (مثلاً: beige oversized fleece hoodie) و کل پرامپت انگلیسی را به Gemini، ChatGPT، Midjourney یا Flux بدهید.
`.trim();

/**
 * The Master Multimodal Prompt to give to any AI (Gemini 1.5/2.0, ChatGPT 4o, Claude 3.5 Sonnet)
 * along with the clothing photo. It outputs the exact companion JSON file needed for the fitting room!
 */
export const AI_COMPANION_SPEC_PROMPT_FA = `
شما یک هوش مصنوعی متخصص در تحلیل پوشاک و سیستم‌های پرو مجازی سه‌بعدی (3D VTON Auto-Snap Engine) هستید.
عکس پیوست‌شده از لباس (خروجی کاملاً مستقیم و متقارن مانکن نامرئی شفاف) را به دقت آنالیز کنید و مشخصات کالیبراسیون و انطباق پرو را با رعایت تناسبات طلایی آناتومی بدن (نسبت ۴۰٪ بالاتنه به ۶۰٪ پایین‌تنه) دقیقاً در قالب ساختار JSON زیر بازگردانید. هیچ متن اضافه‌ای خارج از ساختار JSON ننویسید.

قوانین انطباق خودکار خط کمر، تناسب عرضی و لایه‌بندی فیزیکی بدون نیاز به جابجایی دستی (Auto-Snap Layer Hierarchy):
۱. هودی، تی‌شرت، دورس، پیراهن، سویشرت، پولوشرت (بالاتنه):
   - "slot": "slot_top"
   - لایه فیزیکی: روی کمر شلوار قرار می‌گیرد (Z-Index: 30)
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 27, "scale": 0.85, "z_index": 30 }
   - "replacement_rules.replaces_slot": "slot_top"

۲. شلوار، جین، اسلش، بگ، کارگو، دامن (پایین‌تنه):
   - "slot": "slot_bottom"
   - لایه فیزیکی: کمر شلوار دقیقاً زیر لبه پایینی هودی/تی‌شرت فیکس می‌شود و پاهای بلند و کشیده می‌سازد (Z-Index: 20)
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 60, "scale": 1.22, "z_index": 20 }
   - "replacement_rules.replaces_slot": "slot_bottom"

۳. کت، کاپشن، پالتو، بارانی، پَفر (لباس‌رو):
   - "slot": "slot_outer"
   - لایه فیزیکی: روی تی‌شرت و شلوار قرار می‌گیرد (Z-Index: 40)
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 27, "scale": 0.92, "z_index": 40 }
   - "replacement_rules.replaces_slot": "slot_outer"

۴. کفش، کتانی، بوت، اسنیکرز (کفش):
   - "slot": "slot_shoes"
   - لایه فیزیکی: دقیقاً زیر دمپای شلوار چفت می‌شود بدون هیچ فاصله خالی معلق (Z-Index: 10)
   - "placement": { "anchor": "feet", "offset_x_percent": 0, "offset_y_percent": 84, "scale": 0.82, "z_index": 10 }
   - "replacement_rules.replaces_slot": "slot_shoes"

ساختار خروجی JSON که باید بازگردانید:
\`\`\`json
{
  "garment_id": "شناسه، مثلا: TOP-TSH-01 یا PNT-JEAN-02",
  "name_fa": "نام دقیق فارسی لباس بر اساس عکس (مثلا: هودی کلاه‌دار دورس بژ)",
  "name_en": "English Product Name",
  "category": "tshirt" | "shirt" | "hoodie" | "sweater" | "pants" | "jeans" | "shorts" | "skirt" | "jacket" | "coat" | "shoes",
  "slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
  "layer_level": "mid_top" | "bottom" | "outerwear" | "shoes",
  "placement": {
    "anchor": "torso" | "waist" | "shoulders" | "feet",
    "offset_x_percent": 0,
    "offset_y_percent": 30,
    "scale": 1.0,
    "z_index": 30
  },
  "replacement_rules": {
    "replaces_slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
    "compatible_slots": ["slot_top", "slot_bottom", "slot_outer", "slot_shoes"]
  },
  "style_details": {
    "primary_color_fa": "نام رنگ اصلی فارسی",
    "primary_color_en": "Color in English",
    "color_hex": "#RRGGBB",
    "fabric_type": "جنس پارچه (مثلا: دورس پنبه، دنیم سنگشور، کتان)",
    "fit_style": "regular" | "oversized" | "slim" | "relaxed",
    "season": "spring_summer" | "fall_winter" | "all_season",
    "estimated_price_toman": 1450000
  }
}
\`\`\`
`.trim();

export const AI_COMPANION_SPEC_PROMPT_EN = `
You are a Fashion AI and 3D Virtual Try-On Calibration Engine.
Analyze the attached symmetrical front-facing 3D clothing photograph and output a strict JSON calibration file adhering to the Human Fashion Golden Anatomy Ratio (40% Torso to 60% Leg vertical ratio).
Return ONLY valid JSON with no markdown wrapping.

CANONICAL ANCHOR POSITIONS (ANATOMICAL GOLDEN RATIO):
1. Tops / Hoodies / Shirts / Sweatshirts (Torso Layer):
   - "slot": "slot_top"
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 27, "scale": 0.85, "z_index": 30 }
   - "replaces_slot": "slot_top"

2. Bottoms / Pants / Jeans (Long Leg Layer - Waist meets top hem):
   - "slot": "slot_bottom"
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 60, "scale": 1.22, "z_index": 20 }
   - "replaces_slot": "slot_bottom"

3. Outerwear / Open Jackets / Overcoats (Outer Layer):
   - "slot": "slot_outer"
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 27, "scale": 0.92, "z_index": 40 }
   - "replaces_slot": "slot_outer"

4. Footwear / Shoes / Sneakers (Tucked flush under pant cuffs):
   - "slot": "slot_shoes"
   - "placement": { "anchor": "feet", "offset_x_percent": 0, "offset_y_percent": 84, "scale": 0.82, "z_index": 10 }
   - "replaces_slot": "slot_shoes"
`.trim();

/**
 * Validates and normalizes any user-uploaded JSON file into a valid GarmentAiSpec.
 * Automatically snaps tops and bottoms into seamless alignment with ZERO manual adjustments.
 */
export function normalizeGarmentAiSpec(inputJson: any, fallbackName: string = 'لباس جدید'): GarmentAiSpec {
  let json: any = {};
  try {
    json = typeof inputJson === 'string' ? JSON.parse(inputJson) : (inputJson || {});
  } catch {
    json = {};
  }

  let slot: GarmentSlot = 'slot_top';
  const rawSlot = (json.slot || '').toLowerCase();
  const rawCat = (json.category || '').toLowerCase();
  const rawName = (json.name_fa || json.name_en || fallbackName).toLowerCase();

  // Smart Slot Classification: Hoodies & Sweatshirts are strictly Tops (NOT Outerwear!)
  if (rawSlot.includes('bottom') || rawCat.includes('pant') || rawCat.includes('jean') || rawCat.includes('skirt') || rawCat.includes('short') || rawName.includes('شلوار') || rawName.includes('جین') || rawName.includes('دامن') || rawName.includes('اسلش') || rawName.includes('بگ') || rawName.includes('کارگو')) {
    slot = 'slot_bottom';
  } else if (rawSlot.includes('outer') || rawCat.includes('jacket') || rawCat.includes('coat') || rawCat.includes('blazer') || rawName.includes('کت') || rawName.includes('کاپشن') || rawName.includes('پالتو') || rawName.includes('بارانی') || rawName.includes('پفر') || rawName.includes('بادگیر')) {
    slot = 'slot_outer';
  } else if (rawSlot.includes('shoe') || rawCat.includes('shoe') || rawCat.includes('sneaker') || rawName.includes('کفش') || rawName.includes('کتانی') || rawName.includes('کتونی') || rawName.includes('بوت') || rawName.includes('لوفر') || rawName.includes('صندل')) {
    slot = 'slot_shoes';
  } else {
    // Hoodies, T-shirts, Shirts, Sweatshirts, Knitwear are TOPS
    slot = 'slot_top';
  }

  // Exact Canonical Golden Ratio Anchors: Sleek 40% Torso + 60% Leg Silhouette
  const defaultPlacement = {
    slot_top: { anchor: 'torso' as const, offset_x_percent: 0, offset_y_percent: 27, scale: 0.85, z_index: 30 },
    slot_bottom: { anchor: 'waist' as const, offset_x_percent: 0, offset_y_percent: 60, scale: 1.22, z_index: 20 },
    slot_outer: { anchor: 'shoulders' as const, offset_x_percent: 0, offset_y_percent: 27, scale: 0.92, z_index: 40 },
    slot_shoes: { anchor: 'feet' as const, offset_x_percent: 0, offset_y_percent: 84, scale: 0.82, z_index: 10 },
    slot_accessory: { anchor: 'head' as const, offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
  }[slot];

  // Auto-Snap intelligence: auto-correct to canonical anatomical range
  let targetOffsetY = typeof json.placement?.offset_y_percent === 'number' ? json.placement.offset_y_percent : defaultPlacement.offset_y_percent;
  if (slot === 'slot_bottom' && (targetOffsetY > 68 || targetOffsetY < 52)) {
    targetOffsetY = 60;
  } else if ((slot === 'slot_top' || slot === 'slot_outer') && (targetOffsetY < 20 || targetOffsetY > 35)) {
    targetOffsetY = 27;
  } else if (slot === 'slot_shoes' && (targetOffsetY < 78 || targetOffsetY > 92)) {
    targetOffsetY = 84;
  }

  const customScale = typeof json.placement?.scale === 'number' && json.placement.scale >= 0.7 && json.placement.scale <= 1.4
    ? json.placement.scale
    : defaultPlacement.scale;
  const customZIndex = typeof json.placement?.z_index === 'number' ? json.placement.z_index : defaultPlacement.z_index;

  return {
    garment_id: json.garment_id || `GARMENT-${Date.now().toString().slice(-6)}`,
    name_fa: json.name_fa || fallbackName,
    name_en: json.name_en || 'Virtual Garment',
    category: json.category || (slot === 'slot_bottom' ? 'pants' : slot === 'slot_outer' ? 'jacket' : slot === 'slot_shoes' ? 'shoes' : 'tshirt'),
    slot,
    layer_level: slot === 'slot_top' ? 'mid_top' : slot === 'slot_bottom' ? 'bottom' : slot === 'slot_outer' ? 'outerwear' : 'shoes',
    placement: {
      anchor: json.placement?.anchor || defaultPlacement.anchor,
      offset_x_percent: 0,
      offset_y_percent: targetOffsetY,
      scale: customScale,
      z_index: customZIndex,
    },
    replacement_rules: {
      replaces_slot: slot,
      compatible_slots: ['slot_top', 'slot_bottom', 'slot_outer', 'slot_shoes'].filter(s => s !== slot) as GarmentSlot[],
    },
    style_details: {
      primary_color_fa: json.style_details?.primary_color_fa || 'کلاسیک',
      primary_color_en: json.style_details?.primary_color_en || 'Classic',
      color_hex: json.style_details?.color_hex || '#2b2b2b',
      fabric_type: json.style_details?.fabric_type || 'پارچه استاندارد اعلا',
      fit_style: json.style_details?.fit_style || 'regular',
      season: json.style_details?.season || 'all_season',
      estimated_price_toman: Number(json.style_details?.estimated_price_toman) || 850000,
    },
  };
}
