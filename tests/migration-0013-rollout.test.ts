import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { unaccent } from "@electric-sql/pglite/contrib/unaccent";

test("0013 preserves logged admin inspection and archives generated control dates", async () => {
  const db = new PGlite({ extensions: { pg_trgm, unaccent } });
  try {
    const files = readdirSync("db/migrations").filter((f) => f.endsWith(".sql")).sort();
    for (const file of files.filter((f) => !f.startsWith("0013")))
      await db.exec(readFileSync(`db/migrations/${file}`, "utf8"));

    await db.exec(`
      INSERT INTO users (id, email, name, city, onboarded, member_since)
      VALUES ('00000000-0000-4000-8000-000000000001', 'seller@example.test', 'Seller', 'casablanca', true, CURRENT_DATE);

      INSERT INTO listings (ref, slug, seller_id, kind, make, model, year, km, price_mad, fuel, gearbox, body,
        fiscal_power, city, condition, inspected, technical_control)
      VALUES
        ('admin-approved', 'admin-approved', '00000000-0000-4000-8000-000000000001', 'car', 'Renault', 'Clio', 2018,
          120000, 100000, 'diesel', 'manuelle', 'citadine', 6, 'casablanca', 'bon', true, '2027-09-09'),
        ('seller-claim', 'seller-claim', '00000000-0000-4000-8000-000000000001', 'car', 'Renault', 'Clio', 2019,
          110000, 110000, 'diesel', 'manuelle', 'citadine', 6, 'casablanca', 'bon', true, '2027-01-01');

      INSERT INTO admin_log (email, action, target)
      VALUES ('admin@example.test', 'listing:inspect', 'admin-approved');
    `);

    await db.exec(readFileSync("db/migrations/0013_review_security_trust.sql", "utf8"));

    const { rows } = await db.query<{
      ref: string;
      inspected: boolean;
      seller_inspection_claimed: boolean;
      technical_control: string | null;
      legacy_technical_control: string | null;
    }>(`SELECT ref, inspected, seller_inspection_claimed,
              technical_control::text, legacy_technical_control::text
         FROM listings WHERE ref IN ('admin-approved','seller-claim') ORDER BY ref`);

    const approved = rows.find((r) => r.ref === "admin-approved")!;
    assert.equal(approved.inspected, true);
    assert.equal(approved.seller_inspection_claimed, false);
    assert.equal(approved.technical_control, null);
    assert.equal(approved.legacy_technical_control, "2027-09-09");

    const claim = rows.find((r) => r.ref === "seller-claim")!;
    assert.equal(claim.inspected, false);
    assert.equal(claim.seller_inspection_claimed, true);
    assert.equal(claim.technical_control, null);
    assert.equal(claim.legacy_technical_control, "2027-01-01");
  } finally {
    await db.close();
  }
});
