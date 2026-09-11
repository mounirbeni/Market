# 02 — Visual Identity

هذا الملف يوثق اللغة البصرية الموجودة فعلياً في Tarique ثم يوضح امتداداتها الآمنة خارج واجهة المنتج.

المصادر الأساسية: `src/app/globals.css`, `src/components/Logo.tsx`, `src/app/icon.svg`, `src/app/[lang]/layout.tsx`.

---

# 1. الشعار

## العلامة الأساسية

الشعار الأيقوني عبارة عن:

- **نجمة زليجية ثمانية**.
- تدرج أزرق قطري.
- **طريق أبيض** في المركز يتجه بصرياً إلى الأمام/الأعلى.
- خط أبيض متقطع في وسط الطريق.

### التدرج الرسمي داخل العلامة

| Stop | Color |
|---|---|
| 0% | `#5A8EF7` |
| 55% | `#1F5FE0` |
| 100% | `#103FA3` |

النسخة المتجهية الأصلية الحالية: `src/app/icon.svg`.

## الـwordmark في الواجهة

البنية الحالية في `Logo.tsx`:

- السطر الرئيسي: **طريق**
- تحته بحجم أصغر: **TARIQUE**
- العربية تستخدم Display/Kufi.
- اللاتينية تستخدم خط الأرقام/اللاتينية.
- `TARIQUE` بحروف كبيرة وtracking قدره تقريباً `0.26em` في المكوّن الحالي.

## أنماط الاستعمال الموجودة

- **Full logo:** العلامة + طريق + TARIQUE.
- **Compact logo:** العلامة الأيقونية فقط.
- App icon / PWA icon: العلامة الأيقونية.

## قاعدة الاسم داخل المواد البصرية

- النص العادي: `Tarique`
- الـwordmark: `TARIQUE`
- العربية: `طريق`
- الدومين: `tarique.ma`

لا يُعاد رسم النجمة بنسب مختلفة، ولا يُستبدل الطريق بحرف T، ولا تُستخدم أسماء سابقة.

## Clear space

**لا يوجد clear-space رسمي معرف رقمياً في المنتج الحالي.**

كامتداد إنتاجي، يجب أن تبقى العلامة غير ملتصقة بحواف التصميم أو النصوص. أي دليل رقمي مستقبلي للمساحة الآمنة يجب اعتباره إضافة جديدة للهوية، وليس قيمة مأخوذة من الواجهة الحالية.

---

# 2. اللون

## Brand Blue

| Token | Hex | الدور |
|---|---|---|
| Blue 50 | `#EFF5FF` | خلفيات زرقاء شديدة الخفة |
| Blue 100 | `#DBE8FF` | أسطح ناعمة |
| Blue 200 | `#BCD3FF` | خطوط/درجات ثانوية |
| Blue 300 | `#8FB4FF` | Highlight |
| Blue 400 | `#5A8EF7` | العلامة في الوضع الداكن / بداية gradient |
| **Blue 500** | **`#1F5FE0`** | **اللون الرئيسي للعلامة** |
| Blue 600 | `#1550CC` | Hover / عمق |
| Blue 700 | `#103FA3` | نهاية gradient والشعار |
| Blue 800 | `#0D2F78` | أزرق عميق |

## Navy

| Token | Hex |
|---|---|
| Navy 950 | `#06152C` |
| Navy 900 | `#0A1E3D` |
| Navy 800 | `#0E2B56` |
| Navy 700 | `#14386E` |

الكحلي هو لون الثقة، النص الثقيل، الهيدر، والخلفيات التقنية الداكنة.

## Slate

`#F7F9FD` · `#EEF3FB` · `#DFE8F5` · `#C6D4E8` · `#93A5BF` · `#6B7F9C` · `#4A5C78` · `#2F3F58`

هذه العائلة تجعل الأبيض في Tarique بارداً قليلاً ومائلاً للبيانات/التقنية بدل الأبيض التجاري الدافئ.

## ألوان الحالة

| المعنى | Light | Dark/secondary |
|---|---|---|
| نجاح / ثقة جيدة | `#16A34A` | `#22C55E` |
| تحذير | `#D97706` | `#F59E0B` |
| خطر / خطأ | `#DC2626` | `#EF4444` |
| Data | `#4F46E5` | `#818CF8` في dark mode |
| Teal utility | `#0D9488` | — |
| Violet utility | `#7C3AED` | — |

