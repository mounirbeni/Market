# شعارات الماركات — Brand logos

هاد المجلد خاوي عن قصد. **ماكنشحنو حتى شعار رسمي مع الكود.**

## علاش

شعارات صانعي السيارات والدراجات (Mercedes، BMW، Yamaha…) **علامات
تجارية مسجّلة**. ملف SVG كيمكن يكون تحت رخصة مفتوحة (CC0 مثلاً) — ولكن
الرخصة كتتنازل على **حقوق النسخ** فقط، ماكتعطيكش أي حق فـ**العلامة
التجارية**. مشروع Simple Icons بنفسو كيقول:

> "Simple Icons cannot be held responsible for any legal activity raised
> by a brand, or users of the package."

## كيفاش تحصل عليهم بشكل سليم

1. **Press / Media kit ديال الصانع** — أغلب الشركات كتوفّر شعاراتها
   مع «Brand Guidelines» كتحدد الاستعمال المسموح. هادي أنظف طريقة.
   مثلاً: stellantis.com/en/media، press.bmwgroup.com، global.toyota/en/newsroom.
2. **API مرخّصة للشعارات** — خدمات كتبيع ترخيص استعمال (Brandfetch،
   Clearbit Logo API وغيرهم). كتخلّص وكتاخذ رخصة مكتوبة.
3. **استشارة محامي** على «الاستعمال الإشاري» (nominative fair use) فالمغرب.
   المنصات الكبيرة (AutoScout24، Mobile.de، Avito، Moteur.ma) كتعرض
   الشعارات على هاد الأساس: كتعرّف بمنتوج حقيقي معروض للبيع، بلا ما توحي
   برعاية ولا شراكة. لكن هادشي قرار ديالك مع محاميك، ماشي ديالي.

## كيفاش تفعّلهم من بعد

1. حطّ الملف هنا باسم الـslug: `mercedes.svg`، `yamaha.svg`، `land-rover.svg`
   (الـslugs كاملة فـ `src/lib/brands.ts`).
2. زيد الـslug فـ `OFFICIAL_LOGOS` داخل `src/lib/brands.ts`:
   ```ts
   export const OFFICIAL_LOGOS = new Set<string>(["mercedes", "yamaha"]);
   ```
3. خلاص. `BrandMark` غادي يعرض الشعار بدل الشارة النصية فكل الموقع
   تلقائياً — بلا أي تعديل آخر.

## حتى ذاك الوقت

كنعرضو شارة نصية مصمّمة: اسم الماركة بالحروف اللاتينية مع لون مرجعي.
تصميم ديالنا، صفر خطر قانوني.
