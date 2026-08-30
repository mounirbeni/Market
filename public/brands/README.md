# شعارات الماركات — Brand logos

هاد المجلد فيه **84 شعاراً محلياً**: 31 ملف SVG و53 ملف PNG — كل ماركات الكتالوج عندها شعار حقيقي دابا. الواجهة كتختار الامتداد المناسب تلقائياً.

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
| [theSVG](https://github.com/glincker/thesvg) | MIT | Bajaj |
| [CarLogos](https://www.carlogos.org/car-brands/) | شروط المصدر غير محددة هنا — خاص التحقق قبل الإطلاق التجاري | 38 PNG لماركات السيارات |
| صور بعثها المستخدم (بحث Google، خلفية بيضاء حُيّدت آلياً) | خاص التحقق من المصدر الأصلي قبل الإطلاق التجاري | Kawasaki، Benelli، MBK، SYM، Docker، Haojue، DFSK، GWM، Jaecoo، KGM، Lynk & Co، Neo Motors، Omoda، Seres، Kymco |

## الماركات التي ما زالت بلا شعار محلي

مافيش — كل ماركات الكتالوج (سيارات ودراجات) عندها شعار محلي حقيقي دابا.

ملاحظة: `Docker` هنا هي ماركة السيارات النفعية المغربية — **ماشي** أداة
الحاويات. المجموعات المفتوحة كلها تقريباً عندها `docker` = الحوت الأزرق، فماخذيناهش عمداً.

## كيفاش تزيد شعار — أمر واحد

حمّل ملف SVG من مصدر عندك الحق فيه، من بعد:

```bash
npm run add-logo kawasaki ~/Downloads/kawasaki.svg
```

السكريبت كيدير كلشي: كينقّي الملف (كيحيّد `<script>` ومعالجات الأحداث
والصور الخارجية)، كيتأكد من `viewBox`، كيكتبو هنا، وكيسجّلو فـ
`OFFICIAL_LOGOS`. من بعد `npm run build` وكيبان فكل الموقع.

خيار اللون إلا بغيتي توحّدو:

```bash
npm run add-logo kawasaki ~/Downloads/kawasaki.svg -- --color "#3fa535"
```

**فين تلقاهم**: press / media kit ديال الصانع مع الـBrand Guidelines ديالو. ملفات CarLogos المضافة حالياً مخزنة محلياً داخل المشروع، وماكاينش تحميل مباشر وقت التشغيل. ولا API مرخّصة (Brandfetch، Clearbit) إلا بغيتي حل جاهز بالأداء.

## كيفاش تحيّد شعار

```bash
npm run add-logo kawasaki -- --remove
```

الشارة النصية كترجع تلقائياً.