هذه ألوان دلالية، وليست بدائل عشوائية للـBrand Blue.

---

# 3. Light Mode

| Role | Value |
|---|---|
| Main background | `#FFFFFF` |
| Deep background | `#F4F8FE` |
| Surface 1 | `#FFFFFF` |
| Surface 2 | `#F7FAFE` |
| Surface 3 | `#EEF3FB` |
| Hover surface | `#E3ECFA` |
| Main line | `#DDE6F2` |
| Soft line | `#E9EFF8` |
| Strong line | `#C6D4E8` |
| Main text | `#0A1E3D` |
| Muted text | `#4A5C78` |
| Dim text | `#7D8EA8` |
| Brand | `#1F5FE0` |
| Brand soft | `#EAF1FF` |
| Brand text/ink | `#FFFFFF` |
| Brand hover | `#1550CC` |

### Header gradient

`linear-gradient(100deg, #08192F 0%, #0D2A55 55%, #123A72 100%)`

Navigation text: white.  
Muted navigation text: `#A9C0E0`.

---

# 4. Dark Mode

| Role | Value |
|---|---|
| Main background | `#071426` |
| Deep background | `#050F1D` |
| Surface 1 | `#0C1C31` |
| Surface 2 | `#0F2138` |
| Surface 3 | `#162B46` |
| Hover surface | `#1C3454` |
| Line | `#22395A` |
| Soft line | `#1A2D49` |
| Strong line | `#2E4A72` |
| Main text | `#EEF4FD` |
| Muted text | `#9DB1CD` |
| Dim text | `#6E83A3` |
| Brand | `#5A8EF7` |
| Brand soft | `rgba(90,142,247,.14)` |
| Brand ink | `#05122A` |
| Brand hover | `#8FB4FF` |

Dark navigation gradient:

`linear-gradient(100deg, #050F1D 0%, #0A1E3D 55%, #0E2B56 100%)`

---

# 5. Typography

## Body

**IBM Plex Sans Arabic**  
Weights loaded: `400, 500, 600, 700`  
Arabic + Latin subsets.

الدور: النصوص، الشرح، النماذج، الواجهة، الفقرات، الأزرار.

## Display / Headlines

**Noto Kufi Arabic**  
Weights loaded: `500, 700, 800`.

الدور: العناوين والهوية. التعليق البرمجي يصفه بأنه “كوفي معماري يعطي الهوية المغربية”.

خصائص العناوين العامة في المنتج:

- Bold/700 أو 800.
- line-height ضيق ومنظم.
- tracking سلبي خفيف في العناوين.
- `h-page`: حتى `3.25rem` تقريباً، weight 800، line-height `1.12`.
- `h-section`: حتى `2.1rem` تقريباً، weight 800.

## Numbers / Latin data

**Space Grotesk**  
Weights: `500, 600, 700`.

الدور:

- الأرقام.
- الأسعار.
- الكيلومتراج.
- الإحصائيات.
- النص اللاتيني الصغير في الـwordmark.

الأرقام تُعرض لاتينية دائماً، `tabular-nums`، وباتجاه LTR حتى داخل الواجهة العربية.

---

# 6. الشكل الهندسي

## Corner radii

| Token | Value |
|---|---|
| XS | `6px` تقريباً (`0.375rem`) |
| SM | `8px` |
| MD | `12px` |
| LG | `16px` |
| XL | `20px` |
| 2XL | `28px` |
| Buttons/chips | Pill / `99px` |

الهوية ليست Sharp/industrial بالكامل ولا bubbly. البطاقات مستديرة باعتدال، والأزرار الأساسية pill-shaped.

## Cards

الـcard الأساسية:

- Surface أبيض/داكن بحسب الوضع.
- Border خفيف.
- Radius `16px`.
- Shadow منخفض جداً.
- Hover يرفع البطاقة `3px` فقط ويزيد الظل.

هذا يحدد لغة بصرية هادئة؛ عناصر الواجهة لا “تطير” ولا تستخدم 3D مبالغاً فيه.

## Shadows

Light mode:

