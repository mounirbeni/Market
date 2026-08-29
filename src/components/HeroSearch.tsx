"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "./Link";
import { SmartSearch } from "./SmartSearch";
import { formatNumber } from "@/lib/format";
import { useDict, useHref, useLocale } from "@/lib/i18n/client";
import { cityLabel, dhUnit } from "@/lib/i18n/labels";
import { Car, MapPin, Moto, Plus, Search, Sparkle } from "./icons";

type Kind = "car" | "moto";

interface BrandRow {
  make: string;
  count: number;
}
interface CityRow {
  slug: string;
  ar: string;
  n: number;
}

const PRICES = [60000, 100000, 150000, 250000, 400000, 600000];

/* ============================================================
   بحث البطل — العنصر الأساسي فالصفحة الرئيسية

   SmartSearch (النص الحر بالحروف اللاتينية) بقات كما هي، ماشي
   داخل تغيير — كتخدم مزيان وكيتعرف عليها المستخدم. هنا زدنا صفّ
   بحث مبوّب فوقها: نوع، ماركة، مدينة، ثمن — أزرار واضحة بدل
   الاعتماد غير على الكتابة، وزر «بيع مركبتك» جنبهم مباشرة.

   الماركات والمدن جايين من إعلانات حقيقية موجودة (getBrands
   وtopCities فpage.tsx) — بلا هادشي كنقترحو على المستخدم يبحث
   بماركة أو مدينة ماكاين فيها والو.
   ============================================================ */
export function HeroSearch({
  carBrands,
  motoBrands,
  cities,
}: {
  carBrands: BrandRow[];
  motoBrands: BrandRow[];
  cities: CityRow[];
}) {
  const router = useRouter();
  const t = useDict();
  const locale = useLocale();
  const href = useHref();
  const [kind, setKind] = useState<Kind>("car");
  const [make, setMake] = useState("");
  const [city, setCity] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const brands = useMemo(
    () => [...(kind === "car" ? carBrands : motoBrands)].sort((a, b) => a.make.localeCompare(b.make)),
    [kind, carBrands, motoBrands],
  );
  /* الترتيب كيتبدّل مع اللغة: الفرنسية كترتّب بأسماء فرنسية */
  const cityOptions = useMemo(
    () =>
      cities
        .map((c) => ({ slug: c.slug, name: cityLabel(c.slug, locale) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [cities, locale],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    sp.set("kind", kind);
    if (make) sp.set("make", make);
    if (city) sp.set("city", city);
    if (priceMax) sp.set("priceMax", priceMax);
    router.push(href(`/vehicles?${sp.toString()}`));
  }

  return (
    <div className="card-raised p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* نوع المركبة */}
        <div className="flex gap-1.5 rounded-xl p-1" style={{ background: "var(--surface-3)" }}>
          {([["car", t.hero.cars, Car], ["moto", t.hero.motos, Moto]] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => { setKind(k); setMake(""); }}
              aria-pressed={kind === k}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-bold transition"
              style={{
                background: kind === k ? "var(--brand)" : "transparent",
                color: kind === k ? "var(--brand-ink)" : "var(--text-muted)",
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* بيع مركبتك — واضح وسريع، جنب البحث ماشي مدفون تحت */}
        <Link href="/sell" className="btn btn-primary btn-sm">
          <Plus size={15} /> {t.hero.sellNow}
        </Link>
      </div>

      {/* البحث السريع بالاسم — بحال ما كانت */}
      <div className="mt-4">
        <SmartSearch big />
      </div>

      {/* دقّق البحث: ماركة، مدينة، ثمن */}
      <form onSubmit={submit} className="mt-4 border-t pt-4" style={{ borderColor: "var(--line-soft)" }}>
        <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: "var(--text-dim)" }}>
          <Sparkle size={12} /> {t.hero.refine}
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            className="field"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            aria-label={t.hero.brand}
          >
            <option value="">{t.hero.anyBrand}</option>
            {brands.map((b) => (
              <option key={b.make} value={b.make}>
                {b.make} ({formatNumber(b.count)})
              </option>
            ))}
          </select>

          <select
            className="field"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label={t.hero.city}
          >
            <option value="">{t.hero.allCities}</option>
            {cityOptions.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            className="field"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            aria-label={t.hero.maxPrice}
          >
            <option value="">{t.hero.anyPrice}</option>
            {PRICES.map((p) => (
              <option key={p} value={p}>{t.hero.upTo} {formatNumber(p)} {dhUnit(locale)}</option>
            ))}
          </select>

          <button type="submit" className="btn btn-primary">
            <Search size={16} /> {t.hero.search}
          </button>
        </div>
      </form>

      {/* المدن اللي ماعندهاش عدّاد ماكيبانوش هنا — كنقترحو غير حاجة موجودة */}
      {cityOptions.length === 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
          <MapPin size={12} /> {t.hero.cityHint}
        </p>
      )}
    </div>
  );
}
