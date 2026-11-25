import { GarmentAiSpec, GarmentSlot } from '../types/clothing';

/**
 * Master AI Image Generation Prompt for 3D Ghost Mannequin Apparel (Zero-Tilt & Symmetrical Orthographic View)
 * Solves:
 * 1. Crooked/Tilted 3/4 poses (locks camera to strict 0° frontal orthographic view, bilateral symmetry).
 * 2. Asymmetrical shoulders or tilted hem (locks left and right shoulders to the exact same horizontal height).
 * 3. Ghost mannequin hollow interior (reveals inner collar/lining in 3D volume without any human body).
 * 4. Transparent alpha or pure white background with standard canvas framing.
 */
export const GHOST_MANNEQUIN_IMAGE_PROMPT_EN = `
Professional commercial fashion catalog photography of a [EXACT_CLOTHING_ITEM_NAME_AND_COLOR], displayed on an invisible 3D ghost mannequin with realistic 3-dimensional volume and hollow interior collar revealing inside neck lining and tag.

CAMERA & PERSPECTIVE (MANDATORY ZERO-TILT RULES):
- Strict 0-degree frontal orthographic eye-level camera view (0° yaw, 0° pitch, 0° roll).
- Absolutely NO 3/4 angle, NO three-quarter perspective, NO tilted mannequin, NO turned torso.
- Perfect bilateral mirror symmetry: left and right shoulder seams must be on the EXACT same horizontal pixel line.
- Both sleeves drape downward symmetrically at identical 15-degree angles from the torso.
- Bottom hem and waistband are strictly 100% horizontal and level with the ground plane (0° slope).

FRAMING & CANVASS RATIO:
- Square 1:1 aspect ratio (1024x1024 pixels).
- Centered perfectly on canvas with clean margins.
- Tops: Collar neckline starts at 10% from the top canvas border; bottom hem terminates at 70% from the top border.
- Bottoms: Waistband starts at 10% from the top border; ankle cuffs terminate at 92% from the top border.
- Isolated on a pure transparent PNG background (alpha = 0) OR seamless solid pure white studio backdrop (#FFFFFF) with ZERO cast shadows and ZERO floor shadows.

FABRIC & LIGHTING:
- Ultra-high-resolution realistic fabric texture, natural micro-creases, authentic seams and stitching.
- Soft diffuse studio high-key lighting, balanced from left and right, completely eliminate one-sided harsh shadows.

NEGATIVE PROMPTS (MUST AVOID):
3/4 view, three-quarter angle, turned body, tilted shoulders, angled torso, dynamic pose, asymmetrical, slanted hem, skewed perspective, side angle, diagonal horizon, one arm raised, bent pose, human body, skin, face, hands, visible mannequin, dummy stand, hanger, floor shadow, cast shadow, dark background, checkerboard pattern.
`.trim();

export const GHOST_MANNEQUIN_IMAGE_PROMPT_FA = `
دستورالعمل تولید عکس سه‌بعدی مانکن نامرئی (کاملاً صاف و مستقیم، بدون کجی و بدون چرخش بدنه):

این پرامپت خطاهای رایج هوش مصنوعی را کاملاً مسدود می‌کند:
۱. به هیچ وجه عکس در زاویه ۳/۴ رخ یا کج تولید نمی‌شود (0° Frontal Orthographic).
۲. شانه‌های چپ و راست و لبه پایینی لباس دقیقاً در یک خط تراز افقی قرار می‌گیرند.
۳. لبه کمر شلوار و پایینی تی‌شرت کاملاً افقی و موازی خط افق هستند تا بدون نیاز به هیچ جابجایی دستی روی هم بنشینند.
۴. داخل یقه لباس خالی و سه‌بعدی است (Ghost Mannequin 3D Interior).

نحوه استفاده:
عبارت [EXACT_CLOTHING_ITEM_NAME_AND_COLOR] در متن انگلیسی را با نام و رنگ لباستان عوض کنید (مثلاً: beige oversized fleece hoodie) و کل پرامپت انگلیسی را به Gemini، ChatGPT، Midjourney یا Flux بدهید.
`.trim();

/**
 * The Master Multimodal Prompt to give to any AI (Gemini 1.5/2.0, ChatGPT 4o, Claude 3.5 Sonnet)
 * along with the clothing photo. It outputs the exact companion JSON file needed for the fitting room!
 */
