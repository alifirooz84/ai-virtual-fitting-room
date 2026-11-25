# سامانه هوشمند پرو مجازی چندفروشگاهی و مانکن سه‌بعدی
## (Smart Multi-Store AI Virtual Fitting Room — Slot Architecture v2)

این پروژه یک پلتفرم نسل جدید برای **پرو مجازی پوشاک (Virtual Try-On)** است که بر پایه **معماری تفکیک اسلات‌ها (Slot Replacement System)** و دریافت همزمان **تصویر شفاف لباس + فایل کالیبراسیون JSON هوش مصنوعی** طراحی شده است.

---

## 🎯 چرا این ساختار مشکل پرو و جایگزینی اشتباه را حل کرده است؟

در پرو مجازی، بزرگ‌ترین چالش این است که وقتی مشتری تی‌شرت را انتخاب کرد و سپس شلوار را انتخاب می‌کند، نباید شلوار جایگزین تی‌شرت شود! بلکه باید روی خط کمر زیر تی‌شرت ست شود؛ و فقط زمانی که مشتری یک **تی‌شرت دیگر** را کلیک کرد، تی‌شرت جدید جایگزین تی‌شرت قبلی شود.

در این سامانه ۴ اسلات مستقل با لایه‌بندی Z-Index تعریف شده است:
1. **اسلات بالاتنه (`slot_top`):** تی‌شرت، پیراهن، تاپ، هودی (لایه ۳۰ در ارتفاع $Y=22\%$) ⬅️ **فقط با بالاتنه بعدی جایگزین می‌شود.**
2. **اسلات پایین‌تنه (`slot_bottom`):** شلوار جین، کتان، اسلش، دامن (لایه ۲۰ در ارتفاع $Y=53\%$) ⬅️ **فقط با پایین‌تنه بعدی جایگزین می‌شود.**
3. **اسلات لباس‌رو (`slot_outer`):** کت، کاپشن، پالتو، بارانی (لایه ۴۰ در ارتفاع $Y=20\%$) ⬅️ **روی تی‌شرت می‌نشیند و تی‌شرت را حذف نمی‌کند.**
4. **اسلات کفش (`slot_shoes`):** کتانی، کفش رسمی، بوت (لایه ۱۰ در ارتفاع $Y=84\%$) ⬅️ **فقط با کفش بعدی جایگزین می‌شود.**

---

## 🤖 پرامپت اختصاصی جهت استخراج فایل JSON از هوش مصنوعی

این پرامپت را همراه با هر عکس لباس به یکی از هوش‌های مصنوعی چندحالته (مانند **ChatGPT 4o**، **Gemini 1.5/2.0** یا **Claude 3.5 Sonnet**) بدهید تا فایل JSON استاندارد لباس را برای شما استخراج کند:

```text
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

ساختار خروجی JSON:
{
  "garment_id": "شناسه منحصربفرد، مثلا: TOP-TSHIRT-01",
  "name_fa": "نام دقیق فارسی لباس بر اساس عکس، مثلا: تی‌شرت نخ پنبه سفید",
  "name_en": "White Cotton Crewneck Tee",
  "category": "tshirt" | "shirt" | "pants" | "jeans" | "jacket" | "coat" | "shoes",
  "slot": "slot_top" | "slot_bottom" | "slot_outer" | "slot_shoes",
  "placement": {
    "anchor": "torso" | "waist" | "shoulders" | "feet",
    "offset_x_percent": 0,
    "offset_y_percent": 22,
    "scale": 1.0,
    "z_index": 30
  },
  "replacement_rules": {
    "replaces_slot": "slot_top",
    "compatible_slots": ["slot_bottom", "slot_outer", "slot_shoes"]
  },
  "style_details": {
    "primary_color_fa": "سفید",
    "primary_color_en": "White",
    "color_hex": "#ffffff",
    "fabric_type": "۱۰۰٪ نخ پنبه",
    "fit_style": "regular",
    "season": "all_season",
    "estimated_price_toman": 680000
  }
}
```

---

## 🏬 صفحه و دیتابیس اختصاصی هر فروشگاه

- **ویترین مستقل:** هر فروشگاه دارای آدرس مجزا (مانند `?store=zara-modern`, `?store=harajuku-streetwear`, `?store=maison-niloufar`) است.
- **دیتابیس مجزا:** محصولات هر فروشگاه با شناسه `storeSlug` در فایل `server/data/products.json` ذخیره می‌شوند و مشتری هنگام بازدید از یک بوتیک، فقط البسه همان فروشگاه را می‌بیند.
- **امکان ایجاد نامحدود بوتیک جدید:** از طریق مودال «فهرست فروشگاه‌ها» با تعیین نام، شهر و لوگو.

---

## 📸 صفحه آپلود دوگانه (عکس شفاف + فایل JSON)

در تب **«آپلود لباس و فایل JSON»**:
1. عکس شفاف لباس را آپلود کنید (یا از طریق دوربین زنده عکس بگیرید).
2. فایل JSON خروجی هوش مصنوعی را انتخاب کنید یا متن آن را در ادیتور پیست کنید (یا از دکمه‌های آماده تی‌شرت/شلوار/کت برای تست فوری استفاده کنید).
3. موقعیت عمودی ($Y$) و مقیاس ($Scale$) را در پیش‌نمایش زنده مانکن مشاهده کرده و در صورت تمایل با اسلایدر تنظیم کنید.
4. دکمه **«ذخیره مستقیم در دیتابیس فروشگاه»** را بزنید تا محصول ثبت شود.
5. با زدن **«پرو فوری روی مانکن»**، لباس بلافاصله روی مانکن قرار می‌گیرد.

---

## 🚀 نحوه نصب و اجرای پروژه

### ۱. نصب وابستگی‌ها
در پوشه استخراج‌شده، ترمینال را باز کنید:
```bash
npm install
```

### ۲. اجرای پروژه
برای اجرای نسخه پروداکشن (تست‌شده و سریع):
```bash
npm start
```
یا برای حالت توسعه (Live Reload):
```bash
npm run dev
```

### ۳. مشاهده در مرورگر
آدرس زیر را در مرورگر باز کنید:
```
http://localhost:3000
```
