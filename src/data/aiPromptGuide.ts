import { GarmentAiSpec, GarmentSlot } from '../types/clothing';

/**
 * Master Universal AI Image Generation Prompt (All-in-One Autonomous Decision Engine)
 * First autonomously classifies the garment category, then executes the exact golden proportion rules!
 */
export const GHOST_MANNEQUIN_IMAGE_PROMPT_EN = `
GENERATE AN ULTRA-DETAILED 3D COMMERCIAL FASHION CATALOG IMAGE of the garment shown in the attached photo (or described). DO NOT output text, code, or analysis — IMMEDIATELY GENERATE THE IMAGE following these autonomous rules:

[STEP 1: AUTONOMOUS GARMENT CLASSIFICATION]
Autonomously identify the garment in the photo:
- If OUTERWEAR (Coat, Overcoat, Trench, Jacket, Blazer, Cardigan, Bomber, Windbreaker): Execute CASE A.
- If TOPWEAR (T-Shirt, Shirt, Polo, Hoodie, Sweater, Sweatshirt, Knitwear): Execute CASE B.
- If BOTTOMWEAR (Jeans, Pants, Trousers, Cargo, Sweatpants, Shorts, Skirt): Execute CASE C.
- If FOOTWEAR (Sneakers, Shoes, Boots, Loafers): Execute CASE D.

[STEP 2: PHOTOGRAPHIC RENDERING RULES PER CLASSIFIED CATEGORY]

CASE A: IF OUTERWEAR (Coat, Jacket, Windbreaker, Cardigan, Blazer):
- CONTINUOUS INTACT COLLAR: The high neck collar and shoulder yoke MUST BE 100% INTACT, seamless, and wrapped continuously behind the invisible ghost neck (NEVER sever, split, or disconnect the collar).
- WIDE-OPEN DRAPE: The garment is completely UNZIPPED and UNBUTTONED, draped wide open to the sides in a natural 35-degree winged angle from the collarbone down to the hem, revealing a generous 40% chest-to-waist open gap.
- MANDATORY HOLLOW CHEST VOID: The central gap between the open front panels MUST be a 100% EMPTY, HOLLOW, SEE-THROUGH VOID revealing ONLY the pure seamless solid white studio background behind it. STRICT PROHIBITION: ZERO inner back fabric, ZERO yellow or colored lining, ZERO interior back wall, and ZERO cloth filling the chest gap so an underlying t-shirt can be worn beneath it.
- BROAD TAILORED SHOULDERS: Shoulder seam width occupies 76% of canvas width (naturally envelops any inner top).

CASE B: IF TOPWEAR (T-Shirt, Shirt, Polo, Hoodie, Sweater, Sweatshirt):
- Centered on an invisible 3D ghost mannequin with realistic hollow interior collar revealing inside neck lining and brand label.
- Torso width strictly occupies 60% of canvas width (perfect proportion to sit inside the 76% outerwear without sticking out).
- Collar starts at 12% from top canvas border; bottom hem terminates at 54% from top border (right at waistband line, 100% level and horizontal).

CASE C: IF BOTTOMWEAR (Jeans, Pants, Trousers, Cargo, Sweatpants):
- Waistband starts at 12% from top canvas border (strictly 100% horizontal, 0° slope).
- Waistband width: 46% of canvas; hips/thighs: 56% of canvas; leg cuffs terminate at 92% canvas height with identical bilateral symmetry.

CASE D: IF FOOTWEAR (Sneakers, Shoes, Boots, Loafers):
- Pair of shoes positioned side-by-side facing directly forward with identical bilateral symmetry.
- Soles rest at 88% from top canvas border; pair occupies 56% of canvas width with soft contact shadow underneath.

GLOBAL MANDATORY CAMERA & LIGHTING (ALL CATEGORIES):
- Square 1:1 aspect ratio (1024x1024 pixels).
- Strict 0-degree frontal orthographic eye-level view (0° yaw, 0° pitch, 0° roll), perfectly bilateral mirror symmetry.
- Absolutely NO 3/4 angle, NO tilted shoulders, NO skewed pose, NO human body, NO skin, NO mannequin stand.
- Isolated on pure seamless white studio background (RGB 255,255,255) with zero background borders and zero rectangular frames.
- Soft balanced commercial studio high-key diffuse lighting, sharp authentic fabric textures and seams.

NEGATIVE PROMPTS (MUST AVOID):
text, code, json, severed collar, floating split sleeves, cut neckband, solid back lining inside chest, yellow fabric behind zipper, interior back wall, yellow back panel, closed torso, narrow zipper slit, buttoned coat, closed front jacket, white background box, rectangular frame, photo border, 3/4 view, three-quarter angle, tilted shoulders, slanted hem, skewed perspective, human face, skin, hands, feet, visible mannequin dummy, dark background.
`.trim();

export const GHOST_MANNEQUIN_IMAGE_PROMPT_FA = `
پرامپت طلایی و مستقل تولید عکس لباس ۳بعدی (بدون نیاز به ویرایش یا تایپ متن اضافی):

نحوه استفاده بسیار ساده:
۱. عکس لباس خود را در ChatGPT (یا Gemini / Midjourney) آپلود کنید.
۲. کل متن انگلیسی پرامپت را بدون هیچ تغییری کپی و ارسال کنید!
۳. هوش مصنوعی عکس ارسالی شما را بررسی کرده، نوع لباس را خودش تشخیص می‌دهد و مستقیماً عکس ۳بعدی استودیویی روی مانکن نامرئی را تولید می‌کند (بدون تولید کد یا متن اضافی).
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
    slot_top: { anchor: 'torso' as const, offset_x_percent: 0, offset_y_percent: 37.5, scale: 0.92, z_index: 30 },
    slot_bottom: { anchor: 'waist' as const, offset_x_percent: 0, offset_y_percent: 66.5, scale: 1.06, z_index: 20 },
    slot_outer: { anchor: 'shoulders' as const, offset_x_percent: 0, offset_y_percent: 36.0, scale: 1.04, z_index: 40 },
    slot_shoes: { anchor: 'feet' as const, offset_x_percent: 0, offset_y_percent: 86.5, scale: 0.90, z_index: 22 },
    slot_accessory: { anchor: 'head' as const, offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
  }[slot];

  // Auto-Snap intelligence: auto-correct to canonical anatomical range
  let targetOffsetY = typeof json.placement?.offset_y_percent === 'number' ? json.placement.offset_y_percent : defaultPlacement.offset_y_percent;
  if (slot === 'slot_bottom' && (targetOffsetY > 72 || targetOffsetY < 58)) {
    targetOffsetY = 66.5;
  } else if (slot === 'slot_top' && (targetOffsetY < 32 || targetOffsetY > 42)) {
    targetOffsetY = 37.5;
  } else if (slot === 'slot_outer' && (targetOffsetY < 30 || targetOffsetY > 42)) {
    targetOffsetY = 36.0;
  } else if (slot === 'slot_shoes' && (targetOffsetY < 80 || targetOffsetY > 92)) {
    targetOffsetY = 86.5;
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
    layering_behavior: slot === 'slot_outer' ? {
      is_open_front: json.layering_behavior?.is_open_front ?? true,
      reveals_inner_top: json.layering_behavior?.reveals_inner_top ?? true,
      inner_top_sleeve_trim_percent: json.layering_behavior?.inner_top_sleeve_trim_percent ?? 18,
      chest_opening_width_percent: json.layering_behavior?.chest_opening_width_percent ?? 20,
    } : undefined,
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
