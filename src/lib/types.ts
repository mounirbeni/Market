export type VehicleKind = "car" | "moto";

export type Fuel = "diesel" | "essence" | "hybride" | "electrique";
export type Gearbox = "manuelle" | "automatique";
export type Body =
  | "citadine"
  | "berline"
  | "suv"
  | "break"
  | "utilitaire"
  | "cabriolet"
  | "scooter"
  | "roadster"
  | "trail"
  | "sportive"
  | "custom";

export type Condition = "excellent" | "tres-bon" | "bon" | "moyen";

export type SellerType = "particulier" | "professionnel";

export interface Seller {
  id: string;
  name: string;
  type: SellerType;
  city: string;
  since: number;
  /** هوية موثقة عبر البطاقة الوطنية / السجل التجاري */
  idVerified: boolean;
  phoneVerified: boolean;
  /** رقم التواصل — كيبان غير ملي يضغط الزائر «أظهر الرقم» */
  phone?: string | null;
  rating: number;
  salesCount: number;
  responseMinutes: number;
}

export interface HistoryEvent {
  date: string;
  type: "mise-en-circulation" | "proprietaire" | "entretien" | "visite" | "accident" | "km";
  label: string;
  km?: number;
  detail?: string;
}

/** صورة ولا فيديو ديال إعلان — مخزّنين فـVercel Blob */
export interface MediaItem {
  kind: "photo" | "video";
  url: string;
  thumbUrl?: string;
  width?: number;
  height?: number;
}

export interface Vehicle {
  id: string;
  kind: VehicleKind;
  make: string;
  model: string;
  version: string;
  year: number;
  km: number;
  price: number;
  /** أصحاب سابقون */
  owners: number;
  fuel: Fuel;
  gearbox: Gearbox;
  body: Body;
  /** القوة الجبائية (CV) — أساس حساب الضريبة */
  fiscalPower: number;
  /** الاستهلاك الحقيقي ل/100كم */
  consumption: number;
  /** سعة المحرك بالسنتيمتر المكعب (للدراجات أساساً) */
  displacement?: number;
  doors?: number;
  color: string;
  city: string;
  condition: Condition;
  firstHand: boolean;
  /** وثائق مطابقة (كارط كريز) في اسم البائع */
  papersOk: boolean;
  /** تاريخ صلاحية الفحص التقني */
  technicalControl: string;
  /** فحص TRIQ المستقل تم */
  inspected: boolean;
  photos: number;
  hasVideo: boolean;
  /** الصور الحقيقية ملي يكونو مرفوعين — إلا كانت خاوية كنرسمو المركبة */
  media?: MediaItem[];
  /** أول صورة — كتجي مع نتائج البحث باش البطاقات مايطلبوش كل وحدة على حدة */
  cover?: string;
  serviceBook: boolean;
  vinChecked: boolean;
  description: string;
  equipment: string[];
  history: HistoryEvent[];
  sellerId: string;
  publishedAt: string;
  views: number;
  saves: number;
  /** تخفيضات سابقة على السعر (درهم) */
  priceDrops: number[];
  negotiable: boolean;
  exchangeAccepted: boolean;
  /** درجة الترويج المدفوعة — شوف lib/promo.ts */
  promo?: import("./promo").PromoTier;
  /** البائع مرفق مع المركبة ملي تجي من قاعدة البيانات */
  seller?: Seller;
  /**
   * الثمن المرجعي كما تحسب فالخادم ملي تنشر الإعلان.
   * المتصفح ماعندوش الإعلانات الأخرى باش يقارن، فكيقرا هادو.
   */
  fairPriceMad?: number;
  fairPriceDelta?: number;
  /** مؤشر الثقة المخزّن — كيتحسب فالخادم حتى هو */
  trustScoreStored?: number;
}
