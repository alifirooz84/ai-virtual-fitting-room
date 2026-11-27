import { GarmentAiSpec, GarmentSlot } from '../types/clothing';

/**
 * Master Universal AI Image Generation Prompt (All-in-One Autonomous Decision Engine)
 * First autonomously classifies the garment category, then executes the exact golden proportion rules!
 */
export const GHOST_MANNEQUIN_IMAGE_PROMPT_EN = `
[PRIMARY DIRECTIVE - STEP 1: AUTONOMOUS GARMENT CLASSIFICATION]
Analyze the input text [EXACT_CLOTHING_NAME_AND_COLOR] and autonomously classify its garment category:
- Category 1: OUTERWEAR (Overcoat, Coat, Trench, Jacket, Blazer, Cardigan, Bomber, Windbreaker) -> Execute CASE A.
- Category 2: TOPWEAR (T-Shirt, Shirt, Polo, Hoodie, Sweater, Sweatshirt, Knitwear) -> Execute CASE B.
- Category 3: BOTTOMWEAR (Jeans, Pants, Trousers, Cargo, Sweatpants, Shorts, Skirt) -> Execute CASE C.
- Category 4: FOOTWEAR (Sneakers, Shoes, Boots, Loafers) -> Execute CASE D.

Professional commercial fashion studio catalog photography of [EXACT_CLOTHING_ITEM_NAME_AND_COLOR], displayed on an invisible 3D ghost mannequin with realistic 3-dimensional volume and crisp structural drape.

EXECUTION RULES PER CLASSIFIED CATEGORY:

CASE A: IF OUTERWEAR (Overcoat, Coat, Trench, Jacket, Blazer, Cardigan, Bomber, Windbreaker):
- WINGED WIDE-OPEN DRAPE: The jacket/coat MUST be completely UNZIPPED and UNBUTTONED, draped wide open to the sides at 35-degree winged angles, exposing a generous 40% chest-to-waist open gap in the center.
- MANDATORY HOLLOW SEE-THROUGH VOID (NO BACK FABRIC): The entire central opening gap between the left and right front panels MUST be a completely HOLLOW, SEE-THROUGH VOID looking straight through to the solid seamless studio background behind the mannequin.
- ABSOLUTELY STRICT PROHIBITION: ZERO inner back fabric, ZERO back satin lining, ZERO colored interior fabric, ZERO interior back wall, and ZERO inner collar behind the zipper gap. The gap must be 100% empty space so an underlying t-shirt can be worn beneath it.
- BROAD TAILORED SHOULDERS: Shoulder seam width occupies 76% of canvas width (naturally wraps over any inner t-shirt).
- Top collar starts at 10% from top canvas border; bottom hem terminates at 74% (long coat) or 56% (jacket) so pants legs remain clearly visible.

CASE B: IF TOPWEAR (T-Shirt, Shirt, Polo, Hoodie, Sweater, Sweatshirt, Knitwear):
- Centered 3D ghost mannequin with realistic hollow interior collar revealing inside neck lining and label.
- Torso width occupies 60% of canvas width (perfect proportion to sit inside the 76% outerwear without sticking out).
- Collar starts at 12% from top canvas border; bottom hem terminates at 54% from top border (right at the waistband line).
- Bottom hem is strictly 100% horizontal and level with the ground plane (0° slope).

CASE C: IF BOTTOMWEAR (Jeans, Pants, Trousers, Cargo, Sweatpants, Shorts, Skirt):
- Waistband starts at exactly 12% from top canvas border and is strictly 100% horizontal and level (0° slope).
- Waistband width occupies 46% of canvas width; hip and thigh width occupies 56% of canvas width.
- Leg cuffs terminate at 92% from top canvas border, hanging straight and level with identical bilateral symmetry.

CASE D: IF FOOTWEAR (Sneakers, Shoes, Boots, Loafers):
- Pair of shoes positioned side-by-side facing directly forward with identical bilateral symmetry.
- Soles rest at 88% from top canvas border; pair occupies 56% of canvas width with soft contact shadow underneath.

GLOBAL MANDATORY RULES (ALL CATEGORIES):
- Square 1:1 aspect ratio (1024x1024 pixels).
- Strict 0-degree frontal orthographic eye-level view (0° yaw, 0° pitch, 0° roll), perfectly bilateral mirror symmetry.
- Absolutely NO 3/4 angle, NO tilted shoulders, NO skewed pose, NO human body, NO skin, NO mannequin stand.
- MANDATORY PURE TRANSPARENCY: Isolated cutout on pure seamless white studio background or 100% transparent alpha PNG background (RGBA, zero background borders, zero white box, zero rectangular frames).
- Soft balanced commercial studio high-key diffuse lighting, sharp authentic fabric textures and seams.

NEGATIVE PROMPTS (MUST AVOID):
solid back lining, inner back fabric, inner yellow fabric behind zipper, interior back wall, yellow back panel, closed torso, narrow zipper slit, buttoned coat, closed front jacket, white background box, rectangular frame, photo border, 3/4 view, three-quarter angle, tilted shoulders, slanted hem, skewed perspective, human face, skin, hands, feet, visible mannequin dummy, dark background.
`.trim();

