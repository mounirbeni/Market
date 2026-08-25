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
}
