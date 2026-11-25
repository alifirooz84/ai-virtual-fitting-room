import { GarmentAiSpec, GarmentSlot } from '../types/clothing';

/**
 * The Master Multimodal Prompt to give to any AI (Gemini 1.5/2.0, ChatGPT 4o, Claude 3.5 Sonnet)
 * along with the clothing photo. It outputs the exact companion JSON file needed for the fitting room!
 */
export const AI_COMPANION_SPEC_PROMPT_FA = `
شما یک هوش مصنوعی متخصص در تحلیل پوشاک و سیستم‌های پرو مجازی سه‌بعدی (3D VTON Layering Engine) هستید.
عکس پیوست‌شده از لباس (خروجی سه‌بعدی مانکن نامرئی شفاف) را به دقت آنالیز کنید و مشخصات کالیبراسیون و انطباق پرو را دقیقاً در قالب ساختار JSON زیر بازگردانید. هیچ متن اضافه‌ای خارج از ساختار JSON ننویسید.

قوانین اختصاصی اسلات (Slot) و لایه‌بندی فیزیکی لباس‌ها (Z-Index Layer Hierarchy):
۱. تی‌شرت، پیراهن، تاپ، پولوشرت (بالاتنه):
   - "slot": "slot_top"
   - لایه فیزیکی: روی کمر شلوار قرار می‌گیرد (Over Pants Waistband)
   - "placement": { "anchor": "torso", "offset_x_percent": 0, "offset_y_percent": 22, "scale": 1.0, "z_index": 30 }
   - "replacement_rules.replaces_slot": "slot_top"

۲. شلوار، جین، اسلش، دامن، شلوارک (پایین‌تنه):
   - "slot": "slot_bottom"
   - لایه فیزیکی: زیر لبه تی‌شرت قرار می‌گیرد (Under Top Hem)
   - "placement": { "anchor": "waist", "offset_x_percent": 0, "offset_y_percent": 53, "scale": 1.0, "z_index": 20 }
   - "replacement_rules.replaces_slot": "slot_bottom"

۳. کت، کاپشن، پالتو، بارانی، هودی (لباس‌رو):
   - "slot": "slot_outer"
   - لایه فیزیکی: روی تی‌شرت و شلوار قرار می‌گیرد (Over Top & Bottom)
   - "placement": { "anchor": "shoulders", "offset_x_percent": 0, "offset_y_percent": 20, "scale": 1.05, "z_index": 40 }
   - "replacement_rules.replaces_slot": "slot_outer"

۴. کفش، کتانی، بوت، نیم‌بوت (کفش):
   - "slot": "slot_shoes"
   - لایه فیزیکی: زیر پای شلوار قرار می‌گیرد (Ground baseline)
   - "placement": { "anchor": "feet", "offset_x_percent": 0, "offset_y_percent": 84, "scale": 0.85, "z_index": 10 }
   - "replacement_rules.replaces_slot": "slot_shoes"

ساختار خروجی JSON که باید بازگردانید:
\`\`\`json
{
  "garment_id": "شناسه منحصربفرد، مثلا: TOP-TSHIRT-01 یا PNT-JEAN-02",
  "name_fa": "نام دقیق فارسی بر اساس رنگ و جنس و طرح در عکس",
  "name_en": "English Product Name",
  "category": "tshirt" | "shirt" | "hoodie" | "sweater" | "pants" | "jeans" | "shorts" | "skirt" | "jacket" | "coat" | "shoes" | "accessory",
  "slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
  "layer_level": "mid_top" | "bottom" | "outerwear" | "shoes",
  "placement": {
    "anchor": "torso" | "waist" | "shoulders" | "feet",
    "offset_x_percent": 0,
    "offset_y_percent": 22,
    "scale": 1.0,
    "z_index": 30
  },
  "replacement_rules": {
    "replaces_slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
    "compatible_slots": ["slot_top", "slot_bottom", "slot_outer", "slot_shoes"]
  },
  "style_details": {
    "primary_color_fa": "نام رنگ اصلی فارسی",
    "primary_color_en": "Color Name in English",
    "color_hex": "#RRGGBB",
    "fabric_type": "جنس پارچه (مثلا: نخ پنبه ۱۰۰٪، دنیم کشسان، چرم، فوتر)",
    "fit_style": "regular" | "oversized" | "slim" | "relaxed",
    "season": "spring_summer" | "fall_winter" | "all_season",
    "estimated_price_toman": 850000
  }
}
\`\`\`
`.trim();

export const AI_COMPANION_SPEC_PROMPT_EN = `
You are a Fashion AI and 3D Virtual Try-On Calibration Engine.
Analyze the attached 3D ghost mannequin clothing photograph and output a strict JSON calibration file according to the VTON Slot Replacement Architecture.
Return ONLY valid JSON with no markdown wrapping.

SLOT SPECIFICATIONS & LAYER HIERARCHY:
1. Tops (T-shirt, shirt, polo, blouse, knit):
   - "slot": "slot_top"
   - "placement.anchor": "torso"
   - "placement.offset_y_percent": 22
   - "placement.z_index": 30 (Sits OVER pants waistband)
   - "replaces_slot": "slot_top"

2. Bottoms (Pants, jeans, trousers, skirts, shorts):
   - "slot": "slot_bottom"
   - "placement.anchor": "waist"
   - "placement.offset_y_percent": 53
   - "placement.z_index": 20 (Sits UNDER top hem)
   - "replaces_slot": "slot_bottom"

3. Outerwear (Jacket, coat, hoodie, blazer, cardigan):
   - "slot": "slot_outer"
   - "placement.anchor": "shoulders"
   - "placement.offset_y_percent": 20
   - "placement.z_index": 40 (Sits OVER top and bottom)
   - "replaces_slot": "slot_outer"

4. Footwear (Shoes, sneakers, boots):
   - "slot": "slot_shoes"
   - "placement.anchor": "feet"
   - "placement.offset_y_percent": 84
   - "placement.z_index": 10
   - "replaces_slot": "slot_shoes"
`.trim();

/**
 * Validates and normalizes any user-uploaded JSON file into a valid GarmentAiSpec.
 * Enforces automatic layering (Z-Index) and spatial offsets so tops and bottoms align seamlessly.
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

  // Canonical fashion anchors & deterministic z-index order
  const defaultPlacement = {
    slot_top: { anchor: 'torso' as const, offset_x_percent: 0, offset_y_percent: 22, scale: 1.0, z_index: 30 },
    slot_bottom: { anchor: 'waist' as const, offset_x_percent: 0, offset_y_percent: 53, scale: 1.0, z_index: 20 },
    slot_outer: { anchor: 'shoulders' as const, offset_x_percent: 0, offset_y_percent: 20, scale: 1.05, z_index: 40 },
    slot_shoes: { anchor: 'feet' as const, offset_x_percent: 0, offset_y_percent: 84, scale: 0.85, z_index: 10 },
    slot_accessory: { anchor: 'head' as const, offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
  }[slot];

  // If user JSON specifies custom offset/scale, use it; otherwise use canonical fashion anchors
  const customOffsetY = typeof json.placement?.offset_y_percent === 'number' ? json.placement.offset_y_percent : defaultPlacement.offset_y_percent;
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
      offset_y_percent: customOffsetY,
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
