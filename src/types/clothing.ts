/**
 * Universal Slot-Based Clothing Specification Schema
 * Precise Layering & Spatial Anchor Engine
 */

export type GarmentSlot = 'slot_top' | 'slot_bottom' | 'slot_outer' | 'slot_shoes' | 'slot_accessory';

export type LayerLevel = 'shoes' | 'bottom' | 'mid_top' | 'outerwear' | 'accessory';

export interface GarmentPlacement {
  anchor: 'torso' | 'waist' | 'shoulders' | 'feet' | 'head';
  offset_x_percent: number; // 0 (centered)
  offset_y_percent: number; // 22% for top, 53% for bottom, 20% for outer, 84% for shoes
  scale: number; // normalized fit scale (e.g. 1.0 or 1.05 for jackets)
  z_index: number; // 10: shoes, 20: bottom (under top), 30: top (over pants), 40: outer (over top), 50: acc
  width_percent?: number;
  rotation_deg?: number;
}

export interface GarmentAiSpec {
  garment_id: string;
  name_fa: string;
  name_en: string;
  category: 'tshirt' | 'shirt' | 'hoodie' | 'sweater' | 'pants' | 'jeans' | 'shorts' | 'skirt' | 'jacket' | 'coat' | 'shoes' | 'accessory';
  slot: GarmentSlot;
  layer_level?: LayerLevel;
  placement: GarmentPlacement;
  replacement_rules: {
    replaces_slot: GarmentSlot;
    compatible_slots: GarmentSlot[];
  };
  style_details: {
    primary_color_fa: string;
    primary_color_en: string;
    color_hex: string;
    fabric_type: string;
    fit_style: 'slim' | 'regular' | 'oversized' | 'relaxed';
    season: 'spring_summer' | 'fall_winter' | 'all_season';
    estimated_price_toman: number;
  };
}

export interface ClothingProduct {
  id: string;
  storeSlug: string;
  storeName: string;
  title: string;
  price: number;
  category: string;
  slot: GarmentSlot;
  imageUrl: string; // transparent RGBA cutout PNG from Gemini / photographer
  placement: GarmentPlacement;
  spec: GarmentAiSpec;
  createdAt: string;
}

export interface StoreProfile {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  city: string;
  description: string;
  badge: string;
  logoEmoji: string;
  themeColor: string;
  createdAt: string;
}

export type ActiveOutfit = Partial<Record<GarmentSlot, ClothingProduct>>;
