# شعارات الماركات — Brand logos

هاد المجلد فيه **30 شعار من 38 ماركة**. الباقي كيتعرض بشارة نصية مصمّمة.

## الوضع القانوني — قراه قبل الإطلاق

شعارات صانعي السيارات والدراجات **علامات تجارية مسجّلة**. الملفات هنا
مأخوذة من مجموعات تحت رخص مفتوحة (CC0 / MIT)، ولكن **الرخصة المفتوحة
كتّطبق على ملف SVG ماشي على العلامة التجارية**. مصدر `car-brand-logos`
كيقولها بوضوح:

> "the logos themselves remain trademarked property of their respective
> brand owners… You cannot license something you don't own; treat the logo
> files as you would any other trademark asset."

الأساس اللي كتستعمل عليه المنصات (AutoScout24، Mobile.de، Avito،
Moteur.ma) هو **الاستعمال الإشاري** (nominative fair use): كتعرّف بمنتوج
حقيقي معروض للبيع، بلا ما توحي برعاية ولا شراكة. الشروط العملية:

- استعمل الشعار غير باش تعرّف بالمركبة، ماشي فالهوية البصرية ديال الموقع
- ماتبدّلش الشعار (لا ألوان مركّبة، لا إضافات، لا دمج مع شعارك)
- ماتوحيش برعاية ولا اعتماد رسمي
- استعمل أصغر حجم كيوصّل المعلومة

**هادشي ماشي استشارة قانونية.** قبل الإطلاق التجاري، تأكد مع محامي على
الوضع فالمغرب.

## المصادر

| المصدر | الرخصة | الماركات |
|---|---|---|
| [Simple Icons](https://simpleicons.org) | CC0 1.0 | 27 |
| [car-brand-logos](https://www.npmjs.com/package/car-brand-logos) | MIT | Isuzu |
| [Arcticons](https://arcticons.onnno.nl) | CC0 / GPL-3.0 | Harley-Davidson، Royal Enfield |

## الناقصين (8)

كيتعرضو بشارة نصية دابا:

`Bajaj` · `Benelli` · `Docker` · `Haojue` · `Kawasaki` · `Kymco` · `MBK` · `SYM`

ملاحظة: `Docker` هنا هي ماركة السيارات النفعية المغربية — **ماشي** أداة
الحاويات. مجموعات الأيقونات كلها عندها `docker` = الحوت، فماخذيناهش.

## كيفاش تزيد شعار

1. حطّ الملف هنا باسم الـslug: `kawasaki.svg` (الـslugs فـ `src/lib/brands.ts`)
2. زيد الـslug فـ `OFFICIAL_LOGOS` داخل `src/lib/brands.ts`
3. خلاص — `BrandMark` غادي يعرضو فكل الموقع تلقائياً

المصدر الأنظف: **press / media kit ديال الصانع** مع الـBrand Guidelines
ديالو (مثلاً press.bmwgroup.com، global.toyota/en/newsroom،
stellantis.com/en/media). ولا API مرخّصة (Brandfetch، Clearbit).

## كيفاش تحيّد شعار

حيّد الـslug من `OFFICIAL_LOGOS` — الشارة النصية كترجع تلقائياً.
ماخاصكش تحيّد الملف.