export const AI_COMPANION_SPEC_PROMPT_FA = `
شما یک هوش مصنوعی متخصص در تحلیل پوشاک و سیستم‌های پرو مجازی سه‌بعدی (3D VTON Auto-Snap Engine) هستید.
عکس پیوست‌شده از لباس (خروجی کاملاً مستقیم و متقارن مانکن نامرئی شفاف) را به دقت آنالیز کنید و مشخصات کالیبراسیون و انطباق پرو را دقیقاً در قالب ساختار JSON زیر بازگردانید. هیچ متن اضافه‌ای خارج از ساختار JSON ننویسید.

قوانین انطباق خودکار خط کمر و لایه‌بندی فیزیکی بدون نیاز به جابجایی دستی (Auto-Snap Layer Hierarchy):
۱. تی‌شرت، پیراهن، هودی، پولوشرت (بالاتنه):
   - "slot": "slot_top"
   - لایه فیزیکی: روی کمر شلوار قرار می‌گیرد (Z-Index: 30)
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 30, "scale": 1.0, "z_index": 30 }
   - "replacement_rules.replaces_slot": "slot_top"

۲. شلوار، جین، اسلش، دامن، شلوارک (پایین‌تنه):
   - "slot": "slot_bottom"
   - لایه فیزیکی: دقیقاً زیر لبه پایینی تی‌شرت فیکس می‌شود بدون هیچ فاصله‌ای (Z-Index: 20)
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 64, "scale": 1.0, "z_index": 20 }
   - "replacement_rules.replaces_slot": "slot_bottom"

۳. کت، کاپشن، پالتو، بارانی، سویشرت (لباس‌رو):
   - "slot": "slot_outer"
   - لایه فیزیکی: روی تی‌شرت و شلوار قرار می‌گیرد (Z-Index: 40)
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 30, "scale": 1.05, "z_index": 40 }
   - "replacement_rules.replaces_slot": "slot_outer"

۴. کفش، کتانی، بوت، نیم‌بوت (کفش):
   - "slot": "slot_shoes"
   - لایه فیزیکی: زیر پای شلوار قرار می‌گیرد (Z-Index: 10)
   - "placement": { "anchor": "feet", "offset_x_percent": 0, "offset_y_percent": 88, "scale": 0.85, "z_index": 10 }
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
Analyze the attached symmetrical front-facing 3D clothing photograph and output a strict JSON calibration file according to the VTON Auto-Snap Layering Architecture.
Return ONLY valid JSON with no markdown wrapping.

CANONICAL ANCHOR POSITIONS (ZERO-ADJUSTMENT SNAP):
1. Tops / Hoodies / Shirts:
   - "slot": "slot_top"
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 30, "scale": 1.0, "z_index": 30 }
   - "replaces_slot": "slot_top"

2. Bottoms / Pants / Jeans:
   - "slot": "slot_bottom"
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 64, "scale": 1.0, "z_index": 20 }
   - "replaces_slot": "slot_bottom"

3. Outerwear / Jackets / Coats:
   - "slot": "slot_outer"
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 30, "scale": 1.05, "z_index": 40 }
   - "replaces_slot": "slot_outer"

4. Footwear / Shoes:
   - "slot": "slot_shoes"
   - "placement": { "anchor": "feet", "offset_x_percent": 0, "offset_y_percent": 88, "scale": 0.85, "z_index": 10 }
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

  if (rawSlot.includes('bottom') || rawCat.includes('pant') || rawCat.includes('jean') || rawCat.includes('skirt') || rawCat.includes('short') || rawName.includes('شلوار') || rawName.includes('جین') || rawName.includes('دامن') || rawName.includes('اسلش')) {
    slot = 'slot_bottom';
  } else if (rawSlot.includes('outer') || rawCat.includes('jacket') || rawCat.includes('coat') || rawCat.includes('hoodie') || rawName.includes('کت') || rawName.includes('کاپشن') || rawName.includes('پالتو') || rawName.includes('هودی') || rawName.includes('بارانی') || rawName.includes('سویشرت')) {
    slot = 'slot_outer';
  } else if (rawSlot.includes('shoe') || rawCat.includes('shoe') || rawName.includes('کفش') || rawName.includes('کتانی') || rawName.includes('کتونی') || rawName.includes('بوت') || rawName.includes('لوفر')) {
    slot = 'slot_shoes';
  } else {
    slot = 'slot_top';
  }

  // Exact Canonical Auto-Snap Anchors: Tops end right at waist, pants tuck directly under top hem!
  const defaultPlacement = {
    slot_top: { anchor: 'torso' as const, offset_x_percent: 0, offset_y_percent: 30, scale: 1.0, z_index: 30 },
    slot_bottom: { anchor: 'waist' as const, offset_x_percent: 0, offset_y_percent: 64, scale: 1.0, z_index: 20 },
    slot_outer: { anchor: 'shoulders' as const, offset_x_percent: 0, offset_y_percent: 30, scale: 1.05, z_index: 40 },
    slot_shoes: { anchor: 'feet' as const, offset_x_percent: 0, offset_y_percent: 88, scale: 0.85, z_index: 10 },
    slot_accessory: { anchor: 'head' as const, offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
  }[slot];

  // Auto-Snap intelligence: if an offset is absurdly out of range (like pants at 74% or top at 15%), auto-correct to canonical range
  let targetOffsetY = typeof json.placement?.offset_y_percent === 'number' ? json.placement.offset_y_percent : defaultPlacement.offset_y_percent;
  if (slot === 'slot_bottom' && (targetOffsetY > 68 || targetOffsetY < 55)) {
    targetOffsetY = 64;
  } else if ((slot === 'slot_top' || slot === 'slot_outer') && (targetOffsetY < 24 || targetOffsetY > 38)) {
    targetOffsetY = 30;
  } else if (slot === 'slot_shoes' && (targetOffsetY < 80 || targetOffsetY > 95)) {
    targetOffsetY = 88;
  }

  const customScale = typeof json.placement?.scale === 'number' ? json.placement.scale : defaultPlacement.scale;
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
