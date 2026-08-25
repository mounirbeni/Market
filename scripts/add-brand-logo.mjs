#!/usr/bin/env node
/**
 * زيد شعار ماركة للموقع.
 *
 *   node scripts/add-brand-logo.mjs <slug> <path-to.svg> [--color "#3fa535"]
 *
 * مثال:
 *   node scripts/add-brand-logo.mjs kawasaki ~/Downloads/kawasaki.svg
 *
 * كيدير:
 *   1. كيقرا ملف SVG وكينقّيه (كيحيّد <script> و onclick و<image> الخارجية)
 *   2. كيتأكد من وجود viewBox — إلا كان ناقص كيبنيه من width/height
 *   3. كيكتبه فـ public/brands/<slug>.svg
 *   4. كيسجّل الـslug فـ OFFICIAL_LOGOS داخل src/lib/brands.ts
 *
 * باش تحيّد شعار:
 *   node scripts/add-brand-logo.mjs <slug> --remove
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BRANDS_TS = resolve(ROOT, "src/lib/brands.ts");
const OUT_DIR = resolve(ROOT, "public/brands");

const [, , slug, arg2, ...rest] = process.argv;

function die(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
  process.exit(1);
}

if (!slug) {
  die("الاستعمال: node scripts/add-brand-logo.mjs <slug> <file.svg> [--color \"#hex\"]");
}

/** تحديث مجموعة OFFICIAL_LOGOS فـ brands.ts */
function updateRegistry(mutate) {
  const src = readFileSync(BRANDS_TS, "utf8");
  const m = src.match(/export const OFFICIAL_LOGOS = new Set<string>\(\[([\s\S]*?)\]\);/);
  if (!m) die("ماكلقيتش OFFICIAL_LOGOS فـ src/lib/brands.ts");

  const current = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  const next = mutate(new Set(current));
  const sorted = [...next].sort();

  // سطور ديال 76 حرف
  const lines = [];
  let line = "  ";
  for (const s of sorted) {
    const piece = `"${s}", `;
    if (line.length + piece.length > 76) { lines.push(line.trimEnd()); line = "  "; }
    line += piece;
  }
  if (line.trim()) lines.push(line.trimEnd());

  const block = `export const OFFICIAL_LOGOS = new Set<string>([\n${lines.join("\n")}\n]);`;
  writeFileSync(BRANDS_TS, src.replace(m[0], block));
  return sorted.length;
}

/** التأكد أن الـslug معروف */
const brandsSrc = readFileSync(BRANDS_TS, "utf8");
if (!new RegExp(`slug: "${slug}"`).test(brandsSrc)) {
  const known = [...brandsSrc.matchAll(/slug: "([^"]+)"/g)].map((x) => x[1]);
  die(`الـslug «${slug}» ماشي معروف.\n  الـslugs المتاحة: ${known.join(", ")}`);
}

/* ---------- الحذف ---------- */
if (arg2 === "--remove") {
  const file = resolve(OUT_DIR, `${slug}.svg`);
  if (existsSync(file)) unlinkSync(file);
  const n = updateRegistry((s) => { s.delete(slug); return s; });
  console.log(`\x1b[32m✓\x1b[0m تحيّد «${slug}». المجموع دابا: ${n} شعار.`);
  console.log("  الشارة النصية غادي ترجع تلقائياً.");
  process.exit(0);
}

/* ---------- الإضافة ---------- */
if (!arg2) die("عطيني مسار ملف SVG.");
const inFile = resolve(process.cwd(), arg2);
if (!existsSync(inFile)) die(`الملف ماكاينش: ${inFile}`);
if (!inFile.toLowerCase().endsWith(".svg")) {
  die("خاصو ملف .svg. إلا عندك PNG، حوّلو أولاً (مثلاً بـ https://www.autotracer.org).");
}

const colorIdx = rest.indexOf("--color");
const forceColor = colorIdx >= 0 ? rest[colorIdx + 1] : null;

let svg = readFileSync(inFile, "utf8");

// 1. تنقية: حتى سكريبت ولا معالج أحداث ولا صورة خارجية
const before = svg.length;
svg = svg
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/\son\w+="[^"]*"/gi, "")
  .replace(/<image\b[^>]*>/gi, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<\?xml[^>]*\?>/gi, "")
  .replace(/<!DOCTYPE[^>]*>/gi, "")
  .trim();
if (svg.length !== before) console.log("  · تنقّى الملف من محتوى غير آمن");

// 2. viewBox
if (!/viewBox=/i.test(svg)) {
  const w = svg.match(/\swidth="([\d.]+)/i)?.[1];
  const h = svg.match(/\sheight="([\d.]+)/i)?.[1];
  if (!w || !h) die("الملف بلا viewBox وبلا width/height — ماقدرتش نحسب الأبعاد.");
  svg = svg.replace(/<svg/i, `<svg viewBox="0 0 ${w} ${h}"`);
  console.log(`  · تزاد viewBox="0 0 ${w} ${h}"`);
}

// 3. width/height ثابتين كيمنعو التحجيم — كنحيّدهم
svg = svg.replace(/\s(width|height)="[^"]*"/gi, "");

// 4. لون موحّد إلا تطلب
if (forceColor) {
  svg = svg.replace(/\s(fill|stroke)="(?!none)[^"]*"/gi, "");
  svg = svg.replace(/<svg/i, `<svg fill="${forceColor}"`);
  console.log(`  · اللون توحّد فـ ${forceColor}`);
}

// 5. xmlns + title للوصولية
if (!/xmlns=/i.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
if (!/<title>/i.test(svg)) svg = svg.replace(/(<svg[^>]*>)/i, `$1<title>${slug}</title>`);

const outFile = resolve(OUT_DIR, `${slug}.svg`);
writeFileSync(outFile, svg);
const n = updateRegistry((s) => { s.add(slug); return s; });

console.log(`\x1b[32m✓\x1b[0m تزاد شعار «${slug}» (${(svg.length / 1024).toFixed(1)} KB). المجموع: ${n} شعار.`);
console.log(`  الملف: public/brands/${slug}.svg`);
console.log("  دير `npm run build` وغادي يبان فكل الموقع.");