export const GHOST_MANNEQUIN_IMAGE_PROMPT_FA = `
پرامپت واحد و همه‌کاره تولید عکس لباس با هوش مصنوعی (تشخیص خودکار تمام دسته‌ها):

ویژگی‌های این پرامپت هوشمند:
این پرامپت به صورت خودکار نوع لباسی که داخل کروشه می‌نویسید را تشخیص می‌دهد و قوانین اختصاصی آن را اجرا می‌کند:
۱. اگر پالتو یا کت یا کاپشن باشد:
   - آن را زیپ‌باز یا دکمه‌باز با زاویه بال‌مانند (Winged Drape با زاویه ۳۵ درجه) تولید می‌کند تا حداقل ۴۰٪ عرض سینه کاملاً باز باشد.
   - فضای خالی مرکزی (Hollow See-Through Void): هیچ آستر یا پارچه پشتی در بین زیپ‌ها کشیده نمی‌شود و پشت لباس کاملاً خالی و شفاف به پس‌زمینه نگاه می‌کند تا تی‌شرت زیرین به زیبایی خودنمایی کند.
   - عرض سرشانه بر روی ۷۶٪ تنظیم شده تا کاملاً لباس زیرین را در بر بگیرد.
۲. اگر تی‌شرت، هودی یا پیراهن باشد:
   - آن را با عرض متناسب (۶۰٪) و یقه خالی ۳بعدی می‌سازد تا دقیقاً در سینه پالتو جا بگیرد.
   - لبه پایینی کاملاً افقی و در تراز ۵۴٪ تنظیم شده تا با کمر شلوار چفت شود.
۳. اگر شلوار باشد: خط کمر را کاملاً افقی می‌سازد تا همپوشانی بی‌نقص با تی‌شرت داشته باشد.
۴. اگر کفش باشد: جفت روبه‌رو با زاویه ۰ درجه استودیویی تحویل می‌دهد.
۵. تمام خروجی‌ها ایزوله و بدون کادر زائد هستند.

نحوه استفاده:
تنها کاری که باید بکنید این است که عبارت [EXACT_CLOTHING_ITEM_NAME_AND_COLOR] را با نام لباس و رنگ آن (به انگلیسی، مثلاً: Bright Yellow Softshell Windbreaker Jacket with Black Zippers) پر کنید و کل متن انگلیسی را به Midjourney، Flux، ChatGPT یا Gemini بدهید!
`.trim();

/**
 * Master AI Prompt for Layered & Open-Front Outerwear Apparel (e.g. Open Camel Overcoat, Cardigan, Bomber Jacket)
 * Enforces hollow chest void between lapels so inner t-shirt / shirt shows cleanly through.
 */
