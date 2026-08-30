export type GuideIcon =
  | "ClipboardCheck" | "Diagnostic" | "Odometer" | "FileText"
  | "OilCan" | "Moto" | "Piston" | "BrakeRotor";

export interface Guide {
  slug: string;
  kind: "car" | "moto" | "general";
  title: string;
  excerpt: string;
  /** اسم الأيقونة من مجموعة أيقونات الميكانيك */
  icon: GuideIcon;
  readMinutes: number;
  updated: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "chira-tomobil-mostaamla",
    icon: "ClipboardCheck",
    kind: "car",
    title: "كيفاش تشري سيارة مستعملة فالمغرب بلا ما تتغلّط",
    excerpt:
      "من تحديد الميزانية حتى تحويل الملكية — كل خطوة بالتفصيل، مع الأخطاء اللي كيديرها أغلب المشترين.",
    readMinutes: 8,
    updated: "2026-07-12",
    sections: [
      {
        heading: "1. حدّد الميزانية الحقيقية ماشي غير ثمن الشراء",
        body: [
          "أغلب المشترين كيحسبو غير ثمن السيارة وكينساو باقي التكاليف. قبل ما تبدا تقلّب، حسب الميزانية الكاملة: ثمن الشراء + التأمين للسنة الأولى + الفينيات + تحويل الملكية + الصيانة الأولى (زيت، فلاتر، إطارات).",
          "قاعدة عملية: زيد 12٪ من ثمن السيارة كتكاليف السنة الأولى. سيارة بـ120 ألف درهم كتحتاج تقريباً 14 ألف درهم إضافية.",
        ],
      },
      {
        heading: "2. اختار الموديل قبل ما تختار الإعلان",
        body: [
          "خطأ شائع: المشتري كيشوف إعلان رخيص وكيمشي يشوفو بلا ما يعرف واش هاد الموديل معروف بمشاكل. قبل أي شي، حدّد 2 ولا 3 موديلات وقرا عليهم.",
          "شوف: قطع الغيار واش متوفرة ورخيصة فالمغرب؟ الميكانيسيان كيعرفوه؟ الاستهلاك شحال؟ قيمة إعادة البيع كيفاش؟",
        ],
      },
      {
        heading: "3. قارن الثمن مع السوق قبل ما تتصل",
        body: [
          "ماتفاوضش على أساس الإحساس. حدّد الثمن المرجعي ديال الموديل بنفس السنة والكيلومتراج تقريباً، ومن بعد شوف الفارق.",
          "إذا كان الثمن أقل بـ30٪ فما فوق من السوق، هادي علامة خطر ماشي فرصة: إما المركبة عندها مشكل خطير، إما محجوزة ولا مرهونة، إما الإعلان كذّاب.",
        ],
      },
      {
        heading: "4. شنو تشوف فوقت المعاينة",
        body: ["تلاقاو نهاراً وفبلاصة عامة. المحرك خاصو يكون بارد ملي توصل — إلا لقيتيه سخون، البائع شعّلو قبل باش يخبي مشكل فالتشغيل."],
        list: [
          "سماكة الصباغة: فرق كبير بين القطع = صباغة جديدة = صدمة سابقة",
          "فراغات القطع (الأبواب، الكابو): خاصهم يكونو متساويين",
          "أرضية الصندوق تحت الموكيط: صدأ ولا آثار لحام",
          "رقم الهيكل على المركبة = اللي فالبطاقة الرمادية",
          "الإطارات: تاريخ الصنع (DOT) والتآكل واش متساوي",
          "الدخان من العادم: أزرق = زيت، أبيض كثيف = ماء فالمحرك",
        ],
      },
      {
        heading: "5. التجربة على الطريق",
        body: [
          "ماتقنعش بدورة 5 دقائق فالحومة. جرّب على الأقل 15 دقيقة: فالمدينة وفالطريق السيار.",
          "ركّز على: الفرامل واش كتشدّ نيشان، التوجيه واش كيهزّ، السرعات واش كتدخل بسلاسة، والمكيف واش كيبرّد بزّاف.",
        ],
      },
      {
        heading: "6. الوثائق — هنا كتوقع المشاكل الكبيرة",
        body: ["ماتدفعش حتى درهم قبل ما تشوف الوثائق بعينيك:"],
        list: [
          "البطاقة الرمادية أصلية وفسمية البائع الحاضر معاك",
          "البطاقة الوطنية ديال البائع مطابقة للاسم",
          "شهادة عدم الرهن (باش تتأكد ماكاين لا قرض لا حجز)",
          "الفحص التقني ساري المفعول",
          "وصولات الفينيات مدفوعة",
        ],
      },
      {
        heading: "7. التفاوض والأداء",
        body: [
          "فاوض على أساس أرقام ماشي عواطف: «الإطارات خاصهم تبديل، هادي 3000 درهم» أقوى بزاف من «نقّص شوية».",
          "الأداء يكون بتحويل بنكي موثّق ولا بحضور شهود، مع عقد بيع مكتوب بنسختين فيه الثمن والتاريخ ورقم الهيكل ونسخ البطائق.",
        ],
      },
      {
        heading: "8. بعد الشراء",
        body: [
          "دير تحويل الملكية فأقرب وقت — إلا ماديرتيهاش، البائع كيبقى مسجّل كمالك وأنت اللي غادي تخلّص المخالفات.",
          "غيّر الزيت والفلاتر مباشرة حتى لو قال ليك البائع راه غيّرهم، وشوف سير التوزيع واش دازت مدتو.",
        ],
      },
    ],
  },
  {
    slug: "fahs-qabl-chira",
    icon: "Diagnostic",
    kind: "car",
    title: "لائحة الفحص قبل الشراء: 20 نقطة تقدر تشوفهم بعينيك",
    excerpt: "ماشي محتاج تكون ميكانيسيان. هاد النقط كيقدر يشوفهم أي واحد وكيكشفو أغلب المشاكل.",
    readMinutes: 6,
    updated: "2026-06-28",
    sections: [
      {
        heading: "الهيكل والصباغة",
        body: ["دور حول المركبة فالضو الطبيعي وشوف من زاوية مائلة:"],
        list: [
          "اختلاف درجة اللون بين القطع",
          "فراغات غير متساوية بين الأبواب والكابو",
          "رؤوس البراغي فالكابو والأبواب واش مفكوكة من قبل",
          "الصدأ تحت الأبواب وفعتبة الباب",
          "الزجاج: العلامة والتاريخ خاصهم يكونو نفس الشي فكل الزجاج",
        ],
      },
      {
        heading: "المحرك",
        body: ["افتح الكابو والمحرك بارد:"],
        list: [
          "مستوى الزيت ولونو (أسود غليظ = صيانة مهملة)",
          "لون سائل التبريد وواش فيه زيت",
          "تسريبات تحت المحرك وحول الحشوة",
          "حالة السيور والأنابيب",
          "البطارية: تاريخها وحالة الأقطاب",
        ],
      },
      {
        heading: "الداخل",
        body: ["الداخل كيحكي على الاستعمال الحقيقي ماشي على العدّاد:"],
        list: [
          "تآكل المقود ودواسة الفرامل — إلا كانو مستهلكين بزاف والعدّاد قليل، فيها إشكال",
          "المقعد ديال السائق واش هابط",
          "كل الأضواء التحذيرية كتشعل ملي تدير الكونطاك ومن بعد كتطفا",
          "المكيف كيبرّد فأقل من دقيقتين",
          "كل الأزرار والزجاج الكهربائي خدامين",
        ],
      },
      {
        heading: "العجلات والفرامل",
        body: [],
        list: [
          "تآكل الإطارات متساوي (تآكل من جهة وحدة = مشكل فالجيومتري ولا فالتعليق)",
          "الإطارات الأربعة نفس العلامة والمقاس",
          "سماكة أقراص الفرامل ووجود حزّ عميق",
          "العجلة الاحتياطية والعدّة موجودين",
        ],
      },
      {
        heading: "النقطة الأهم",
        body: [
          "بعد ما تشوف كلشي وتعجبك المركبة، دوّزها من ميكانيسيان مستقل — ماشي ديال البائع. 400 درهم ديال الفحص ممكن توفّر عليك 20 ألف درهم ديال الإصلاح.",
        ],
      },
    ],
  },
  {
    slug: "tomobil-maghchocha",
    icon: "Odometer",
    kind: "car",
    title: "كيفاش تعرف السيارة المغشوشة والعدّاد المرجوع",
    excerpt: "الغش فالعدّاد وفتاريخ الحوادث كيكلّف المشتري عشرات الآلاف. هاكيفاش تكشفو.",
    readMinutes: 5,
    updated: "2026-05-20",
    sections: [
      {
        heading: "العدّاد المرجوع",
        body: [
          "رجوع العدّاد ولّى ساهل بالأجهزة الرقمية. الطريقة الوحيدة الموثوقة هي المقارنة بين الرقم المعروض وحالة المركبة الحقيقية.",
        ],
        list: [
          "المعدل فالمغرب بين 12 و20 ألف كم فالسنة. سيارة 2015 بـ60 ألف كم فقط = علامة سؤال كبيرة",
          "قارن مع تآكل المقود والدواسات والمقعد",
          "اطلب فواتير الصيانة — الكيلومتراج مكتوب فيها",
          "قراءة العدّاد من الحاسوب (OBD) كتبيّن أحياناً القيمة الحقيقية",
          "الفحص التقني السابق فيه الكيلومتراج المسجّل",
        ],
      },
      {
        heading: "الحوادث المخفية",
        body: ["الصدمة الكبيرة كتنقص من قيمة السيارة بـ20 حتى 40٪، ولهذا كيتخبّاو:"],
        list: [
          "قياس سماكة الصباغة بجهاز رخيص (كيتباع بأقل من 500 درهم)",
          "شوف نقاط اللحام الأصلية فمحيط المحرك والصندوق — إلا كانو مختلفين، كاين إصلاح",
          "الملصقات الأصلية على القطع (الأبواب، الكابو) واش موجودة",
          "الأجزاء الجديدة وسط سيارة قديمة",
        ],
      },
      {
        heading: "المركبات المستوردة",
        body: [
          "بعض المركبات كتجي من الخارج بعد حادث كبير وكتصلح فالمغرب. اطلب الوثيقة الجمركية وتحقق من تاريخ أول تسجيل فالمغرب مقابل سنة الصنع.",
          "فارق كبير بين سنة الصنع وأول تسجيل مغربي = مركبة مستوردة مستعملة، وهادي خاصك تعرفها قبل الشراء ماشي من بعد.",
        ],
      },
    ],
  },
  {
    slug: "wata2iq-bay3",
    icon: "FileText",
    kind: "general",
    title: "الوثائق المطلوبة لبيع وشراء مركبة فالمغرب",
    excerpt: "لائحة كاملة بالوثائق وخطوات تحويل الملكية، للبائع وللمشتري.",
    readMinutes: 4,
    updated: "2026-08-02",
    sections: [
      {
        heading: "الوثائق ديال البائع",
        body: [],
        list: [
          "البطاقة الرمادية الأصلية فسميتو",
          "البطاقة الوطنية + نسخة",
          "شهادة عدم الرهن",
          "الفحص التقني ساري المفعول",
          "وصولات الفينيات مدفوعة",
          "دفتر الصيانة والفواتير إن وُجدت",
        ],
      },
      {
        heading: "الوثائق ديال المشتري",
        body: [],
        list: ["البطاقة الوطنية + نسخة", "إثبات السكنى", "عقد البيع موقّع"],
      },
      {
        heading: "عقد البيع",
        body: ["خاصو يتضمن على الأقل:"],
        list: [
          "أسماء ورقم البطاقة الوطنية للطرفين",
          "معطيات المركبة كاملة: الماركة، الموديل، السنة، رقم الهيكل، رقم التسجيل",
          "الثمن بالحروف والأرقام",
          "التاريخ والتوقيع بنسختين",
        ],
      },
      {
        heading: "تحويل الملكية",
        body: [
          "المشتري كيدير طلب تغيير الملكية فمركز التسجيل. الأجل القانوني قصير، وإلا فات، البائع كيبقى مسؤولاً عن المخالفات والمشتري ممكن يأدي غرامة.",
          "احتفظ بنسخة من كل الوثائق حتى تخرج البطاقة الرمادية الجديدة بسميتك.",
        ],
      },
    ],
  },
  {
    slug: "afdal-tomobilat-iqtisadiya",
    icon: "OilCan",
    kind: "car",
    title: "أرخص السيارات فالاستعمال بالمغرب",
    excerpt: "ماشي الأرخص فالشراء هي الأرخص فالاستعمال. مقارنة على أساس التكلفة السنوية الحقيقية.",
    readMinutes: 5,
    updated: "2026-07-30",
    sections: [
      {
        heading: "الفرق بين ثمن الشراء وتكلفة الاستعمال",
        body: [
          "سيارة ألمانية قديمة بـ90 ألف درهم ممكن تكلّفك فالسنة أكثر من سيارة يابانية بـ140 ألف. السبب: الفينيات، قطع الغيار، والصيانة.",
          "الفينيات فالمغرب كتقفز بشكل كبير مع القوة الجبائية: سيارة ديزل 11 حصان كتأدي 6000 درهم فالسنة، وسيارة 7 أحصنة كتأدي 700 درهم فقط.",
        ],
      },
      {
        heading: "شنو خاصك تحسب",
        body: [],
        list: [
          "الفينيات: حسب القوة الجبائية ونوع الوقود",
          "التأمين: كيزيد مع القوة وقيمة المركبة",
          "المحروقات: الاستهلاك × الكيلومترات × ثمن اللتر",
          "الصيانة: العلامات الراقية 2× حتى 3× من العامة",
          "الإطارات: المقاسات الكبيرة غالية بزاف",
          "خسارة القيمة: غالباً أكبر مصروف وماكيحسبوهش الناس",
        ],
      },
      {
        heading: "قاعدة عملية",
        body: [
          "قبل ما تشري، حسب التكلفة على 3 سنوات وقسمها على عدد الكيلومترات المتوقعة. النتيجة بالدرهم للكيلومتر هي المقياس الحقيقي للمقارنة بين مركبتين.",
        ],
      },
    ],
  },
  {
    slug: "awal-moto",
    icon: "Moto",
    kind: "moto",
    title: "كيفاش تختار أول دراجة نارية ديالك",
    excerpt: "سعة المحرك، الوزن، الاستعمال، والميزانية — دليل عملي للمبتدئين.",
    readMinutes: 6,
    updated: "2026-06-15",
    sections: [
      {
        heading: "شحال ديال سعة المحرك؟",
        body: [
          "أكبر غلطة ديال المبتدئ: يبدا بدراجة قوية بزاف. الدراجة ماشي بحال السيارة — القوة الزائدة خطيرة ملي ماعندكش التجربة.",
          "للمدينة: 125 حتى 150 سم³ كافيين. للطرق الطويلة: 300 حتى 500 سم³. فوق 600 سم³ خاصك تجربة سنة على الأقل.",
        ],
      },
      {
        heading: "الوزن والارتفاع أهم من القوة",
        body: [
          "دراجة ثقيلة ولا عالية بزاف على قدّك غادي تخوّفك وتخليك ماتركبش. جرّب توقف بجوج رجليك فالأرض قبل ما تشري.",
        ],
      },
      {
        heading: "شنو النوع اللي يناسبك",
        body: [],
        list: [
          "سكوتر: للمدينة، أوتوماتيك، ساهل، فيه بلاصة للتخزين",
          "Naked / رودستر: متعدد الاستعمال، وضعية جلوس مريحة",
          "رياضية: سريعة ولكن وضعية متعبة فالمدينة",
          "طرق وعرة (Trail): عالية، مريحة فالطرق الخايبة",
          "كوستوم: مريحة فالخط المستقيم، ثقيلة فالمدينة",
        ],
      },
      {
        heading: "الميزانية الكاملة",
        body: [
          "زيد على ثمن الدراجة: الكاسك (على الأقل 800 درهم لواحد محترم)، القفازات، الجاكيطة، التأمين، والفينيات.",
          "ماتوفّرش فالكاسك — هو الحاجة الوحيدة اللي كتحمي راسك.",
        ],
      },
    ],
  },
  {
    slug: "125-wla-300",
    icon: "Piston",
    kind: "moto",
    title: "الفرق بين 125 و300 سم³: أيّ وحدة تناسبك؟",
    excerpt: "مقارنة عملية فالسرعة، الاستهلاك، التكلفة، والرخصة.",
    readMinutes: 4,
    updated: "2026-05-05",
    sections: [
      {
        heading: "الاستعمال",
        body: [
          "125 سم³: مثالية للمدينة والمسافات القصيرة. خفيفة، رخيصة فالصيانة، والاستهلاك تحت 2.5 لتر/100كم.",
          "300 سم³: كتقدر تدخل الطريق السيار براحة وتدير مسافات طويلة. أثقل شوية وأغلى فالصيانة والتأمين.",
        ],
      },
      {
        heading: "التكلفة",
        body: [
          "الفرق فثمن الشراء ممكن يكون الضعف، ولكن الفرق فالاستعمال أصغر مما كيتصور الناس: الاستهلاك قريب، والفرق الأساسي فالتأمين والإطارات.",
        ],
      },
      {
        heading: "الخلاصة",
        body: [
          "إلا كان استعمالك فالمدينة 90٪ من الوقت، 125 كافية وغادي توفّر عليك بزاف. إلا كنتي كتخرج من المدينة بانتظام، 300 غادي تكون أريح وأأمن.",
        ],
      },
    ],
  },
  {
    slug: "chira-moto-mostaamla",
    icon: "BrakeRotor",
    kind: "moto",
    title: "فحص دراجة نارية مستعملة قبل الشراء",
    excerpt: "النقط الخاصة بالدراجات اللي كتختلف على السيارات.",
    readMinutes: 5,
    updated: "2026-07-08",
    sections: [
      {
        heading: "الهيكل والشوكة",
        body: [],
        list: [
          "الشوكة الأمامية: تسريب زيت ولا خدوش على القضبان = إصلاح غالي",
          "الإطار (الشاسي): أي لحام ولا التواء = ماتشريش",
          "المقود واش نيشان مع العجلة الأمامية",
          "المساند الجانبية والدواسات: خدوش عميقة = الدراجة طاحت",
        ],
      },
      {
        heading: "المحرك والناقل",
        body: [],
        list: [
          "شعّل المحرك بارد وسمع: أي صوت معدني غير عادي",
          "السلسلة والتروس: التآكل ساهل تشوفو",
          "تسريب الزيت من الكارتير",
          "الدخان من العادم",
        ],
      },
      {
        heading: "العجلات والفرامل",
        body: [],
        list: [
          "تاريخ الإطارات (DOT) — المطاط كيقسح مع الوقت حتى بلا استعمال",
          "سماكة الأقراص والفحمات",
          "لعب فمحاور العجلات",
        ],
      },
      {
        heading: "الوثائق",
        body: [
          "نفس قواعد السيارة: البطاقة الرمادية فسمية البائع، شهادة عدم الرهن، ورقم الهيكل مطابق.",
          "الدراجات المسروقة كثيرة — تحقق من رقم الهيكل مزيان وماتشريش دراجة بلا وثائق مهما كان الثمن.",
        ],
      },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);

/* ============================================================
   النسخة الفرنسية

   بدل ما نبنيو بنية جديدة (title:{ar,fr}) ونلمسو كل مكان كيقرا
   GUIDES، زدنا جدول ترجمة مفصول بالـslug — الأصل العربي بقى هو
   هو، وguidesFor()/guideBySlugFor() كيدمجو الفرنسية فوقو ملي
   تكون اللغة fr.
   ============================================================ */
import type { Locale } from "@/lib/i18n/config";

type GuideFr = Pick<Guide, "title" | "excerpt"> & {
  sections: { heading: string; body: string[]; list?: string[] }[];
};

const GUIDES_FR: Record<string, GuideFr> = {
  "chira-tomobil-mostaamla": {
    title: "Comment acheter une voiture d'occasion au Maroc sans se tromper",
    excerpt: "De la définition du budget au transfert de propriété — chaque étape en détail, avec les erreurs que commettent la plupart des acheteurs.",
    sections: [
      {
        heading: "1. Fixez le budget réel, pas seulement le prix d'achat",
        body: [
          "La plupart des acheteurs ne calculent que le prix de la voiture et oublient le reste. Avant de commencer à chercher, calculez le budget complet : prix d'achat + assurance de la première année + vignette + transfert de propriété + premier entretien (huile, filtres, pneus).",
          "Règle pratique : ajoutez 12 % du prix de la voiture pour les frais de la première année. Une voiture à 120 000 DH nécessite environ 14 000 DH supplémentaires.",
        ],
      },
      {
        heading: "2. Choisissez le modèle avant de choisir l'annonce",
        body: [
          "Erreur courante : l'acheteur voit une annonce pas chère et va la voir sans savoir si ce modèle est connu pour avoir des problèmes. Avant tout, ciblez 2 ou 3 modèles et renseignez-vous sur eux.",
          "Vérifiez : les pièces détachées sont-elles disponibles et abordables au Maroc ? Les mécaniciens le connaissent-ils ? Quelle est la consommation ? Quelle est la valeur de revente ?",
        ],
      },
      {
        heading: "3. Comparez le prix au marché avant d'appeler",
        body: [
          "Ne négociez pas au feeling. Déterminez le prix de référence du modèle avec une année et un kilométrage proches, puis regardez l'écart.",
          "Si le prix est inférieur de 30 % ou plus au marché, c'est un signal d'alarme, pas une bonne affaire : soit le véhicule a un problème sérieux, soit il est saisi ou gagé, soit l'annonce est fausse.",
        ],
      },
      {
        heading: "4. Que vérifier lors de la visite",
        body: ["Rencontrez-vous en journée dans un lieu public. Le moteur doit être froid à votre arrivée — s'il est chaud, le vendeur l'a démarré avant pour cacher un problème de démarrage."],
        list: [
          "Épaisseur de la peinture : une grande différence entre panneaux = repeinte = choc antérieur",
          "Jeux de carrosserie (portes, capot) : ils doivent être réguliers",
          "Plancher de coffre sous la moquette : rouille ou traces de soudure",
          "Le numéro de châssis sur le véhicule = celui de la carte grise",
          "Pneus : date de fabrication (DOT) et usure régulière",
          "Fumée d'échappement : bleue = huile, blanche épaisse = eau dans le moteur",
        ],
      },
      {
        heading: "5. L'essai routier",
        body: [
          "Ne vous contentez pas d'un tour de 5 minutes dans le quartier. Roulez au moins 15 minutes : en ville et sur autoroute.",
          "Concentrez-vous sur : les freins mordent-ils droit, la direction vibre-t-elle, les vitesses passent-elles en douceur, et la climatisation refroidit-elle bien.",
        ],
      },
      {
        heading: "6. Les documents — c'est là que se cachent les gros problèmes",
        body: ["Ne payez pas un dirham avant d'avoir vu les documents de vos propres yeux :"],
        list: [
          "Carte grise originale au nom du vendeur présent avec vous",
          "Carte nationale du vendeur correspondant au nom",
          "Certificat de non-gage (pour s'assurer qu'il n'y a ni prêt ni saisie)",
          "Visite technique valide",
          "Vignette payée",
        ],
      },
      {
        heading: "7. La négociation et le paiement",
        body: [
          "Négociez avec des chiffres, pas des émotions : « les pneus sont à changer, ça fait 3000 DH » est bien plus fort que « baissez un peu ».",
          "Le paiement se fait par virement bancaire vérifié ou en présence de témoins, avec un contrat de vente écrit en deux exemplaires mentionnant le prix, la date, le numéro de châssis et des copies des cartes.",
        ],
      },
      {
        heading: "8. Après l'achat",
        body: [
          "Faites le transfert de propriété au plus vite — sinon le vendeur reste enregistré comme propriétaire et c'est vous qui paierez les infractions.",
          "Changez l'huile et les filtres immédiatement même si le vendeur dit les avoir changés, et vérifiez si la courroie de distribution a dépassé sa durée.",
        ],
      },
    ],
  },
  "fahs-qabl-chira": {
    title: "Checklist avant achat : 20 points que vous pouvez vérifier vous-même",
    excerpt: "Pas besoin d'être mécanicien. N'importe qui peut vérifier ces points, qui révèlent la plupart des problèmes.",
    sections: [
      {
        heading: "Carrosserie et peinture",
        body: ["Faites le tour du véhicule en lumière naturelle et regardez sous un angle :"],
        list: [
          "Différence de teinte entre les panneaux",
          "Jeux irréguliers entre les portes et le capot",
          "Têtes de vis du capot et des portes déjà desserrées",
          "Rouille sous les portes et sur le seuil de porte",
          "Vitres : la marque et la date doivent être identiques sur toutes les vitres",
        ],
      },
      {
        heading: "Le moteur",
        body: ["Ouvrez le capot, moteur froid :"],
        list: [
          "Niveau d'huile et sa couleur (noir épais = entretien négligé)",
          "Couleur du liquide de refroidissement et présence d'huile dedans",
          "Fuites sous le moteur et autour du joint de culasse",
          "État des courroies et durites",
          "Batterie : sa date et l'état des bornes",
        ],
      },
      {
        heading: "L'intérieur",
        body: ["L'intérieur révèle l'usage réel, pas le compteur :"],
        list: [
          "Usure du volant et de la pédale de frein — s'ils sont très usés et le compteur affiche peu de kilomètres, il y a un problème",
          "Le siège du conducteur est-il affaissé",
          "Tous les voyants s'allument au contact puis s'éteignent",
          "La climatisation refroidit en moins de deux minutes",
          "Tous les boutons et les vitres électriques fonctionnent",
        ],
      },
      {
        heading: "Roues et freins",
        body: [],
        list: [
          "Usure des pneus régulière (usure d'un seul côté = problème de géométrie ou de suspension)",
          "Les quatre pneus de même marque et dimension",
          "Épaisseur des disques de frein et présence de rainures profondes",
          "Roue de secours et outillage présents",
        ],
      },
      {
        heading: "Le point le plus important",
        body: [
          "Après avoir tout vérifié et si le véhicule vous plaît, faites-le passer par un mécanicien indépendant — pas celui du vendeur. 400 DH d'inspection peuvent vous épargner 20 000 DH de réparations.",
        ],
      },
    ],
  },
  "tomobil-maghchocha": {
    title: "Comment repérer une voiture trafiquée et un compteur trafiqué",
    excerpt: "La fraude sur le compteur et sur l'historique des accidents coûte des dizaines de milliers à l'acheteur. Voici comment la détecter.",
    sections: [
      {
        heading: "Le compteur trafiqué",
        body: [
          "Trafiquer le compteur est devenu facile avec les appareils numériques. La seule méthode fiable est de comparer le chiffre affiché à l'état réel du véhicule.",
        ],
        list: [
          "La moyenne au Maroc est de 12 000 à 20 000 km par an. Une voiture de 2015 avec seulement 60 000 km = gros point d'interrogation",
          "Comparez avec l'usure du volant, des pédales et du siège",
          "Demandez les factures d'entretien — le kilométrage y est inscrit",
          "La lecture du compteur via ordinateur (OBD) révèle parfois la vraie valeur",
          "La visite technique précédente contient le kilométrage enregistré",
        ],
      },
      {
        heading: "Les accidents cachés",
        body: ["Un choc important fait baisser la valeur de la voiture de 20 à 40 %, c'est pourquoi on les cache :"],
        list: [
          "Mesurer l'épaisseur de peinture avec un appareil bon marché (moins de 500 DH)",
          "Vérifier les points de soudure d'origine autour du moteur et du coffre — s'ils diffèrent, il y a eu réparation",
          "Vérifier si les autocollants d'origine sur les pièces (portes, capot) sont présents",
          "Des pièces neuves au milieu d'une voiture ancienne",
        ],
      },
      {
        heading: "Les véhicules importés",
        body: [
          "Certains véhicules arrivent de l'étranger après un accident important puis sont réparés au Maroc. Demandez le document douanier et comparez la date de première immatriculation au Maroc avec l'année de fabrication.",
          "Un grand écart entre l'année de fabrication et la première immatriculation marocaine = véhicule importé d'occasion, et il faut le savoir avant l'achat, pas après.",
        ],
      },
    ],
  },
  "wata2iq-bay3": {
    title: "Documents requis pour vendre et acheter un véhicule au Maroc",
    excerpt: "Liste complète des documents et des étapes du transfert de propriété, pour le vendeur et l'acheteur.",
    sections: [
      {
        heading: "Documents du vendeur",
        body: [],
        list: [
          "Carte grise originale à son nom",
          "Carte nationale + copie",
          "Certificat de non-gage",
          "Visite technique valide",
          "Vignette payée",
          "Carnet d'entretien et factures si disponibles",
        ],
      },
      {
        heading: "Documents de l'acheteur",
        body: [],
        list: ["Carte nationale + copie", "Justificatif de domicile", "Contrat de vente signé"],
      },
      {
        heading: "Le contrat de vente",
        body: ["Il doit contenir au minimum :"],
        list: [
          "Noms et numéros de carte nationale des deux parties",
          "Données complètes du véhicule : marque, modèle, année, numéro de châssis, numéro d'immatriculation",
          "Le prix en lettres et en chiffres",
          "Date et signature en deux exemplaires",
        ],
      },
      {
        heading: "Le transfert de propriété",
        body: [
          "L'acheteur fait la demande de changement de propriété au centre d'immatriculation. Le délai légal est court, et s'il est dépassé, le vendeur reste responsable des infractions et l'acheteur peut payer une amende.",
          "Conservez une copie de tous les documents jusqu'à ce que la nouvelle carte grise sorte à votre nom.",
        ],
      },
    ],
  },
  "afdal-tomobilat-iqtisadiya": {
    title: "Les voitures les moins chères à l'usage au Maroc",
    excerpt: "La moins chère à l'achat n'est pas forcément la moins chère à l'usage. Comparaison basée sur le coût annuel réel.",
    sections: [
      {
        heading: "La différence entre prix d'achat et coût d'usage",
        body: [
          "Une vieille allemande à 90 000 DH peut vous coûter plus par an qu'une japonaise à 140 000 DH. La raison : la vignette, les pièces détachées, et l'entretien.",
          "La vignette au Maroc augmente fortement avec la puissance fiscale : une diesel de 11 CV paie 6000 DH par an, une de 7 CV seulement 700 DH.",
        ],
      },
      {
        heading: "Ce qu'il faut calculer",
        body: [],
        list: [
          "Vignette : selon la puissance fiscale et le type de carburant",
          "Assurance : augmente avec la puissance et la valeur du véhicule",
          "Carburant : consommation × kilomètres × prix du litre",
          "Entretien : les marques premium coûtent 2 à 3 fois plus que les généralistes",
          "Pneus : les grandes dimensions sont très chères",
          "Dépréciation : souvent la plus grosse dépense, et les gens ne la calculent pas",
        ],
      },
      {
        heading: "Règle pratique",
        body: [
          "Avant d'acheter, calculez le coût sur 3 ans et divisez-le par le nombre de kilomètres prévus. Le résultat en dirhams par kilomètre est la vraie mesure pour comparer deux véhicules.",
        ],
      },
    ],
  },
  "awal-moto": {
    title: "Comment choisir votre première moto",
    excerpt: "Cylindrée, poids, usage et budget — un guide pratique pour débutants.",
    sections: [
      {
        heading: "Quelle cylindrée ?",
        body: [
          "La plus grosse erreur du débutant : commencer avec une moto trop puissante. La moto n'est pas comme la voiture — la puissance excessive est dangereuse sans expérience.",
          "Pour la ville : 125 à 150 cm³ suffisent. Pour les longs trajets : 300 à 500 cm³. Au-delà de 600 cm³, il vous faut au moins un an d'expérience.",
        ],
      },
      {
        heading: "Le poids et la hauteur comptent plus que la puissance",
        body: [
          "Une moto trop lourde ou trop haute pour vous va vous faire peur et vous décourager de la prendre. Essayez de poser les deux pieds au sol avant d'acheter.",
        ],
      },
      {
        heading: "Quel type vous convient",
        body: [],
        list: [
          "Scooter : pour la ville, automatique, facile, avec du rangement",
          "Roadster / Naked : polyvalente, position de conduite confortable",
          "Sportive : rapide mais position fatigante en ville",
          "Trail : haute, confortable sur les mauvaises routes",
          "Custom : confortable en ligne droite, lourde en ville",
        ],
      },
      {
        heading: "Le budget complet",
        body: [
          "Ajoutez au prix de la moto : le casque (au moins 800 DH pour un correct), les gants, le blouson, l'assurance et la vignette.",
          "N'économisez pas sur le casque — c'est la seule chose qui protège votre tête.",
        ],
      },
    ],
  },
  "125-wla-300": {
    title: "La différence entre 125 et 300 cm³ : laquelle vous convient ?",
    excerpt: "Comparaison pratique de la vitesse, la consommation, le coût et le permis.",
    sections: [
      {
        heading: "L'usage",
        body: [
          "125 cm³ : idéale pour la ville et les courtes distances. Légère, peu coûteuse à l'entretien, consommation sous 2,5 L/100km.",
          "300 cm³ : vous permet de prendre l'autoroute confortablement et de faire de longs trajets. Un peu plus lourde et plus chère à l'entretien et à l'assurance.",
        ],
      },
      {
        heading: "Le coût",
        body: [
          "La différence de prix d'achat peut être du double, mais la différence à l'usage est plus petite qu'on ne l'imagine : la consommation est proche, et l'écart principal est sur l'assurance et les pneus.",
        ],
      },
      {
        heading: "En résumé",
        body: [
          "Si votre usage est en ville 90 % du temps, la 125 suffit et vous fera économiser beaucoup. Si vous sortez régulièrement de la ville, la 300 sera plus confortable et plus sûre.",
        ],
      },
    ],
  },
  "chira-moto-mostaamla": {
    title: "Inspecter une moto d'occasion avant l'achat",
    excerpt: "Les points spécifiques aux motos qui diffèrent des voitures.",
    sections: [
      {
        heading: "Le châssis et la fourche",
        body: [],
        list: [
          "Fourche avant : fuite d'huile ou rayures sur les tubes = réparation coûteuse",
          "Le cadre (châssis) : toute soudure ou déformation = n'achetez pas",
          "Le guidon est-il aligné avec la roue avant",
          "Béquilles et repose-pieds : rayures profondes = la moto est tombée",
        ],
      },
      {
        heading: "Moteur et transmission",
        body: [],
        list: [
          "Démarrez le moteur à froid et écoutez : tout bruit métallique inhabituel",
          "Chaîne et pignons : l'usure se voit facilement",
          "Fuite d'huile du carter",
          "Fumée à l'échappement",
        ],
      },
      {
        heading: "Roues et freins",
        body: [],
        list: [
          "Date des pneus (DOT) — le caoutchouc durcit avec le temps même sans usage",
          "Épaisseur des disques et plaquettes",
          "Jeu dans les moyeux de roue",
        ],
      },
      {
        heading: "Les documents",
        body: [
          "Mêmes règles que pour la voiture : carte grise au nom du vendeur, certificat de non-gage, et numéro de châssis correspondant.",
          "Les motos volées sont nombreuses — vérifiez bien le numéro de châssis et n'achetez jamais une moto sans documents, quel que soit le prix.",
        ],
      },
    ],
  },
};

export type { GuideFr };
export { GUIDES_FR };

/** الأدلة حسب اللغة — الفرنسية كتدمج فوق العربية بالـslug */
export function guidesFor(locale: Locale): Guide[] {
  if (locale !== "fr") return GUIDES;
  return GUIDES.map((g) => {
    const fr = GUIDES_FR[g.slug];
    if (!fr) return g;
    return {
      ...g,
      title: fr.title,
      excerpt: fr.excerpt,
      sections: g.sections.map((s, i) => ({
        heading: fr.sections[i]?.heading ?? s.heading,
        body: fr.sections[i]?.body ?? s.body,
        list: fr.sections[i]?.list ?? s.list,
      })),
    };
  });
}

export function guideBySlugFor(slug: string, locale: Locale): Guide | undefined {
  return guidesFor(locale).find((g) => g.slug === slug);
}
