# النشر — خطوتين

الموقع مربوط بـVercel: **marketmaroc** (`prj_O28EIS7lsOCpdcnVd8r4RRwXiAP8`)
على مستودع `mounirbeni/Market`. كل push للفرع كينشر تلقائياً.

باقي غير شي حاجتين ماقدرتش نديرهم من بيئة التطوير (شوف «علاش» تحت).

---

## 1. بدّل password ديال Neon

الـconnection string القديم تعرّض. قبل أي شي:

**Neon → مشروعك → Roles → `neondb_owner` → Reset password**

انسخ الـ**Pooled connection string** الجديد.

## 2. زيد `DATABASE_URL` فـVercel

**Vercel → marketmaroc → Settings → Environment Variables**

| الحقل | القيمة |
|---|---|
| Name | `DATABASE_URL` |
| Value | الـconnection string الجديد |
| Environments | ✅ Production ✅ Preview ✅ Development |

من بعد: **Deployments → آخر واحد → ⋯ → Redeploy**

## 3. عمّر قاعدة البيانات (مرة وحدة)

من جهازك، فمجلد المشروع:

```bash
echo 'DATABASE_URL="<الـstring الجديد>"' > .env.local
npm install
npm run db:setup
```

`db:setup` = هجرة + بذر. كيطبع:

```
→ 0001_init.sql … ✓
· 16 مستخدم
· 9 معرض
· 104 إعلان (+ سجل المركبة + تاريخ الأثمنة)
```

أوامر منفصلة إلا بغيتي:

```bash
npm run db:migrate              # المخطط فقط
npm run db:migrate -- --status  # شنو تطبّق وشنو لا
npm run db:seed                 # البيانات
npm run db:seed -- --reset      # مسح وإعادة
```

---

## علاش ماقدرتش ندير 1 و2 و3

بيئة التطوير عندها سياسة خروج مقيّدة:

| | |
|---|---|
| `api.c-5.us-east-2.aws.neon.tech` | 403 — محجوب بسياسة الشبكة |
| منفذ Postgres 5432 | محجوب |
| `api.vercel.com` | غير قابل للوصول |
| أدوات Vercel المتاحة | قراءة ونشر فقط — ماكاينش ضبط متغيرات البيئة |

المخطط والبذر تجرّبو على **Postgres 16 محلي** من الصفر: قاعدة خاوية
→ `npm run db:setup` → 104 إعلان → 15 اختبار مصادقة + 9 اختبارات دردشة
كلهم ناجحين. نفس الأوامر غادي تخدم على Neon.

---

## بلا `DATABASE_URL`

الموقع كيتبنى وكينشر عادي:

- التصفح والبحث والإعلانات والمقارنة والمفضلة ✅ خدامين
- `/dashboard` كيوجّه لـ`/login` (307)
- الدخول والدردشة كيرجعو **503 برسالة واضحة**، ماشي انهيار

## SMS (اختياري، من بعد)

دابا رمز التحقق كيبان فالشاشة (وضع تطوير). ملي تضبط
`SMS_PROVIDER` فمتغيرات Vercel، الرمز ماكيرجعش أبداً للمتصفح — الشرط
مكتوب فـ`src/lib/auth.ts`.