export const LAYERED_APPAREL_IMAGE_PROMPT_EN = `
Professional commercial studio fashion catalog photography of an unbuttoned wide-open front [EXACT_CLOTHING_ITEM_NAME_AND_COLOR, e.g. CAMEL_WOOL_OVERCOAT_WITH_NOTCHED_LAPELS], displayed on an invisible 3D ghost mannequin with realistic 3-dimensional volume and winged open drape.

OPEN-FRONT HOLLOW CHEST ARCHITECTURE (MANDATORY TRANSPARENCY RULES):
- WIDE WINGED DRAPE: The garment is completely UNBUTTONED / UNZIPPED and WIDE OPEN in the front, with both front panels draped symmetrically outward at 35-degree angles.
- Generous 40% chest opening gap between the left and right lapels/zippers.
- MANDATORY HOLLOW SEE-THROUGH CHEST VOID: The central opening area between the lapels MUST be 100% EMPTY, HOLLOW, and SEE-THROUGH, directly showing the solid seamless white studio background behind it.
- STRICT PROHIBITION: ZERO inner back fabric, ZERO back satin lining, ZERO colored interior fabric, ZERO interior back wall, and ZERO inner back collar visible through the front chest opening gap. Do NOT fill the chest gap with any cloth or interior panel.
- Strict 0-degree frontal orthographic eye-level view (0° yaw, 0° pitch, 0° roll), perfect bilateral mirror symmetry.
- Both sleeves drape downward straight and symmetrically at identical 15-degree angles.
- 100% isolated cutout on pure seamless white studio background or transparent alpha PNG background (zero white box, zero borders).

FABRIC & LIGHTING:
- Ultra-detailed fabric weave, sharp tailored lapel creases, authentic fabric weight and depth.
- Balanced soft studio high-key lighting with subtle inner contact shadows along lapel edges.

NEGATIVE PROMPTS (MUST AVOID):
solid back lining, inner back fabric, inner yellow fabric behind zipper, interior back wall, yellow back panel, closed torso, narrow zipper slit, buttoned coat, closed front, zipped jacket, inner fabric covering chest, brown lining behind lapels, white background box, rectangular frame, photo border, 3/4 view, three-quarter angle, tilted torso, human body, neck, face, hands, visible mannequin stand.
`.trim();

export const LAYERED_APPAREL_IMAGE_PROMPT_FA = `
دستورالعمل تولید عکس لباس‌های رو و لایه‌ای (پالتو، کت، کاپشن زیپ‌باز و کاردیگان جلوباز):

چرا این پرامپت برای لباس‌های رو حیاتی است؟
۱. جلوباز بال‌مانند کامل (Winged Open-Front): دو طرف کت یا کاپشن کاملاً باز و متقارن هستند (حداقل ۴۰٪ عرض سینه باز است تا طرح تی‌شرت زیرین کاملاً دیده شود).
۲. سینه کاملاً خالی و شفاف (Hollow Chest Void): هوش مصنوعی به هیچ وجه پشت پالتو/کاپشن را با آستر یا پارچه پشتی پر نمی‌کند، بنابراین لباس زیری (تی‌شرت یا پیراهن) به زیبایی تمام از میان زیپ یا دکمه‌های باز دیده می‌شود.
۳. تقارن و بدون کجی (0° Frontal Orthographic): زاویه کاملاً مستقیم است و سرشانه‌ها در یک تراز افقی قرار دارند.
۴. بدون کادر سفید دور لباس (Pure Cutout): دور لباس و فضای داخل زیپ کاملاً تمیز است و مستقیماً روی استیج پرو می‌نشیند.
`.trim();

/**
 * The Master Multimodal Prompt to give to any AI (Gemini 1.5/2.0, ChatGPT 4o, Claude 3.5 Sonnet)
 * along with the clothing photo. It outputs the exact companion JSON file needed for the fitting room!
 */