- Small: `0 1px 2px rgba(10,30,61,.06)`
- Medium: `0 10px 26px -14px rgba(10,30,61,.22)`
- Large: `0 24px 54px -26px rgba(10,30,61,.30)`

الظلال زرقاء-كحلية خافتة، وليست سوداء ثقيلة.

---

# 7. Zellige Signature

Tarique تحتوي على نقش زليج هندسي حقيقي داخل CSS:

- Tile size: `72 × 72px`.
- Stroke الأساسي في الأصل: `#1F5FE0`.
- أشكال diamond متداخلة + دائرة مركزية.
- Opacity: `0.035` في light و`0.05` في dark.

**المعنى:** الزليج هنا watermark هندسي رقيق؛ لا يتحول إلى خلفية ملونة صاخبة.

### Creative derivative

في مواد 3D أو Motion يمكن تحويل نفس المنطق إلى:

- شبكة زليج محفورة أو embossed.
- انعكاس خافت على أرضية.
- Extrusion بسيط للنجمة الثمانية.
- خطوط grid/data مستوحاة من الزليج.

لكن العنصر يجب أن يظل هندسياً وتقنياً أكثر من كونه ديكوراً تقليدياً.

---

# 8. Glow & Data Atmosphere

الواجهة تستعمل radial glows زرقاء منخفضة الشدة:

- Brand glow قريب من أعلى المشهد.
- Data glow جانبي/علوي.

هذا يبرر في الإعلانات استخدام ضوء أزرق ناعم أو هالة بيانات حول مركبة/بطاقة، وليس neon cyberpunk كثيف.

---

# 9. UI Language

## Buttons

- Primary: Brand blue + white.
- Shape: pill.
- Weight: 700.
- Hover: أزرق أعمق + رفع `1px`.

## Chips

- Pill-shaped.
- Surface 3.
- Text muted.
- Border خفيف.

## Tags

Semantic colored tags:

- Green = good/verified.
- Amber = warning/attention.
- Red = issue/risk.
- Indigo = data.

## Inputs

- Surface 3.
- Radius 8px.
- Border subtle.
- Focus بالـBrand Blue.

## Dividers

يوجد `rule-diamond`: خط فاصل بلمسة diamond في المنتصف/التركيب، ما ينسجم مع هندسة الزليج.

---

# 10. Motion Tokens الموجودة فعلياً

## Easing

- Soft: `cubic-bezier(0.22, 1, 0.36, 1)`
- Spring: `cubic-bezier(0.34, 1.4, 0.64, 1)`

## UI motion

- Rise: `500ms` من opacity 0 و`translateY(12px)` إلى الوضع الطبيعي.
- Fade: `400ms`.
- Card hover: `400ms`, translateY `-3px`.
- Button transitions: `200ms`.
- Button hover lift: `-1px`.
- Meter: width transition `500ms`.
- Marquee: `48s linear infinite` ويتوقف عند hover.

هذه الأرقام هي أقرب شيء إلى “motion DNA” رسمي داخل المنتج.

---

# 11. الاتجاه RTL / LTR

الهوية ثنائية اللغة structurally، وليست مجرد ترجمة نصوص:

- العربية: RTL.
- الفرنسية: LTR.
- الأسهم الاتجاهية تنقلب بحسب اللغة.
- الأرقام تبقى LTR ومعزولة.

أي Key Visual أو Motion Template ثنائي اللغة يجب أن يعتبر الاتجاه جزءاً من التكوين، لا مجرد محاذاة النص بعد الانتهاء.

---

# 12. ما يجب أن يبقى ثابتاً خارج المنتج

عند الانتقال من UI إلى إعلان أو CGI أو فيديو، الثوابت الأكثر أهمية هي:

1. شكل العلامة الثمانية والطريق.
2. Brand Blue `#1F5FE0` وعائلته.
3. Navy كقاعدة ثقة/تقنية.
4. Kufi للعناوين العربية.
5. Space Grotesk للبيانات والأرقام.
6. زليج هندسي منخفض الشدة.
7. White/blue data clarity.
8. استخدام أخضر/عنبر/أحمر كدلالة لا كـbrand palette رئيسية.
9. حركة ناعمة قصيرة، لا bounce كرتوني.
10. التوازن بين المغرب الحديث وعالم السيارات والبيانات.
