import { GarmentAiSpec, GarmentSlot } from '../types/clothing';

/**
 * The Master Multimodal Prompt to give to any AI (ChatGPT 4o, Gemini 1.5/2.0, Claude 3.5 Sonnet)
 * along with the clothing photo. It outputs the exact companion JSON file needed for the fitting room!
 */
export const AI_COMPANION_SPEC_PROMPT_FA = `
شما یک هوش مصنوعی متخصص در تحلیل پوشاک و سیستم‌های پرو مجازی (Virtual Try-On Engine) هستید.
عکس پیوست‌شده از لباس را به دقت آنالیز کنید و مشخصات کالیبراسیون و انطباق پرو را دقیقاً در قالب ساختار JSON زیر بازگردانید. هیچ متن اضافه‌ای خارج از ساختار JSON ننویسید.

قوانین اختصاصی اسلات (Slot) و لایه‌بندی (Z-Index):
۱. تی‌شرت، پیراهن، تاپ، پولوشرت:
   - "slot": "slot_top"
   - "placement.anchor": "torso"
   - "placement.offset_y_percent": 22
   - "placement.scale": 1.0
   - "placement.z_index": 30
   - "replacement_rules.replaces_slot": "slot_top"

۲. شلوار، جین، اسلش، دامن، شلوارک:
   - "slot": "slot_bottom"
   - "placement.anchor": "waist"
   - "placement.offset_y_percent": 53
   - "placement.scale": 1.0
   - "placement.z_index": 20
   - "replacement_rules.replaces_slot": "slot_bottom"

۳. کت، کاپشن، پالتو، بارانی، هودی، سویشرت:
   - "slot": "slot_outer"
   - "placement.anchor": "shoulders"
   - "placement.offset_y_percent": 20
   - "placement.scale": 1.05
   - "placement.z_index": 40
   - "replacement_rules.replaces_slot": "slot_outer"

۴. کفش، کتانی، بوت، نیم‌بوت:
   - "slot": "slot_shoes"
   - "placement.anchor": "feet"
   - "placement.offset_y_percent": 84
   - "placement.scale": 0.85
   - "placement.z_index": 10
   - "replacement_rules.replaces_slot": "slot_shoes"

ساختار خروجی JSON که باید بازگردانید:
\`\`\`json
{
  "garment_id": "شناسه منحصربفرد، مثلا: TOP-TSHIRT-01 یا PNT-JEAN-02",
  "name_fa": "نام زیبای فارسی لباس بر اساس عکس، مثلا: تی‌شرت اورسایز نخ پنبه مشکی",
  "name_en": "English Product Name",
  "category": "tshirt" | "shirt" | "hoodie" | "sweater" | "pants" | "jeans" | "shorts" | "skirt" | "jacket" | "coat" | "shoes" | "accessory",
  "slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes" | "slot_accessory",
  "placement": {
    "anchor": "torso" | "waist" | "shoulders" | "feet" | "head",
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
    "primary_color_fa": "نام رنگ غالب به فارسی",
    "primary_color_en": "Color Name in English",
    "color_hex": "#RRGGBB",
    "fabric_type": "جنس پارچه (مثلا: نخ پنبه ۱۰۰٪، دنیم کشسان، چرم)",
    "fit_style": "regular" | "oversized" | "slim" | "relaxed",
    "season": "spring_summer" | "fall_winter" | "all_season",
    "estimated_price_toman": 850000
  }
}
\`\`\`
`.trim();

