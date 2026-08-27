import { getCurrentUser } from "@/lib/auth";
import { body, dbMissing, ok, unauthorized, writeFail } from "@/lib/api";
import { CITIES } from "@/lib/cities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** ملف المعرض ديال المستخدم الحالي */
export async function GET() {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { myDealer } = await import("@/lib/db/writes");
  return ok({ dealer: await myDealer(user.id) });
}

/** كيصاوب ولا كيحيّن ملف المعرض */
export async function POST(req: Request) {
  const missing = dbMissing();
  if (missing) return missing;

  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const b = await body<Record<string, unknown>>(req);
  const name = text(b?.name, 80);
  const city = text(b?.city, 40);

  if (name.length < 2) return writeFail(new Error("BAD_NAME"));
  if (!CITIES.some((c) => c.slug === city)) return writeFail(new Error("BAD_CITY"));

  const brands = Array.isArray(b?.brands)
    ? b.brands.filter((x): x is string => typeof x === "string").slice(0, 12).map((x) => x.slice(0, 40))
    : [];

  try {
    const { upsertDealer } = await import("@/lib/db/writes");
    const row = await upsertDealer(user.id, {
      name,
      slug: text(b?.slug, 60),
      tagline: text(b?.tagline, 120),
      about: text(b?.about, 2000),
      address: text(b?.address, 160),
      hours: text(b?.hours, 80),
      city,
      brands,
    });
    return ok({ slug: row.slug });
  } catch (e) {
    return writeFail(e);
  }
}