export const AI_COMPANION_SPEC_PROMPT_FA = `
[گام اول و اجباری: تشخیص خودکار و هوشمند نوع لباس از روی عکس]
ابتدا عکس پیوست‌شده را بررسی کرده و به صورت خودکار تشخیص دهید لباس متعلق به کدام دسته است:
- دسته ۱: پالتو، کت، بارانی، کاپشن، کاردیگان (لباس‌رو) -> قوانین دسته ۱
- دسته ۲: تی‌شرت، پیراهن، هودی، دورس، پلیور (بالاتنه) -> قوانین دسته ۲
- دسته ۳: شلوار، جین، اسلش، بگ، کارگو، دامن (پایین‌تنه) -> قوانین دسته ۳
- دسته ۴: کتانی، کفش چرم، بوت، اسنیکرز (کفش) -> قوانین دسته ۴

سپس بر اساس دسته‌ای که خودتان تشخیص دادید، مقادیر طلایی متناظر زیر را دقیقاً در ساختار JSON پر کنید. هیچ متن اضافه‌ای خارج از ساختار JSON ننویسید.

قوانین کالیبراسیون و تناسبات طلایی برای هر دسته:
۱. اگر لباس‌رو (پالتو، کت، کاپشن) است:
   - "slot": "slot_outer" | "layer_level": "outerwear"
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 37, "scale": 1.02, "z_index": 40 }
   - "layering_behavior": { "is_open_front": true, "reveals_inner_top": true, "inner_top_sleeve_trim_percent": 8 }

۲. اگر بالاتنه (تی‌شرت، هودی، پیراهن، دورس) است:
   - "slot": "slot_top" | "layer_level": "mid_top"
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 36.5, "scale": 0.92, "z_index": 30 }

۳. اگر پایین‌تنه (شلوار جین، کتان، اسلش، بگ، کارگو) است:
   - "slot": "slot_bottom" | "layer_level": "bottom"
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 64, "scale": 1.0, "z_index": 20 }

۴. اگر کفش یا کتانی است:
   - "slot": "slot_shoes" | "layer_level": "shoes"
   - "placement": { "anchor": "feet", "offset_x_percent": 0, "offset_y_percent": 86.5, "scale": 0.90, "z_index": 22 }

ساختار خروجی JSON که باید بازگردانید:
\`\`\`json
{
  "garment_id": "شناسه، مثلا: TOP-TSH-01 یا OUTER-COAT-01",
  "name_fa": "نام دقیق فارسی لباس بر اساس عکس (مثلا: پالتو بلند فوتر پشمی شتری جلو باز)",
  "name_en": "English Product Name",
  "category": "tshirt" | "shirt" | "hoodie" | "sweater" | "pants" | "jeans" | "shorts" | "skirt" | "jacket" | "coat" | "shoes",
  "slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
  "layer_level": "mid_top" | "bottom" | "outerwear" | "shoes",
  "placement": {
    "anchor": "torso" | "waist" | "shoulders" | "feet",
    "offset_x_percent": 0,
    "offset_y_percent": 34,
    "scale": 1.0,
    "z_index": 30
  },
  "layering_behavior": {
    "is_open_front": false,
    "reveals_inner_top": false,
    "inner_top_sleeve_trim_percent": 16
  },
  "replacement_rules": {
    "replaces_slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
    "compatible_slots": ["slot_top", "slot_bottom", "slot_outer", "slot_shoes"]
  },
  "style_details": {
    "primary_color_fa": "نام رنگ اصلی فارسی",
    "primary_color_en": "Color in English",
    "color_hex": "#RRGGBB",
    "fabric_type": "جنس پارچه (مثلا: دورس پنبه، فوتر پشمی، دنیم سنگشور)",
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
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 34, "scale": 0.88, "z_index": 30 }
   - "replaces_slot": "slot_top"

2. Bottoms / Pants / Jeans (Long Leg Layer - Waist meets top hem):
   - "slot": "slot_bottom"
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 60, "scale": 1.22, "z_index": 20 }
   - "replaces_slot": "slot_bottom"

3. Outerwear / Open Jackets / Overcoats / Palto (Outer Layer):
   - "slot": "slot_outer"
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 31, "scale": 1.12, "z_index": 40 }
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
    slot_top: { anchor: 'torso' as const, offset_x_percent: 0, offset_y_percent: 34, scale: 0.88, z_index: 30 },
    slot_bottom: { anchor: 'waist' as const, offset_x_percent: 0, offset_y_percent: 60, scale: 1.20, z_index: 20 },
    slot_outer: { anchor: 'shoulders' as const, offset_x_percent: 0, offset_y_percent: 31, scale: 1.14, z_index: 40 },
    slot_shoes: { anchor: 'feet' as const, offset_x_percent: 0, offset_y_percent: 84, scale: 0.82, z_index: 10 },
    slot_accessory: { anchor: 'head' as const, offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
  }[slot];

  // Auto-Snap intelligence: auto-correct to canonical anatomical range
  let targetOffsetY = typeof json.placement?.offset_y_percent === 'number' ? json.placement.offset_y_percent : defaultPlacement.offset_y_percent;
  if (slot === 'slot_bottom' && (targetOffsetY > 64 || targetOffsetY < 54)) {
    targetOffsetY = 60;
  } else if (slot === 'slot_top' && (targetOffsetY < 30 || targetOffsetY > 38)) {
    targetOffsetY = 34;
  } else if (slot === 'slot_outer' && (targetOffsetY < 24 || targetOffsetY > 36)) {
    targetOffsetY = 31;
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
