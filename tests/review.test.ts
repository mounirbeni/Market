import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";
import type { Pool } from "pg";
import { fairPrice, fairPriceOf, trustScore } from "../src/lib/market";
import { controlIsValid, technicalControlDate, todayInMorocco } from "../src/lib/dates";
import { MessageFeed } from "../src/lib/messageFeed";
import { fmtDate } from "../src/lib/i18n/labels";
import { consumeOtp } from "../src/lib/db/otp";
import { hashPassword, startAdminLogin } from "../src/lib/admin";
import { adminRequestSource, takeRateLimit } from "../src/lib/db/rateLimit";
import { searchListings, rowToVehicle, getListingBySlug, getSellerOf as sellerOf, facetCounts } from "../src/lib/db/listings";
import { setListingStatus } from "../src/lib/db/writes";
import { POST as create } from "../src/app/api/listings/create/route";
import { PATCH as edit } from "../src/app/api/me/listings/[ref]/route";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const require = createRequire(import.meta.url);

test("code review regressions against an isolated PostgreSQL engine", async (t) => {
  const db = new PGlite({ extensions: { pg_trgm, unaccent } });
  const env = { ...process.env };
  const cookies = new Map<string, string>();
  const headers = require("next/headers");
  const cookieMock = mock.method(headers, "cookies", async () => ({
    get: (name: string) => cookies.has(name) ? { value: cookies.get(name) } : undefined,
    set: (name: string, value: string) => cookies.set(name, value),
    delete: (name: string) => cookies.delete(name),
  }));
  // Model a one-connection pg pool; a transaction owns its connection until release.
  // Concurrent non-transactional queries still queue before their follow-up writes,
  // reproducing the old read/check/write OTP race if the transaction is removed.
  let tail = Promise.resolve();
  const query = async (sql: string, args: unknown[] = []) => db.query(sql, args);
  globalThis.__triqPool = {
    query,
    connect: async () => {
      const previous = tail;
      let release!: () => void;
      tail = new Promise<void>((resolve) => { release = resolve; });
      await previous;
      return { query, release };
    },
  } as unknown as Pool;
  process.env.DATABASE_URL = "postgresql://isolated-review-test";
  Object.assign(process.env, { NODE_ENV: "development", ADMIN_EMAILS: "admin@example.test" });
  process.env.ADMIN_PASSWORD_HASH = hashPassword("review-test-password");
  delete process.env.EMAIL_PROVIDER;

  try {
    await t.test("all migrations apply; legacy declarations are retained without verification", async () => {
      // 0013 carries a data migration, so it has to run against the schema and
      // rows that preceded it — later migrations then apply on top, in order.
      const files = readdirSync("db/migrations").filter((f) => f.endsWith(".sql")).sort();
      const rollout = files.findIndex((f) => f.startsWith("0013"));
      for (const file of files.slice(0, rollout))
        await db.exec(readFileSync(`db/migrations/${file}`, "utf8"));
      await db.exec(`INSERT INTO users (id, email, name, city, onboarded, member_since)
        VALUES ('00000000-0000-4000-8000-000000000001', 'seller@example.test', 'Seller', 'casablanca', true, CURRENT_DATE);
        INSERT INTO listings (ref, slug, seller_id, kind, make, model, year, km, price_mad, fuel, gearbox, body,
          fiscal_power, city, condition, inspected, technical_control)
        VALUES ('legacy', 'legacy', '00000000-0000-4000-8000-000000000001', 'car', 'Renault', 'Clio', 2018, 120000,
          100000, 'diesel', 'manuelle', 'citadine', 6, 'casablanca', 'bon', true, '2027-01-01');`);
      await db.exec(readFileSync("db/migrations/0013_review_security_trust.sql", "utf8"));
      for (const file of files.slice(rollout + 1))
        await db.exec(readFileSync(`db/migrations/${file}`, "utf8"));
      const { rows: [row] } = await db.query<{ inspected: boolean; seller_inspection_claimed: boolean; technical_control: string | null; legacy_technical_control: string }>(
        "SELECT inspected, seller_inspection_claimed, technical_control, legacy_technical_control::text FROM listings WHERE ref='legacy'",
      );
      assert.equal(row.inspected, false);
      assert.equal(row.seller_inspection_claimed, true);
      assert.equal(row.technical_control, null);
      assert.equal(row.legacy_technical_control, "2027-01-01");
    });

    const userId = "00000000-0000-4000-8000-000000000001";
    cookies.set("triq_session", "review-session");
    await db.query("INSERT INTO sessions(user_id, token_hash, expires_at) VALUES ($1,$2,now()+interval '1 hour')", [userId, hash("review-session")]);
    const payload = {
      kind: "car", make: "Renault", model: "Clio", year: 2018, km: 120000,
      price: 100000, fuel: "diesel", gearbox: "manuelle", body: "citadine", fiscalPower: 6,
      city: "casablanca", condition: "bon", sellerDeclared: true, inspected: true,
      technicalControl: "2028-06-30", serviceBook: true,
      media: [{ url: `/api/media/listings/${userId}/test.jpg`, kind: "photo" }],
    };
    const request = (data: unknown) => new Request("http://localhost/api/test", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data),
    });
    let ref = "", slug = "";

    await t.test("seller endpoints cannot award an independent inspection badge", async () => {
      const response = await create(request(payload));
      assert.equal(response.status, 200, await response.clone().text());
      const result = await response.json();
      ({ ref, slug } = result.data);
      let row = (await getListingBySlug(slug))!.listing;
      assert.equal(row.inspected, false);
      assert.equal(row.technical_control, payload.technicalControl);
      const updated = await edit(request({ edit: payload }), { params: Promise.resolve({ ref }) });
      assert.equal(updated.status, 200, await updated.clone().text());
      row = (await getListingBySlug(slug))!.listing;
      assert.equal(row.inspected, false);
      assert.equal(trustScore(rowToVehicle(row)).strengths.includes("inspected120"), false);
      // An existing server-approved flag cannot be changed by a seller either.
      await db.query("UPDATE listings SET inspected=true WHERE ref=$1", [ref]);
      await edit(request({ edit: { ...payload, inspected: false } }), { params: Promise.resolve({ ref }) });
      assert.equal((await getListingBySlug(slug))!.listing.inspected, true);
      await db.query("UPDATE listings SET inspected=false WHERE ref=$1", [ref]);
    });

    await t.test("rejected/pending listings cannot be reactivated, even via draft", async () => {
      for (const blocked of ["rejected", "pending"]) {
        await db.query("UPDATE listings SET status=$2::listing_status WHERE ref=$1", [ref, blocked]);
        for (const target of ["active", "draft", "sold"])
          await assert.rejects(setListingStatus(userId, ref, target), /NOT_FOUND/);
      }
      await db.query("UPDATE listings SET status='active' WHERE ref=$1", [ref]);
      for (const status of ["draft", "active", "sold", "active"])
        await setListingStatus(userId, ref, status);
      const { rows: [row] } = await db.query<{ sold_at: unknown }>("SELECT sold_at FROM listings WHERE ref=$1", [ref]);
      assert.equal(row.sold_at, null);
      await assert.rejects(setListingStatus("00000000-0000-4000-8000-000000000002", ref, "draft"), /NOT_FOUND/);
    });

    await t.test("real date validation and expiry, including a Morocco midnight", async () => {
      assert.equal(technicalControlDate(""), null);
      assert.equal(fmtDate("", "ar"), "غير محدد");
      assert.equal(fmtDate("", "fr"), "Non renseigné");
      assert.throws(() => technicalControlDate("2027-02-29"), /BAD_CONTROL_DATE/);
      assert.throws(() => technicalControlDate("2026-13-01"), /BAD_CONTROL_DATE/);
      assert.equal(technicalControlDate("2028-02-29"), "2028-02-29");
      assert.equal(controlIsValid("2026-09-08", "2026-09-08"), true);
      assert.equal(controlIsValid("2026-09-07", "2026-09-08"), false);
      assert.equal(todayInMorocco(new Date("2026-09-08T23:30:00Z")), "2026-09-09");
      const response = await create(request({ ...payload, technicalControl: "2027-02-29" }));
      assert.equal(response.status, 400);
      const changed = await edit(request({ edit: { ...payload, technicalControl: "2027-02-29" } }), { params: Promise.resolve({ ref }) });
      assert.equal(changed.status, 400);
    });

    await t.test("price evidence survives database and API round trips", async () => {
      const original = rowToVehicle((await getListingBySlug(slug))!.listing);
      for (const count of [0, 1, 2, 4]) {
        const computed = fairPrice(original, Array.from({ length: count }, (_, i) => ({ ...original, id: `comp-${i}` })));
        const { low, high, confidence, sampleSize } = computed.estimate;
        await db.query("UPDATE listings SET fair_price_mad=$2, fair_price_meta=$3::jsonb WHERE ref=$1", [ref, computed.estimate.mid, JSON.stringify({ low, high, confidence, sampleSize })]);
        const loaded = fairPriceOf(rowToVehicle((await getListingBySlug(slug))!.listing));
        assert.equal(loaded.weak, computed.weak);
        assert.equal(loaded.estimate.sampleSize, sampleSize);
        assert.equal(loaded.estimate.confidence, confidence);
        assert.equal(loaded.estimate.low, low);
        assert.equal(loaded.estimate.high, high);
      }
      assert.equal(fairPriceOf({ ...original, fairPriceMad: 100000, fairPriceMeta: null }).weak, true);
    });

    await t.test("live SQL/search/facets agree with displayed trust after seller verification", async () => {
      // The founder case is in here on purpose: the seller component is the only
      // one the founder flag may fill, and SQL and TypeScript have to agree on it.
      for (const [verified, founder] of [[false, false], [true, false], [false, true], [true, true], [false, false]]) {
        await db.query("UPDATE users SET id_verified=$2, founder=$3 WHERE id=$1", [userId, verified, founder]);
        const listing = (await getListingBySlug(slug))!.listing;
        const vehicle = rowToVehicle(listing);
        const expected = trustScore(vehicle, (await sellerOf(ref))!).score;
        assert.equal(listing.trust_score, expected);
        assert((await searchListings({ trustMin: expected })).rows.some((r) => r.ref === ref));
        assert(!(await searchListings({ trustMin: expected + 1 })).rows.some((r) => r.ref === ref));
        await facetCounts({ trustMin: expected }); // validates all shared facet SQL paths
      }
    });

    await t.test("SQL trust parity across disclosure, evidence and expiry boundaries", async () => {
      for (let i = 0; i < 32; i++) {
        await db.query(`UPDATE listings SET photo_count=$2, has_video=$3, owners=$4, service_book=$5,
          papers_ok=$6, vin_checked=$7, inspected=$8, accident_declared=$9,
          unpaid_vignette=$10, unpaid_fines=$11, under_lien=$12, technical_control=$13::date,
          description=$14, equipment=$15, price_mad=$16, fair_price_mad=100000,
          fair_price_meta=$17::jsonb WHERE ref=$1`, [
          ref, i % 9, i % 2 === 0, i % 5 + 1, i % 3 === 0, i % 2 === 1, i % 3 === 1,
          i % 4 === 0, i % 3 === 2, i % 2 === 0, i % 5 === 0, i % 7 === 0,
          i % 2 ? "2020-01-01" : "2035-12-31", "🚗".repeat(i % 2 ? 130 : 230),
          Array.from({ length: i % 10 }, (_, n) => `item-${n}`), [86000, 95500, 100000, 104500, 114000][i % 5],
          JSON.stringify({ low: 90000, high: 110000, confidence: i % 2 ? 0.4 : 0.8, sampleSize: i % 5 }),
        ]);
        const listing = (await getListingBySlug(slug))!.listing;
        assert.equal(listing.trust_score, trustScore(rowToVehicle(listing)).score, `case ${i}`);
      }
    });

    await t.test("an OTP is consumed once under concurrent requests; attempts stay capped", async () => {
      const add = async (id: string, attempts = 0) => db.query(
        "INSERT INTO otp_codes(identifier, code_hash, attempts, expires_at) VALUES ($1,$2,$3,now()+interval '10 minutes')",
        [id, hash("123456"), attempts],
      );
      await add("once@example.test");
      const results = await Promise.all(Array.from({ length: 8 }, () => consumeOtp("once@example.test", "123456")));
      assert.equal(results.filter((r) => r === "OK").length, 1);
      await add("attempts@example.test", 4);
      const guesses = await Promise.all(Array.from({ length: 10 }, () => consumeOtp("attempts@example.test", "000000")));
      assert.equal(guesses.filter((r) => r === "BAD_CODE").length, 1);
      assert.equal(guesses.filter((r) => r === "TOO_MANY_ATTEMPTS").length, 9);
      await add("old@example.test");
      await add("old@example.test");
      assert.equal(await consumeOtp("old@example.test", "123456"), "OK");
      assert.equal(await consumeOtp("old@example.test", "123456"), "CODE_EXPIRED");
      await add("admin:admin@example.test");
      const adminResults = await Promise.all([consumeOtp("admin:admin@example.test", "123456"), consumeOtp("admin:admin@example.test", "123456")]);
      assert.equal(adminResults.filter((r) => r === "OK").length, 1);
    });

    await t.test("bad logins do not lock a different source or valid admin credentials", async () => {
      for (let i = 0; i < 12; i++) await startAdminLogin("unknown@example.test", "wrong", "attacker");
      const quiet = mock.method(console, "log", () => {});
      try {
        assert.equal((await startAdminLogin("admin@example.test", "review-test-password", "legitimate")).ok, true);
        for (let i = 0; i < 12; i++) await startAdminLogin("admin@example.test", "wrong", "attacker");
        assert.equal((await startAdminLogin("admin@example.test", "review-test-password", "legitimate")).ok, true);
      } finally { quiet.mock.restore(); }
      const limits = await Promise.all(Array.from({ length: 10 }, () => takeRateLimit("concurrent-test", 3, 60)));
      assert.equal(limits.filter(Boolean).length, 3);
      assert.equal(await takeRateLimit("different-source", 3, 60), true);
      delete process.env.VERCEL;
      assert.equal(adminRequestSource(new Request("http://localhost", { headers: { "x-vercel-forwarded-for": "1.2.3.4" } })), null);
    });
  } finally {
    cookieMock.mock.restore();
    globalThis.__triqPool = undefined;
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
    await db.close();
  }
});

test("chat receives an intervening message after send and deduplicates poll/ack races", () => {
  const message = (id: string, mine = false) => ({ id, body: id, mine, created_at: "2026-09-08T10:00:00Z" });
  const feed = new MessageFeed("first-thread");
  feed.receive([message("100")]);
  feed.addPending({ ...message("temp", true), pending: true });
  feed.acknowledge("temp", message("102", true));
  assert.equal(feed.cursor, "100");
  feed.receive([message("101"), message("102", true)]);
  assert.deepEqual(feed.snapshot().map((m) => m.id), ["100", "101", "102"]);
  feed.addPending({ ...message("temp2", true), pending: true });
  feed.receive([message("103", true)]);
  feed.acknowledge("temp2", message("103", true));
  assert.equal(feed.snapshot().filter((m) => m.id === "103").length, 1);
  const other = new MessageFeed("other-thread");
  other.receive([message("500")]);
  feed.receive([message("104")]);
  assert.deepEqual(other.snapshot().map((m) => m.id), ["500"]);
});