export const AI_COMPANION_SPEC_PROMPT_EN = `
You are a Fashion AI and 3D Virtual Try-On Calibration Engine.
Analyze the attached clothing photograph and output a strict JSON calibration file according to the VTON Slot Replacement Architecture.
Return ONLY valid JSON with no markdown wrapping.

SLOT SPECIFICATIONS:
1. Tops (T-shirt, shirt, polo, blouse, knit):
   - "slot": "slot_top"
   - "placement.anchor": "torso"
   - "placement.offset_y_percent": 22
   - "placement.z_index": 30
   - "replaces_slot": "slot_top"

2. Bottoms (Pants, jeans, trousers, skirts, shorts):
   - "slot": "slot_bottom"
   - "placement.anchor": "waist"
   - "placement.offset_y_percent": 53
   - "placement.z_index": 20
   - "replaces_slot": "slot_bottom"

3. Outerwear (Jacket, coat, hoodie, blazer, cardigan):
   - "slot": "slot_outer"
   - "placement.anchor": "shoulders"
   - "placement.offset_y_percent": 20
   - "placement.z_index": 40
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
 */
export function normalizeGarmentAiSpec(inputJson: any, fallbackName: string = 'لباس جدید'): GarmentAiSpec {
  const json = typeof inputJson === 'string' ? JSON.parse(inputJson) : inputJson;

  let slot: GarmentSlot = 'slot_top';
  const rawSlot = (json.slot || '').toLowerCase();
  const rawCat = (json.category || '').toLowerCase();
  const rawName = (json.name_fa || json.name_en || fallbackName).toLowerCase();

  if (rawSlot.includes('bottom') || rawCat.includes('pant') || rawCat.includes('jean') || rawCat.includes('skirt') || rawCat.includes('short') || rawName.includes('شلوار') || rawName.includes('جین') || rawName.includes('دامن')) {
    slot = 'slot_bottom';
  } else if (rawSlot.includes('outer') || rawCat.includes('jacket') || rawCat.includes('coat') || rawCat.includes('hoodie') || rawName.includes('کت') || rawName.includes('کاپشن') || rawName.includes('پالتو') || rawName.includes('هودی')) {
    slot = 'slot_outer';
  } else if (rawSlot.includes('shoe') || rawCat.includes('shoe') || rawName.includes('کفش') || rawName.includes('کتانی') || rawName.includes('کتونی') || rawName.includes('بوت')) {
    slot = 'slot_shoes';
  } else {
    slot = 'slot_top';
  }

  const defaultPlacement = {
    slot_top: { anchor: 'torso' as const, offset_x_percent: 0, offset_y_percent: 22, scale: 1.0, z_index: 30 },
    slot_bottom: { anchor: 'waist' as const, offset_x_percent: 0, offset_y_percent: 53, scale: 1.0, z_index: 20 },
    slot_outer: { anchor: 'shoulders' as const, offset_x_percent: 0, offset_y_percent: 20, scale: 1.05, z_index: 40 },
    slot_shoes: { anchor: 'feet' as const, offset_x_percent: 0, offset_y_percent: 84, scale: 0.85, z_index: 10 },
    slot_accessory: { anchor: 'head' as const, offset_x_percent: 0, offset_y_percent: 8, scale: 0.6, z_index: 50 },
  }[slot];

  return {
    garment_id: json.garment_id || `GARMENT-${Date.now().toString().slice(-5)}`,
    name_fa: json.name_fa || fallbackName,
    name_en: json.name_en || 'Virtual Garment',
    category: json.category || (slot === 'slot_bottom' ? 'pants' : slot === 'slot_outer' ? 'jacket' : slot === 'slot_shoes' ? 'shoes' : 'tshirt'),
    slot,
    placement: {
      anchor: json.placement?.anchor || defaultPlacement.anchor,
      offset_x_percent: typeof json.placement?.offset_x_percent === 'number' ? json.placement.offset_x_percent : defaultPlacement.offset_x_percent,
      offset_y_percent: typeof json.placement?.offset_y_percent === 'number' ? json.placement.offset_y_percent : defaultPlacement.offset_y_percent,
      scale: typeof json.placement?.scale === 'number' ? json.placement.scale : defaultPlacement.scale,
      z_index: typeof json.placement?.z_index === 'number' ? json.placement.z_index : defaultPlacement.z_index,
    },
    replacement_rules: {
      replaces_slot: slot,
      compatible_slots: ['slot_top', 'slot_bottom', 'slot_outer', 'slot_shoes'].filter(s => s !== slot) as GarmentSlot[],
    },
    style_details: {
      primary_color_fa: json.style_details?.primary_color_fa || 'کلاسیک',
      primary_color_en: json.style_details?.primary_color_en || 'Classic',
      color_hex: json.style_details?.color_hex || '#333333',
      fabric_type: json.style_details?.fabric_type || 'الیاف ترکیبی استاندارد',
      fit_style: json.style_details?.fit_style || 'regular',
      season: json.style_details?.season || 'all_season',
      estimated_price_toman: Number(json.style_details?.estimated_price_toman) || 850000,
    },
  };
}
